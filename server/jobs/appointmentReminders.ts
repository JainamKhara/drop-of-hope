import cron from "node-cron";
import type { ScheduledTask } from "node-cron";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import {
  sendBookingConfirmationEmail,
  sendReminderEmail,
} from "../services/emailService";

let supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (!supabase) {
    const supabaseUrl =
      process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || "";

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error(
        "Missing Supabase configuration. Set SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables.",
      );
    }

    supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return supabase;
}

interface AppointmentWithRelations {
  id: string;
  donor_id: string;
  drive_id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  confirmation_email_sent_at?: string | null;
  reminder_1day_sent_at?: string | null;
  reminder_1hour_sent_at?: string | null;
  donors: { id: string; name: string; email: string } | Array<{ id: string; name: string; email: string }>;
  drives: { name: string; location: string } | Array<{ name: string; location: string }>;
}

interface CreateNotificationPayload {
  donor_id: string;
  type: string;
  title: string;
  message: string;
  priority: "low" | "medium" | "high";
  action_url?: string;
  is_read: boolean;
}

const createNotificationInDB = async (
  notification: CreateNotificationPayload,
) => {
  try {
    const { data, error } = await getSupabase()
      .from("notifications")
      .insert([notification])
      .select();

    if (error) {
      console.error("Error creating notification in DB:", error);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error creating notification:", error);
    return false;
  }
};

const sendReminderNotifications = async () => {
  try {
    const now = new Date();

    // Calculate time windows
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const tomorrowEnd = new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000);

    const inOneHour = new Date(now);
    inOneHour.setHours(inOneHour.getHours() + 1);
    const inOneHourEnd = new Date(inOneHour.getTime() + 60 * 60 * 1000);

    const appointmentFields = `
      id,
      donor_id,
      drive_id,
      appointment_date,
      appointment_time,
      status,
      confirmation_email_sent_at,
      reminder_1day_sent_at,
      reminder_1hour_sent_at,
      donors (id, name, email),
      drives (name, location)
    `;

    // Fetch scheduled appointments with related data
    let { data: appointments, error } = await getSupabase()
      .from("appointments")
      .select(appointmentFields)
      .in("status", ["scheduled", "confirmed"]);

    // If the enum doesn't support 'confirmed' yet, PostgREST returns a 22P02 error
    if (error && error.code === "22P02") {
      const fallback = await getSupabase()
        .from("appointments")
        .select(appointmentFields)
        .eq("status", "scheduled");
      
      appointments = fallback.data;
      error = fallback.error;
    }

    if (error) {
      console.error("Error fetching appointments:", error);
      return { processed: 0, error };
    }

    if (!appointments || appointments.length === 0) {
      console.log("No scheduled or confirmed appointments found");
      return { processed: 0, error: null };
    }

    let processed = 0;

    for (const apt of appointments as AppointmentWithRelations[]) {
      try {
        const aptDateTime = new Date(
          `${apt.appointment_date}T${apt.appointment_time}`,
        );

        // Get donor and drive info
        const donorInfo = Array.isArray(apt.donors) ? apt.donors[0] : apt.donors;
        const driveInfo = Array.isArray(apt.drives)
          ? apt.drives[0]
          : apt.drives;

        if (!donorInfo?.id || !donorInfo?.email || !driveInfo?.name) {
          console.warn(
            `Skipping appointment ${apt.id}: missing donor or drive info`,
          );
          continue;
        }

        // Check for 1-day reminder
        if (
          aptDateTime >= tomorrow &&
          aptDateTime < tomorrowEnd &&
          !apt.reminder_1day_sent_at
        ) {
          console.log(
            `Sending 1-day reminder for appointment ${apt.id} to ${donorInfo.email}`,
          );

          const emailSent = await sendReminderEmail(
            donorInfo.email,
            donorInfo.name || "Donor",
            driveInfo.name,
            driveInfo.location || "",
            apt.appointment_date,
            apt.appointment_time,
            "1_day",
          );

          if (emailSent) {
            // Create in-app notification
            await createNotificationInDB({
              donor_id: donorInfo.id,
              type: "reminder",
              title: "Donation Appointment Reminder",
              message: `Hi ${donorInfo.name || "Donor"}, reminder: your blood donation appointment is tomorrow at ${apt.appointment_time} at ${driveInfo.name}. Please arrive 15 minutes early.`,
              priority: "high",
              action_url: "/my-appointments",
              is_read: false,
            });

            // Update reminder sent timestamp
            await getSupabase()
              .from("appointments")
              .update({ reminder_1day_sent_at: new Date().toISOString() })
              .eq("id", apt.id);

            processed++;
          }
        }

        // Check for 1-hour reminder
        if (
          aptDateTime >= inOneHour &&
          aptDateTime < inOneHourEnd &&
          !apt.reminder_1hour_sent_at
        ) {
          console.log(
            `Sending 1-hour reminder for appointment ${apt.id} to ${donorInfo.email}`,
          );

          const emailSent = await sendReminderEmail(
            donorInfo.email,
            donorInfo.name || "Donor",
            driveInfo.name,
            driveInfo.location || "",
            apt.appointment_date,
            apt.appointment_time,
            "1_hour",
          );

          if (emailSent) {
            // Create in-app notification
            await createNotificationInDB({
              donor_id: donorInfo.id,
              type: "reminder",
              title: "Appointment in 1 Hour",
              message: `Hi ${donorInfo.name || "Donor"}, your blood donation appointment is in 1 hour at ${apt.appointment_time}. See you soon at ${driveInfo.name}!`,
              priority: "high",
              action_url: "/my-appointments",
              is_read: false,
            });

            // Update reminder sent timestamp
            await getSupabase()
              .from("appointments")
              .update({ reminder_1hour_sent_at: new Date().toISOString() })
              .eq("id", apt.id);

            processed++;
          }
        }
      } catch (err) {
        console.error(`Error processing appointment ${apt.id}:`, err);
      }
    }

    console.log(`Appointment reminder job completed. Processed: ${processed}`);
    return { processed, error: null };
  } catch (error) {
    console.error("Error in sendReminderNotifications:", error);
    return { processed: 0, error };
  }
};

let job: ScheduledTask | null = null;

export const startAppointmentReminderJob = () => {
  if (job) {
    console.log("Appointment reminder job already running");
    return;
  }

  const isEnabled =
    process.env.APPOINTMENT_REMINDER_JOB_ENABLED !== "false";

  if (!isEnabled) {
    console.log("Appointment reminder job is disabled");
    return;
  }

  // Run every minute to check for reminders
  job = cron.schedule("* * * * *", () => {
    console.log("Running appointment reminder job...");
    sendReminderNotifications().catch((error) => {
      console.error("Error running appointment reminder job:", error);
    });
  });

  console.log("Appointment reminder job started (runs every minute)");
};

export const stopAppointmentReminderJob = () => {
  if (job) {
    job.stop();
    job = null;
    console.log("Appointment reminder job stopped");
  }
};
