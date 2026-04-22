import { Request, Response } from "express";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

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

interface DonorInfo {
  id: string;
  name: string;
  clerk_user_id?: string;
}

interface DriveInfo {
  name: string;
  location: string;
}

interface AppointmentWithRelations {
  id: string;
  donor_id: string;
  drive_id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  donors: DonorInfo[];
  drives: DriveInfo[];
}

export const sendUrgentBloodNeedNotification = async (
  bloodType: string,
  hospitalName: string,
  unitsNeeded: number,
  urgency: "critical" | "high" | "medium",
  location?: string,
) => {
  try {
    const { data: donors, error: donorError } = await getSupabase()
      .from("donors")
      .select("id, clerk_user_id, name, email, phone, blood_type, city")
      .eq("blood_type", bloodType)
      .limit(10000); // Limit to 10k donors to prevent performance issues with large databases

    if (donorError || !donors || donors.length === 0) {
      return { notified: 0, error: donorError };
    }

    const notifications = donors.map((donor) => {
      return {
        donor_id: donor.id,
        type: "urgent",
        title: `Urgent: ${bloodType} Blood Needed!`,
        message: `${hospitalName} urgently needs ${unitsNeeded} units of ${bloodType} blood${location ? ` in ${location}` : ""}. Please consider donating at your earliest convenience.`,
        priority:
          urgency === "critical"
            ? "high"
            : urgency === "high"
              ? "medium"
              : "low",
        action_url: "/drives",
        is_read: false,
      };
    });

    if (notifications.length === 0) {
      return { notified: 0, error: null };
    }

    const { data, error } = await getSupabase()
      .from("notifications")
      .insert(notifications)
      .select();

    return { notified: data?.length || 0, error };
  } catch (error) {
    console.error("Error sending urgent blood need notification:", error);
    return { notified: 0, error };
  }
};

export const sendAppointmentReminder = async (
  donorId: string,
  donorName: string,
  driveName: string,
  location: string,
  appointmentDate: string,
  appointmentTime: string,
  reminderType: "1_day" | "1_hour",
  clerkUserId?: string,
) => {
  if (!clerkUserId) {
    return { data: null, error: "Clerk user ID required" };
  }

  try {
    const timeLabel = reminderType === "1_day" ? "tomorrow" : "in 1 hour";

    const { data, error } = await getSupabase()
      .from("notifications")
      .insert([
        {
          donor_id: donorId,
          type: "reminder",
          title: `Donation Appointment Reminder`,
          message: `Hi ${donorName}, this is a reminder about your blood donation appointment ${timeLabel}. You're scheduled to donate at ${driveName}, ${location} on ${appointmentDate} at ${appointmentTime}. Please arrive 15 minutes early.`,
          priority: "medium",
          action_url: "/my-appointments",
          is_read: false,
        },
      ])
      .select()
      .single();

    return { data, error };
  } catch (error) {
    console.error("Error sending appointment reminder:", error);
    return { data: null, error };
  }
};

export const broadcastToAllDonors = async (
  title: string,
  message: string,
  priority: "low" | "medium" | "high",
  actionUrl?: string,
  bloodTypeFilter?: string,
) => {
  try {
    let query = getSupabase().from("donors").select("id, clerk_user_id");

    if (bloodTypeFilter) {
      query = query.eq("blood_type", bloodTypeFilter);
    }

    // Limit to 100k donors to prevent performance issues
    const { data: donors, error: donorError } = await query.limit(100000);

    if (donorError || !donors || donors.length === 0) {
      return { notified: 0, error: donorError };
    }

    const notifications = donors.map((donor) => {
      return {
        donor_id: donor.id,
        type: "info",
        title,
        message,
        priority,
        action_url: actionUrl || null,
        is_read: false,
      };
    });

    if (notifications.length === 0) {
      return { notified: 0, error: null };
    }

    const { data, error } = await getSupabase()
      .from("notifications")
      .insert(notifications)
      .select();

    return { notified: data?.length || 0, error };
  } catch (error) {
    console.error("Error broadcasting to donors:", error);
    return { notified: 0, error };
  }
};

