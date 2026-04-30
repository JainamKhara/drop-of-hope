import { Request, Response } from "express";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { sendBookingConfirmationEmail } from "../services/emailService";

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

interface CreateAppointmentRequest {
  donor_id: string;
  drive_id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  notes?: string;
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

export const handleCreateAppointment = async (
  req: Request,
  res: Response,
) => {
  try {
    const { donor_id, drive_id, appointment_date, appointment_time, status, notes }: CreateAppointmentRequest = req.body;

    // Validate required fields
    if (!donor_id || !drive_id || !appointment_date || !appointment_time) {
      return res.status(400).json({
        error: "Missing required fields: donor_id, drive_id, appointment_date, appointment_time",
      });
    }

    // Fetch donor info
    const { data: donor, error: donorError } = await getSupabase()
      .from("donors")
      .select("id, name, email")
      .eq("id", donor_id)
      .single();

    if (donorError || !donor) {
      return res.status(404).json({ error: "Donor not found" });
    }

    // Fetch drive info
    const { data: drive, error: driveError } = await getSupabase()
      .from("drives")
      .select("id, name, location, address")
      .eq("id", drive_id)
      .single();

    if (driveError || !drive) {
      return res.status(404).json({ error: "Drive not found" });
    }

    // Create appointment
    const appointmentData = {
      donor_id,
      drive_id,
      appointment_date,
      appointment_time,
      status: status || "scheduled",
      notes: notes || null,
    };

    const { data: appointment, error: appointmentError } = await getSupabase()
      .from("appointments")
      .insert([appointmentData])
      .select()
      .single();

    if (appointmentError || !appointment) {
      return res.status(500).json({
        error: "Failed to create appointment",
        details: appointmentError,
      });
    }

    // Send confirmation email
    const emailSent = await sendBookingConfirmationEmail(
      donor.email,
      donor.name || "Donor",
      drive.name,
      drive.location || drive.address || "",
      appointment_date,
      appointment_time,
    );

    if (emailSent) {
      // Create in-app confirmation notification
      await createNotificationInDB({
        donor_id: donor.id,
        type: "confirmation",
        title: "Blood Donation Appointment Confirmed",
        message: `Your appointment has been confirmed for ${appointment_date} at ${appointment_time} at ${drive.name}. A confirmation email has been sent to ${donor.email}.`,
        priority: "high",
        action_url: "/my-appointments",
        is_read: false,
      });

      // Update confirmation email sent timestamp
      await getSupabase()
        .from("appointments")
        .update({ confirmation_email_sent_at: new Date().toISOString() })
        .eq("id", appointment.id);
    }

    return res.status(201).json({
      success: true,
      appointment,
      emailSent,
      message: "Appointment created successfully",
    });
  } catch (error) {
    console.error("Error creating appointment:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
