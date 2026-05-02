import { Request, Response } from "express";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import {
  sendAcceptanceEmail,
  sendCompletionEmail,
  sendBadgeEmail,
  sendNoShowEmail,
} from "../services/emailService";

let supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (!supabase) {
    const supabaseUrl =
      process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || "";
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration.");
    }
    supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return supabase;
}

// ─── Helper: create in-app notification ──────────────────────────────────────
const createNotification = async (payload: {
  donor_id: string;
  type: string;
  title: string;
  message: string;
  priority: "low" | "medium" | "high";
  action_url?: string;
}) => {
  await getSupabase()
    .from("notifications")
    .insert([{ ...payload, is_read: false }]);
};

// ─── POST /api/appointments/:id/accept ───────────────────────────────────────
export const handleAcceptAppointment = async (
  req: Request,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const { hospital_name } = req.body;

    // Fetch appointment with donor + drive info
    const { data: apt, error: aptErr } = await getSupabase()
      .from("appointments")
      .select(
        `id, donor_id, appointment_date, appointment_time, status,
         donors (id, name, email, blood_type),
         drives (id, name, location, address)`,
      )
      .eq("id", id)
      .single();

    if (aptErr || !apt) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    if (apt.status === "confirmed" || apt.status === "completed") {
      return res.status(400).json({ error: "Appointment already processed" });
    }

    // Update status to confirmed (try-catch or check error to handle missing enum value)
    const { error: updateErr } = await getSupabase()
      .from("appointments")
      .update({
        status: "confirmed",
        acceptance_email_sent_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateErr) {
      console.warn("Failed to update status to 'confirmed', falling back to updating timestamp only. Error:", updateErr.message);
      
      // Fallback: update timestamp only if 'confirmed' enum value is missing
      const { error: fallbackErr } = await getSupabase()
        .from("appointments")
        .update({
          acceptance_email_sent_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);
        
      if (fallbackErr) throw fallbackErr;
    }

    const donor = Array.isArray(apt.donors) ? apt.donors[0] : apt.donors;
    const drive = Array.isArray(apt.drives) ? apt.drives[0] : apt.drives;

    if (!donor?.email || !drive?.name) {
      return res.status(200).json({ success: true, emailSent: false });
    }

    // Send acceptance email
    const hospitalName = hospital_name || "Drop of Hope Partner Hospital";
    const location = drive.location || drive.address || "";

    const emailSent = await sendAcceptanceEmail(
      donor.email,
      donor.name || "Donor",
      drive.name,
      location,
      apt.appointment_date,
      apt.appointment_time,
      hospitalName,
    );

    // Create in-app notification
    await createNotification({
      donor_id: donor.id,
      type: "appointment",
      title: "🎉 Appointment Confirmed!",
      message: `${hospitalName} has accepted your appointment for ${drive.name} on ${apt.appointment_date} at ${apt.appointment_time}. Get ready to save lives!`,
      priority: "high",
      action_url: "/my-appointments",
    });

    return res.status(200).json({
      success: true,
      emailSent,
      message: "Appointment accepted and donor notified",
    });
  } catch (error) {
    console.error("Error accepting appointment:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// ─── POST /api/appointments/:id/complete ─────────────────────────────────────
export const handleMarkDonationComplete = async (
  req: Request,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const POINTS_PER_DONATION = 100;

    // Fetch appointment
    const { data: apt, error: aptErr } = await getSupabase()
      .from("appointments")
      .select(
        `id, donor_id, appointment_date, appointment_time, status,
         donors (id, name, email, blood_type, points),
         drives (id, name, location, hospital_id)`,
      )
      .eq("id", id)
      .single();

    if (aptErr || !apt) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    if (apt.status === "completed") {
      return res.status(400).json({ error: "Donation already marked as complete" });
    }

    const donor = Array.isArray(apt.donors) ? apt.donors[0] : apt.donors;
    const drive = Array.isArray(apt.drives) ? apt.drives[0] : apt.drives;

    if (!donor?.id) {
      return res.status(400).json({ error: "Donor info missing" });
    }

    // 1. Update appointment status to completed
    console.log(`Marking appointment ${id} as complete...`);
    const { error: updateAptError } = await getSupabase()
      .from("appointments")
      .update({
        status: "completed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    
    if (updateAptError) {
      console.error("Error updating appointment status:", updateAptError);
      throw updateAptError;
    }

    // 2. Create donation record
    const donationDate = apt.appointment_date || new Date().toISOString().split("T")[0];
    const { data: donation, error: donationErr } = await getSupabase()
      .from("donations")
      .insert([{
        donor_id: donor.id,
        drive_id: drive?.id || null,
        hospital_id: drive?.hospital_id || null,
        donation_date: donationDate,
        blood_type: donor.blood_type || null,
        quantity_ml: 450,
        points_earned: POINTS_PER_DONATION,
        status: "completed",
      }])
      .select()
      .single();

    if (donationErr) {
      console.error("Error creating donation record:", donationErr);
    } else {
      console.log("Donation record created:", donation.id);
      
      // 3. Update blood inventory for the hospital
      if (drive?.hospital_id && donor.blood_type) {
        console.log(`Updating blood inventory for hospital ${drive.hospital_id}, blood type ${donor.blood_type}`);
        try {
          // Check if inventory item exists
          const { data: inventoryItem, error: invFetchError } = await getSupabase()
            .from("blood_inventory")
            .select("*")
            .eq("hospital_id", drive.hospital_id)
            .eq("blood_type", donor.blood_type)
            .order("expiry_date", { ascending: false })
            .limit(1)
            .maybeSingle();
          
          if (inventoryItem && !invFetchError) {
            // Increment existing
            await getSupabase()
              .from("blood_inventory")
              .update({ 
                units_available: (inventoryItem.units_available || 0) + 1,
                updated_at: new Date().toISOString()
              })
              .eq("id", inventoryItem.id);
            console.log("Incremented existing inventory item");
          } else {
            // Create new
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + 42); // 42 days for whole blood
            
            await getSupabase()
              .from("blood_inventory")
              .insert([{
                hospital_id: drive.hospital_id,
                blood_type: donor.blood_type,
                units_available: 1,
                units_reserved: 0,
                expiry_date: expiryDate.toISOString().split("T")[0],
                donation_id: donation.id,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }]);
            console.log("Created new inventory item");
          }
        } catch (invErr) {
          console.error("Failed to update inventory:", invErr);
        }
      }
    }

    // 4. Add points to donor + update last_donation_date + recalculate level
    const currentPoints = donor.points || 0;
    const newPoints = currentPoints + POINTS_PER_DONATION;
    let newLevel = 1;
    if (newPoints >= 5000) newLevel = 6;
    else if (newPoints >= 2000) newLevel = 5;
    else if (newPoints >= 1000) newLevel = 4;
    else if (newPoints >= 500) newLevel = 3;
    else if (newPoints >= 100) newLevel = 2;

    await getSupabase()
      .from("donors")
      .update({
        points: newPoints,
        level: newLevel,
        last_donation_date: donationDate,
        updated_at: new Date().toISOString(),
      })
      .eq("id", donor.id);

    // 4. Get total donation count for this donor
    const { count: totalDonations } = await getSupabase()
      .from("donations")
      .select("*", { count: "exact", head: true })
      .eq("donor_id", donor.id)
      .eq("status", "completed");

    // 5. Send completion email
    let emailSent = false;
    if (donor.email) {
      emailSent = await sendCompletionEmail(
        donor.email,
        donor.name || "Donor",
        drive?.name || "Blood Drive",
        donationDate,
        donor.blood_type || "Unknown",
        POINTS_PER_DONATION,
        totalDonations || 1,
      );
    }

    // 6. Create in-app notification for points
    await createNotification({
      donor_id: donor.id,
      type: "info",
      title: "🌟 Donation Completed! +100 Points",
      message: `Amazing! Your blood donation at ${drive?.name || "the blood drive"} has been recorded. You earned ${POINTS_PER_DONATION} points and your new total is ${newPoints} points. You've now saved ${(totalDonations || 1) * 3} lives!`,
      priority: "high",
      action_url: "/my-appointments",
    });

    // 7. Check and award badges
    const badgesToCheck = [
      { name: "First Drop", description: "Completed your first blood donation", threshold: 1, type: "donations" },
      { name: "Bronze Lifesaver", description: "Completed 3 blood donations", threshold: 3, type: "donations" },
      { name: "Silver Lifesaver", description: "Completed 5 blood donations", threshold: 5, type: "donations" },
      { name: "Hero", description: "Completed 10 blood donations", threshold: 10, type: "donations" },
      { name: "Champion", description: "Completed 20 blood donations", threshold: 20, type: "donations" },
      { name: "Legendary Donor", description: "Completed 50 blood donations", threshold: 50, type: "donations" },
      { name: "Century Club", description: "Earned over 1,000 points", threshold: 1000, type: "points" },
    ];

    for (const badge of badgesToCheck) {
      const isEligible = badge.type === "donations" 
        ? (totalDonations || 0) >= badge.threshold 
        : newPoints >= badge.threshold;

      if (isEligible) {
        // Check if already awarded
        const { data: existing } = await getSupabase()
          .from("rewards")
          .select("id")
          .eq("donor_id", donor.id)
          .eq("badge_name", badge.name)
          .maybeSingle();

        if (!existing) {
          await getSupabase()
            .from("rewards")
            .insert([{
              donor_id: donor.id,
              badge_name: badge.name,
              badge_description: badge.description,
              points_threshold: badge.type === "points" ? badge.threshold : null,
              earned_at: new Date().toISOString()
            }]);

          // Notify about new badge
          await createNotification({
            donor_id: donor.id,
            type: "info",
            title: `🏆 New Badge Unlocked: ${badge.name}`,
            message: `Congratulations! You've earned the "${badge.name}" badge for your incredible contribution.`,
            priority: "high",
            action_url: "/profile?tab=achievements",
          });

          // Send badge email
          if (donor.email) {
            await sendBadgeEmail(
              donor.email,
              donor.name || "Donor",
              badge.name,
              badge.description
            ).catch(err => console.error("Error sending badge email:", err));
          }
        }
      }
    }

    return res.status(200).json({
      success: true,
      emailSent,
      pointsAwarded: POINTS_PER_DONATION,
      newTotal: newPoints,
      newLevel,
      totalDonations: totalDonations || 1,
    });
  } catch (error) {
    console.error("Error completing donation:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// ─── POST /api/appointments/:id/no-show ──────────────────────────────────────
export const handleNoShowAppointment = async (
  req: Request,
  res: Response,
) => {
  try {
    const { id } = req.params;

    // Fetch appointment with donor info
    const { data: apt, error: aptErr } = await getSupabase()
      .from("appointments")
      .select(
        `id, donor_id, appointment_date, appointment_time, status,
         donors (id, name, email),
         drives (id, name)`,
      )
      .eq("id", id)
      .single();

    if (aptErr || !apt) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    if (apt.status === "completed" || apt.status === "no_show") {
      return res.status(400).json({ error: "Appointment already processed" });
    }

    // 1. Update status to no_show
    const { error: updateErr } = await getSupabase()
      .from("appointments")
      .update({
        status: "no_show",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateErr) throw updateErr;

    const donor = Array.isArray(apt.donors) ? apt.donors[0] : apt.donors;
    const drive = Array.isArray(apt.drives) ? apt.drives[0] : apt.drives;

    // 2. Send no-show email
    let emailSent = false;
    if (donor?.email) {
      emailSent = await sendNoShowEmail(
        donor.email,
        donor.name || "Donor",
        drive?.name || "Blood Drive",
        apt.appointment_date,
        apt.appointment_time,
      );
    }

    // 3. Create in-app notification
    if (donor?.id) {
      await createNotification({
        donor_id: donor.id,
        type: "appointment",
        title: "📅 Missed Appointment",
        message: `We missed you at ${drive?.name || "the blood drive"} today. Don't worry, you can easily book a new appointment whenever you're ready!`,
        priority: "medium",
        action_url: "/drives",
      });
    }

    return res.status(200).json({
      success: true,
      emailSent,
      message: "Appointment marked as no-show and donor notified",
    });
  } catch (error) {
    console.error("Error marking no-show:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
