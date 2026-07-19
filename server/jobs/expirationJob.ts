/**
 * Expiration Job
 *
 * Runs every 5 minutes and automatically:
 *  1. Deactivates drives whose end_date+end_time has passed (is_active → false)
 *  2. Marks appointments as no_show if their appointment_date+time has passed
 *     by more than 2 hours and they are still scheduled/confirmed
 *
 * Sends in-app notifications to donors when their appointment expires.
 */

import cron from "node-cron";
import type { ScheduledTask } from "node-cron";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { sendNoShowEmail } from "../services/emailService";

let supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (!supabase) {
    const supabaseUrl =
      process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || "";

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error(
        "Missing Supabase configuration. Set SUPABASE_URL and SUPABASE_SERVICE_KEY.",
      );
    }

    supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return supabase;
}

// ─── Helper ──────────────────────────────────────────────────────────────────

/** Parse a date string (YYYY-MM-DD) + time string (HH:MM or HH:MM:SS) into a Date */
function parseDateTime(date: string, time: string): Date {
  // Normalise time to HH:MM:SS
  const timePart = time.length === 5 ? `${time}:00` : time;
  return new Date(`${date}T${timePart}`);
}

/** 
 * Helper to wrap async operations with simple retry logic
 * Useful for handling transient "fetch failed" / "socket closed" errors
 */