export const sendScheduledReminders = async () => {
  try {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const inOneHour = new Date(now);
    inOneHour.setHours(inOneHour.getHours() + 1);

    const { data: appointments, error } = await getSupabase()
      .from("appointments")
      .select(
        `
        id,
        donor_id,
        drive_id,
        appointment_date,
        appointment_time,
        status,
        donors (id, name, clerk_user_id),
        drives (name, location)
      `,
      )
      .eq("status", "scheduled");

    if (error || !appointments) {
      return { processed: 0, error };
    }

    let processed = 0;

    for (const apt of appointments as AppointmentWithRelations[]) {
      const aptDateTime = new Date(
        `${apt.appointment_date}T${apt.appointment_time}`,
      );
      const donorInfo = Array.isArray(apt.donors) ? apt.donors[0] : apt.donors;

      // Ensure donorInfo and drives are valid before using them
      if (!donorInfo?.id || !donorInfo?.clerk_user_id || !apt.drives?.[0]) continue;

      if (
        aptDateTime >= tomorrow &&
        aptDateTime < new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000)
      ) {
        await sendAppointmentReminder(
          donorInfo.id,
          donorInfo?.name || "Donor",
          apt.drives?.[0]?.name || "Blood Drive",
          apt.drives?.[0]?.location || "",
          apt.appointment_date,
          apt.appointment_time,
          "1_day",
          donorInfo.clerk_user_id,
        );
        processed++;
      } else if (
        aptDateTime >= inOneHour &&
        aptDateTime < new Date(inOneHour.getTime() + 60 * 60 * 1000)
      ) {
        await sendAppointmentReminder(
          donorInfo.id,
          donorInfo?.name || "Donor",
          apt.drives?.[0]?.name || "Blood Drive",
          apt.drives?.[0]?.location || "",
          apt.appointment_date,
          apt.appointment_time,
          "1_hour",
          donorInfo.clerk_user_id,
        );
        processed++;
      }
    }

    return { processed, error: null };
  } catch (error) {
    console.error("Error in scheduled reminders:", error);
    return { processed: 0, error };
  }
};

export const handleSendUrgentNotification = async (
  req: Request,
  res: Response,
) => {
  try {
    const { bloodType, hospitalName, unitsNeeded, urgency, location } =
      req.body;

    if (!bloodType || !hospitalName || !unitsNeeded) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const result = await sendUrgentBloodNeedNotification(
      bloodType,
      hospitalName,
      unitsNeeded,
      urgency || "high",
      location,
    );

    // Return error if notification sending failed
    if (result.error) {
      res.status(500).json({ error: "Failed to send notification", details: result.error });
      return;
    }

    res.json({ success: true, ...result });
  } catch (error) {
    console.error("Error in send urgent notification:", error);
    res.status(500).json({ error: "Failed to send notification" });
  }
};

export const handleBroadcastNotification = async (
  req: Request,
  res: Response,
) => {
  try {
    const { title, message, priority, actionUrl, bloodTypeFilter } = req.body;

    if (!title || !message) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    const result = await broadcastToAllDonors(
      title,
      message,
      priority || "medium",
      actionUrl,
      bloodTypeFilter,
    );

    // Return error if broadcast failed
    if (result.error) {
      res.status(500).json({ error: "Failed to broadcast notification", details: result.error });
      return;
    }

    res.json({ success: true, ...result });
  } catch (error) {
    console.error("Error in broadcast notification:", error);
    res.status(500).json({ error: "Failed to broadcast notification" });
  }
};

export const handleRunScheduledReminders = async (
  _req: Request,
  res: Response,
) => {
  try {
    const result = await sendScheduledReminders();

    // Return error if scheduled reminders failed
    if (result.error) {
      res.status(500).json({ error: "Failed to run scheduled reminders", details: result.error });
      return;
    }

    res.json({ success: true, ...result });
  } catch (error) {
    console.error("Error running scheduled reminders:", error);
    res.status(500).json({ error: "Failed to run scheduled reminders" });
  }
};