async function withRetry(
  operation: () => any,
  retries = 3,
  delay = 1000
): Promise<any> {
  const result = await operation();
  
  // Supabase returns errors in the 'error' property rather than throwing
  const error = result?.error;
  
  if (error) {
    const errorMessage = error.message?.toLowerCase() || "";
    const isNetworkError = 
      errorMessage.includes("fetch failed") || 
      errorMessage.includes("socket") ||
      errorMessage.includes("timeout") ||
      error.code === "UND_ERR_CONNECT_TIMEOUT" ||
      error.code === "ECONNRESET";

    if (retries > 0 && isNetworkError) {
      console.warn(`[ExpirationJob] Retrying operation due to network error: ${errorMessage}. (${retries} left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      // Force a fresh connection on retry
      supabase = null;
      return withRetry(operation, retries - 1, delay * 2);
    }
  }
  
  return result;
}

// ─── 1. Expire Drives ─────────────────────────────────────────────────────────

const expireDrives = async (): Promise<{ expired: number; error: any }> => {
  try {
    const now = new Date();
    
    // Fetch active drives with retry
    const { data: drives, error: fetchErr } = await withRetry(() =>  
      getSupabase()
        .from("drives")
        .select("id, name, end_date, end_time")
        .eq("is_active", true)
    );

    if (fetchErr) {
      console.error("[ExpirationJob] Error fetching active drives:", fetchErr);
      return { expired: 0, error: fetchErr };
    }

    if (!drives || drives.length === 0) {
      return { expired: 0, error: null };
    }

    // Find drives where end_date+end_time < now
    const expiredIds: string[] = [];
    for (const drive of drives) {
      try {
        const endDT = parseDateTime(drive.end_date, drive.end_time || "23:59:59");
        if (endDT < now) {
          expiredIds.push(drive.id);
        }
      } catch {
        // Malformed date — skip
      }
    }

    if (expiredIds.length === 0) {
      return { expired: 0, error: null };
    }

    // Bulk deactivate with retry
    const { error: updateErr } = await withRetry(() => 
      getSupabase()
        .from("drives")
        .update({ is_active: false, updated_at: now.toISOString() })
        .in("id", expiredIds)
    );

    if (updateErr) {
      console.error("[ExpirationJob] Error deactivating drives:", updateErr);
      return { expired: 0, error: updateErr };
    }

    console.log(
      `[ExpirationJob] Deactivated ${expiredIds.length} expired drive(s): ${expiredIds.join(", ")}`,
    );
    return { expired: expiredIds.length, error: null };
  } catch (err) {
    console.error("[ExpirationJob] Unexpected error in expireDrives:", err);
    return { expired: 0, error: err };
  }
};

const expireAppointments = async (): Promise<{
  expired: number;
  error: any;
}> => {
  try {
    const now = new Date();

    // Grace period: mark as no_show only 2 hours AFTER the appointment time
    const gracePeriodMs = 2 * 60 * 60 * 1000;

    const appointmentFields = `
      id, donor_id, appointment_date, appointment_time, status,
      donors (id, name, email),
      drives (name)
    `;

    // Fetch scheduled appointments with retry
    // Note: DB enum only supports "scheduled" — "confirmed" is not a valid status
    const { data: appointments, error: fetchErr } = await withRetry(() =>
      getSupabase()
        .from("appointments")
        .select(appointmentFields)
        .eq("status", "scheduled")
    );

    if (fetchErr) {
      console.error(
        "[ExpirationJob] Error fetching appointments:",
        fetchErr,
      );
      return { expired: 0, error: fetchErr };
    }

    if (!appointments || appointments.length === 0) {
      return { expired: 0, error: null };
    }

    const expiredIds: string[] = [];
    const notificationRows: any[] = [];

    for (const apt of appointments as any[]) {
      try {
        const aptDT = parseDateTime(
          apt.appointment_date,
          apt.appointment_time,
        );
        const expiresAt = new Date(aptDT.getTime() + gracePeriodMs);

        if (now >= expiresAt) {
          expiredIds.push(apt.id);

          const donor = Array.isArray(apt.donors) ? apt.donors[0] : apt.donors;
          const drive = Array.isArray(apt.drives) ? apt.drives[0] : apt.drives;

          if (donor?.id) {
            notificationRows.push({
              donor_id: donor.id,
              type: "info",
              title: "Appointment Marked as No-Show",
              message: `Your appointment at ${drive?.name || "the blood drive"} on ${apt.appointment_date} at ${apt.appointment_time} has been automatically closed because it was not attended. Please rebook if you wish to donate.`,
              priority: "medium",
              action_url: "/drives",
              is_read: false,
            });

            // Send no-show email
            if (donor.email) {
              await sendNoShowEmail(
                donor.email,
                donor.name || "Donor",
                drive?.name || "Blood Drive",
                apt.appointment_date,
                apt.appointment_time
              ).catch(err => console.error("Error sending no-show email:", err));
            }
          }
        }
      } catch {
        // Malformed date — skip
      }
    }

    if (expiredIds.length === 0) {
      return { expired: 0, error: null };
    }

    // Bulk update to no_show with retry
    const { error: updateErr } = await withRetry(() => 
      getSupabase()
        .from("appointments")
        .update({
          status: "no_show",
          updated_at: now.toISOString(),
        })
        .in("id", expiredIds)
    );

    if (updateErr) {
      console.error(
        "[ExpirationJob] Error marking appointments as no_show:",
        updateErr,
      );
      return { expired: 0, error: updateErr };
    }

    // Insert notifications with retry
    if (notificationRows.length > 0) {
      await withRetry(() => 
        getSupabase().from("notifications").insert(notificationRows)
      );
    }

    console.log(
      `[ExpirationJob] Marked ${expiredIds.length} appointment(s) as no_show.`,
    );
    return { expired: expiredIds.length, error: null };
  } catch (err) {
    console.error(
      "[ExpirationJob] Unexpected error in expireAppointments:",
      err,
    );
    return { expired: 0, error: err };
  }
};

// ─── 3. Runner ────────────────────────────────────────────────────────────────

const runExpirationChecks = async () => {
  const [driveResult, apptResult] = await Promise.all([
    expireDrives(),
    expireAppointments(),
  ]);

  const total = driveResult.expired + apptResult.expired;
  if (total > 0) {
    console.log(
      `[ExpirationJob] Done — ${driveResult.expired} drive(s) expired, ${apptResult.expired} appointment(s) no_show'd.`,
    );
  }
};

// ─── 4. Cron Lifecycle ────────────────────────────────────────────────────────

let expirationCronJob: ScheduledTask | null = null;

export const startExpirationJob = () => {
  if (expirationCronJob) {
    console.log("[ExpirationJob] Already running.");
    return;
  }

  const isEnabled =
    process.env.EXPIRATION_JOB_ENABLED !== "false";

  if (!isEnabled) {
    console.log("[ExpirationJob] Disabled via EXPIRATION_JOB_ENABLED=false.");
    return;
  }

  // Run every 5 minutes: "*/5 * * * *"
  expirationCronJob = cron.schedule("*/5 * * * *", () => {
    runExpirationChecks().catch((err) =>
      console.error("[ExpirationJob] Uncaught error:", err),
    );
  });

  console.log(
    "[ExpirationJob] Started — checks every 5 minutes for expired drives & appointments.",
  );

  // Also run immediately on startup so stale data is cleaned up at boot
  runExpirationChecks().catch(() => {});
};

export const stopExpirationJob = () => {
  if (expirationCronJob) {
    expirationCronJob.stop();
    expirationCronJob = null;
    console.log("[ExpirationJob] Stopped.");
  }
};

// Export the runner for manual/HTTP triggers
export { runExpirationChecks };
