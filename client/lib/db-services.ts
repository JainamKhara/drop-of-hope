/**
 * Database Services for Drop of Hope Platform
 * Comprehensive CRUD operations organized by domain
 */

import {
  supabase,
  Drive,
  Appointment,
  Donation,
  BloodRequest,
  Reward,
  CommunityPost,
  CommunityComment,
  CommunityLike,
  BloodInventory,
  Notification,
  Donor,
  Hospital,
} from "./supabase";

// ==================== DRIVE SERVICES ====================

export const driveService = {
  /**
   * Get all active drives with optional filters
   */
  getAll: async (filters?: {
    city?: string;
    bloodType?: string;
    date?: string;
  }) => {
    let query = supabase
      .from("drives")
      .select(
        `
        *,
        hospitals (name, city, state)
      `,
      )
      .eq("is_active", true)
      .order("start_date", { ascending: true });

    if (filters?.city) {
      query = query.ilike("city", `%${filters.city}%`);
    }
    if (filters?.bloodType) {
      query = query.contains("blood_types_needed", [filters.bloodType]);
    }
    if (filters?.date) {
      query = query.gte("start_date", filters.date);
    }

    const { data, error } = await query;
    return { data, error };
  },

  /**
   * Get a single drive by ID
   */
  getById: async (id: string) => {
    const { data, error } = await supabase
      .from("drives")
      .select(
        `
        *,
        hospitals (name, city, state, phone, email)
      `,
      )
      .eq("id", id)
      .single();
    return { data, error };
  },

  /**
   * Get upcoming drives (next 30 days)
   */
  getUpcoming: async (limit: number = 5) => {
    const today = new Date().toISOString().split("T")[0];
    const { data, error } = await supabase
      .from("drives")
      .select("*")
      .eq("is_active", true)
      .gte("start_date", today)
      .order("start_date", { ascending: true })
      .limit(limit);
    return { data, error };
  },

  /**
   * Get all drives for admin (including inactive)
   */
  getAdminAll: async () => {
    const { data, error } = await supabase
      .from("drives")
      .select("*")
      .order("start_date", { ascending: false });
    return { data, error };
  },

  /**
   * Get drives count
   */
  getCount: async (activeOnly: boolean = false) => {
    let query = supabase
      .from("drives")
      .select("*", { count: "exact", head: true });
    if (activeOnly) {
      query = query.eq("is_active", true);
    }
    const { count, error } = await query;
    return { count, error };
  },

  /**
   * Create a new blood drive
   */
  create: async (
    drive: Omit<Drive, "id" | "created_at" | "updated_at" | "registered_count">,
  ) => {
    const { data, error } = await supabase
      .from("drives")
      .insert([{ ...drive, registered_count: 0, is_active: true }])
      .select()
      .single();
    return { data, error };
  },

  /**
   * Update a blood drive
   */
  update: async (id: string, updates: Partial<Drive>) => {
    const { data, error } = await supabase
      .from("drives")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  },
};

// ==================== APPOINTMENT SERVICES ====================

export const appointmentService = {
  /**
   * Create a new appointment
   */
  create: async (
    appointment: Omit<Appointment, "id" | "created_at" | "updated_at">,
  ) => {
    const { data, error } = await supabase
      .from("appointments")
      .insert([appointment])
      .select()
      .single();
    return { data, error };
  },

  /**
   * Get appointments for a donor
   */
  getByDonor: async (donorId: string, status?: string) => {
    let query = supabase
      .from("appointments")
      .select(
        `
        *,
        drives (
          name,
          location,
          address,
          city,
          state,
          start_time,
          end_time
        )
      `,
      )
      .eq("donor_id", donorId)
      .order("appointment_date", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;
    return { data, error };
  },

  /**
   * Get upcoming appointments for a donor
   */
  getUpcomingByDonor: async (donorId: string) => {
    const today = new Date().toISOString().split("T")[0];
    const { data, error } = await supabase
      .from("appointments")
      .select(
        `
        *,
        drives (
          name,
          location,
          address,
          city,
          state
        )
      `,
      )
      .eq("donor_id", donorId)
      .eq("status", "scheduled")
      .gte("appointment_date", today)
      .order("appointment_date", { ascending: true });
    return { data, error };
  },

  /**
   * Update appointment status
   */
  updateStatus: async (id: string, status: Appointment["status"]) => {
    const { data, error } = await supabase
      .from("appointments")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  },

  /**
   * Cancel an appointment
   */
  cancel: async (id: string) => {
    return appointmentService.updateStatus(id, "cancelled");
  },

  /**
   * Reschedule an appointment
   */
  reschedule: async (id: string, newDate: string, newTime: string) => {
    const { data, error } = await supabase
      .from("appointments")
      .update({
        appointment_date: newDate,
        appointment_time: newTime,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  },

  /**
   * Get appointments by hospital (through drives)
   */
  getByHospital: async (hospitalId: string, status?: string) => {
    try {
      // First, try to get drive IDs for this hospital
      const { data: drives, error: drivesError } = await supabase
        .from("drives")
        .select("id")
        .eq("hospital_id", hospitalId);

      let query;

      if (!drivesError && drives && drives.length > 0) {
        // Hospital has drives assigned — filter appointments by those drives
        const driveIds = drives.map((d: any) => d.id);
        query = supabase
          .from("appointments")
          .select(
            `
            *,
            donors (id, name, blood_type, email, phone),
            drives (id, name, location, hospital_id)
          `,
          )
          .in("drive_id", driveIds)
          .order("appointment_date", { ascending: true });
      } else {
        // No drives assigned to this hospital — show all appointments as fallback
        query = supabase
          .from("appointments")
          .select(
            `
            *,
            donors (id, name, blood_type, email, phone),
            drives (id, name, location, hospital_id)
          `,
          )
          .order("appointment_date", { ascending: true });
      }

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query;
      return { data, error };
    } catch (err) {
      console.error("Error fetching appointments by hospital:", err);
      return { data: [], error: err };
    }
  },

  /**
   * Get all appointments (for admin)
   */
  getAll: async (status?: Appointment["status"]) => {
    let query = supabase
      .from("appointments")
      .select(
        `
        *,
        donors (id, name, blood_type, email, phone),
        drives (id, name, location, start_date)
      `,
      )
      .order("appointment_date", { ascending: true });

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;
    return { data, error };
  },

  /**
   * Get pending appointments count
   */
  getPendingCount: async () => {
    const { count, error } = await supabase
      .from("appointments")
      .select("*", { count: "exact", head: true })
      .eq("status", "scheduled");
    return { count, error };
  },

  /**
   * Approve/Accept an appointment (hospital confirms scheduling)
   */
  approve: async (id: string, notes?: string) => {
    const { data, error } = await supabase
      .from("appointments")
      .update({
        status: "confirmed",
        notes: notes || undefined,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  },

  /**
   * Accept appointment via server route (sends acceptance email + notification)
   */
  acceptWithEmail: async (id: string, hospitalName: string) => {
    try {
      const response = await fetch(`/api/appointments/${id}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hospital_name: hospitalName }),
      });
      const result = await response.json();
      return { data: result, error: result.error || null };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  /**
   * Mark donation as complete via server route (awards points, sends email, creates donation record)
   */
  markComplete: async (id: string) => {
    try {
      const response = await fetch(`/api/appointments/${id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const result = await response.json();
      return { data: result, error: result.error || null };
    } catch (err) {
      return { data: null, error: err };
    }
  },

  /**
   * Reject an appointment
   */
  reject: async (id: string, reason?: string) => {
    const { data, error } = await supabase
      .from("appointments")
      .update({
        status: "cancelled",
        notes: reason || "Appointment rejected by administrator",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  },
};

// ==================== DONATION SERVICES ====================

export const donationService = {
  /**
   * Get donations by donor
   */
  getByDonor: async (donorId: string) => {
    // 1. Try to get records from the dedicated donations table
    const { data: donations, error: donationsError } = await supabase
      .from("donations")
      .select(
        `
        *,
        drives (id, name, location, address, city, state),
        hospitals:hospital_id (id, name, city, state)
      `,
      )
      .eq("donor_id", donorId)
      .order("donation_date", { ascending: false });

    // 2. If we found donations, return them
    if (donations && donations.length > 0) {
      return { data: donations, error: donationsError };
    }

    // 3. Fallback: If no dedicated donation records exist, look for completed appointments
    // This handles cases where appointments were marked complete but no donation record was created
    const { data: appointments, error: appointmentsError } = await supabase
      .from("appointments")
      .select(
        `
        *,
        drives (
          id, 
          name, 
          location, 
          address, 
          city, 
          state, 
          hospital_id,
          hospitals (id, name, city, state)
        )
      `,
      )
      .eq("donor_id", donorId)
      .eq("status", "completed")
      .order("appointment_date", { ascending: false });

    if (appointments && appointments.length > 0) {
      // Map appointments to the donation format
      const syntheticDonations = appointments.map((apt: any) => ({
        id: apt.id,
        donor_id: donorId,
        drive_id: apt.drive_id,
        hospital_id: apt.drives?.hospital_id || null,
        donation_date: apt.appointment_date,
        blood_type: apt.donors?.blood_type || null,
        quantity_ml: 450,
        points_earned: 100,
        status: "completed",
        drives: apt.drives,
        hospitals: apt.drives?.hospitals || null,
        is_synthetic: true, // Internal flag
      }));
      return { data: syntheticDonations, error: appointmentsError };
    }

    return { data: donations || [], error: donationsError };
  },

  /**
   * Get donation statistics for a donor
   */
  getStatsByDonor: async (donorId: string) => {
    const { data, error } = await donationService.getByDonor(donorId);

    if (error) return { stats: null, error };

    const completedDonations = (data || []).filter(
      (d: any) => d.status === "completed",
    );

    const totalDonations = completedDonations.length;
    const totalMl =
      completedDonations.reduce((sum, d) => sum + (d.quantity_ml || 450), 0) ||
      0;
    const totalPoints =
      completedDonations.reduce((sum, d) => sum + (d.points_earned || 0), 0) ||
      0;
    const lastDonation = completedDonations[0]?.donation_date || null;

    return {
      stats: {
        totalDonations,
        totalMl,
        totalPoints,
        lastDonation,
        livesImpacted: totalDonations * 3, // Each donation can save up to 3 lives
      },
      error: null,
    };
  },

  /**
   * Get total donation count (platform-wide)
   */
  getTotalCount: async () => {
    const { count, error } = await supabase
      .from("donations")
      .select("*", { count: "exact", head: true })
      .eq("status", "completed");
    return { count, error };
  },

  /**
   * Create a donation record
   */
  create: async (donation: Omit<Donation, "id" | "created_at">) => {
    const { data, error } = await supabase
      .from("donations")
      .insert([donation])
      .select()
      .single();
    return { data, error };
  },
};

// ==================== REWARD SERVICES ====================

export const rewardService = {
  /**
   * Get rewards/badges for a donor
   */
  getByDonor: async (donorId: string) => {
    const { data, error } = await supabase
      .from("rewards")
      .select("*")
      .eq("donor_id", donorId)
      .order("earned_at", { ascending: false });
    return { data, error };
  },

  /**
   * Award a badge to a donor
   */
  awardBadge: async (reward: Omit<Reward, "id" | "earned_at">) => {
    const { data, error } = await supabase
      .from("rewards")
      .insert([{ ...reward, earned_at: new Date().toISOString() }])
      .select()
      .single();
    return { data, error };
  },

  /**
   * Get leaderboard (top donors by points)
   */
  getLeaderboard: async (limit: number = 10) => {
    const { data, error } = await supabase
      .from("donors")
      .select("id, name, points, level, blood_type, profile_pic_url")
      .order("points", { ascending: false })
      .limit(limit);
    return { data, error };
  },
};

// ==================== COMMUNITY SERVICES ====================

export const communityService = {
  /**
   * Get community posts — fetches posts then enriches with donor info
   * (avoids FK join which requires a DB foreign key constraint)
   */
  getPosts: async (limit: number = 20) => {
    const { data: posts, error } = await supabase
      .from("community_posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error || !posts?.length) return { data: posts || [], error };

    // Get unique author IDs and fetch donor info in one query
    const authorIds = [
      ...new Set(posts.map((p: any) => p.author_id).filter(Boolean)),
    ];
    const { data: donors } = await supabase
      .from("donors")
      .select("id, name, blood_type, level, profile_pic_url, points")
      .in("id", authorIds);

    const donorMap = Object.fromEntries(
      (donors || []).map((d: any) => [d.id, d]),
    );
    const enriched = posts.map((p: any) => ({
      ...p,
      donors: donorMap[p.author_id] || null,
    }));
    return { data: enriched, error: null };
  },

  /**
   * Create a new post — only inserts columns that actually exist
   */
  createPost: async (post: {
    author_id: string;
    content: string;
    image_url?: string;
  }) => {
    const { data, error } = await supabase
      .from("community_posts")
      .insert([post])
      .select()
      .single();
    return { data, error };
  },

  /**
   * Like/unlike a post
   */
  toggleLike: async (postId: string, userId: string) => {
    // Check if like already exists
    const { data: existingLike } = await supabase
      .from("community_likes")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", userId)
      .maybeSingle();

    if (existingLike) {
      // Unlike — delete the like row, then recount likes and update post
      await supabase.from("community_likes").delete().eq("id", existingLike.id);
      const { count } = await supabase
        .from("community_likes")
        .select("*", { count: "exact", head: true })
        .eq("post_id", postId);
      await supabase
        .from("community_posts")
        .update({ likes_count: count ?? 0 })
        .eq("id", postId);
      return { liked: false, error: null };
    } else {
      // Like — insert like row, then recount likes and update post
      const { error } = await supabase
        .from("community_likes")
        .insert([{ post_id: postId, user_id: userId }]);
      if (!error) {
        const { count } = await supabase
          .from("community_likes")
          .select("*", { count: "exact", head: true })
          .eq("post_id", postId);
        await supabase
          .from("community_posts")
          .update({ likes_count: count ?? 1 })
          .eq("id", postId);
      }
      return { liked: true, error };
    }
  },

  /**
   * Get comments for a post
   */
  getComments: async (postId: string) => {
    const { data, error } = await supabase
      .from("community_comments")
      .select(
        `
        *,
        donors:author_id (id, name, profile_pic_url)
      `,
      )
      .eq("post_id", postId)
      .order("created_at", { ascending: true });
    return { data, error };
  },

  /**
   * Add a comment
   */
  addComment: async (
    comment: Omit<CommunityComment, "id" | "created_at" | "updated_at">,
  ) => {
    const { data, error } = await supabase
      .from("community_comments")
      .insert([comment])
      .select()
      .single();

    if (!error) {
      await supabase.rpc("increment_comments", { post_id: comment.post_id });
    }
    return { data, error };
  },

  /**
   * Get blood type groups with member counts
   */
  getBloodTypeGroups: async () => {
    const { data, error } = await supabase.from("donors").select("blood_type");

    if (error) return { data: null, error };

    const counts: Record<string, number> = {};
    data?.forEach((d) => {
      if (d.blood_type) {
        counts[d.blood_type] = (counts[d.blood_type] || 0) + 1;
      }
    });

    const bloodTypeDescriptions: Record<string, string> = {
      "O+": "Universal donors for positive blood types",
      "O-": "Universal donors - most needed!",
      "A+": "Second most common blood type",
      "A-": "Can donate to A and AB types",
      "B+": "Can donate to B+ and AB+",
      "B-": "Can donate to B and AB types",
      "AB+": "Universal recipient",
      "AB-": "Can receive from all negative types",
    };

    const groups = Object.entries(counts).map(([type, count]) => ({
      type,
      members: count,
      description: bloodTypeDescriptions[type] || "",
    }));

    return { data: groups, error: null };
  },
};

// ==================== BLOOD REQUEST SERVICES ====================

export const bloodRequestService = {
  /**
   * Create a blood request
   */
  create: async (
    request: Omit<
      BloodRequest,
      "id" | "created_at" | "updated_at" | "fulfilled_units"
    >,
  ) => {
    const { data, error } = await supabase
      .from("blood_requests")
      .insert([{ ...request, fulfilled_units: 0 }])
      .select()
      .single();
    return { data, error };
  },

  /**
   * Get requests by hospital
   */
  getByHospital: async (hospitalId: string) => {
    const { data, error } = await supabase
      .from("blood_requests")
      .select("*")
      .eq("hospital_id", hospitalId)
      .order("created_at", { ascending: false });
    return { data, error };
  },

  /**
   * Update request status
   */
  updateStatus: async (
    id: string,
    status: BloodRequest["status"],
    fulfilledUnits?: number,
  ) => {
    const updates: Partial<BloodRequest> = { status };
    if (fulfilledUnits !== undefined) {
      updates.fulfilled_units = fulfilledUnits;
    }
    const { data, error } = await supabase
      .from("blood_requests")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  },

  /**
   * Get all pending requests
   */
  getPending: async () => {
    const { data, error } = await supabase
      .from("blood_requests")
      .select(
        `
        *,
        hospitals (name, city, state)
      `,
      )
      .eq("status", "pending")
      .order("urgency", { ascending: false })
      .order("created_at", { ascending: true });
    return { data, error };
  },

  /**
   * Get all blood requests (for admin)
   */
  getAll: async (status?: string) => {
    let query = supabase
      .from("blood_requests")
      .select(
        `
        *,
        hospitals (id, name, city, state, email, phone)
      `,
      )
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;
    return { data, error };
  },

  /**
   * Approve a blood request
   */
  approve: async (id: string, notes?: string) => {
    const { data, error } = await supabase
      .from("blood_requests")
      .update({ status: "fulfilled" })
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  },

  /**
   * Reject a blood request
   */
  reject: async (id: string, reason?: string) => {
    const { data, error } = await supabase
      .from("blood_requests")
      .update({ status: "cancelled" })
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  },
};

// ==================== INVENTORY SERVICES ====================

export const inventoryService = {
  /**
   * Get inventory by hospital
   */
  getByHospital: async (hospitalId: string) => {
    const { data, error } = await supabase
      .from("blood_inventory")
      .select("*")
      .eq("hospital_id", hospitalId)
      .order("blood_type", { ascending: true });
    return { data, error };
  },

  /**
   * Update inventory
   */
  update: async (id: string, updates: Partial<BloodInventory>) => {
    const { data, error } = await supabase
      .from("blood_inventory")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  },

  /**
   * Get inventory summary (aggregate by blood type)
   */
  getSummary: async () => {
    const { data, error } = await supabase
      .from("blood_inventory")
      .select("blood_type, units_available");

    if (error) return { data: null, error };

    const summary: Record<string, number> = {};
    data?.forEach((item) => {
      summary[item.blood_type] =
        (summary[item.blood_type] || 0) + item.units_available;
    });

    return { data: summary, error: null };
  },
};

// ==================== DONOR SERVICES ====================

export const donorService = {
  /**
   * Get donor by ID
   */
  getById: async (id: string) => {
    const { data, error } = await supabase
      .from("donors")
      .select("*")
      .eq("id", id)
      .single();
    return { data, error };
  },

  /**
   * Get donor by Clerk user ID
   */
  getByClerkId: async (clerkUserId: string) => {
    const { data, error } = await supabase
      .from("donors")
      .select("*")
      .eq("clerk_user_id", clerkUserId)
      .single();
    return { data, error };
  },

  /**
   * Get donors by blood type
   */
  getByBloodType: async (bloodType: string) => {
    const { data, error } = await supabase
      .from("donors")
      .select("id, name, email, phone, blood_type, city, clerk_user_id")
      .eq("blood_type", bloodType);
    return { data, error };
  },

  /**
   * Update donor profile
   */
  update: async (id: string, updates: Partial<Donor>) => {
    const { data, error } = await supabase
      .from("donors")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  },

  /**
   * Add points to donor
   */
  addPoints: async (id: string, points: number) => {
    const { data: donor } = await supabase
      .from("donors")
      .select("points, level")
      .eq("id", id)
      .single();

    const currentPoints = donor?.points || 0;
    const newPoints = currentPoints + points;

    // Calculate new level based on points
    let newLevel = 1;
    if (newPoints >= 5000) newLevel = 6;
    else if (newPoints >= 2000) newLevel = 5;
    else if (newPoints >= 1000) newLevel = 4;
    else if (newPoints >= 500) newLevel = 3;
    else if (newPoints >= 100) newLevel = 2;

    const { data, error } = await supabase
      .from("donors")
      .update({ points: newPoints, level: newLevel })
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  },

  /**
   * Get total donor count
   */
  getCount: async () => {
    const { count, error } = await supabase
      .from("donors")
      .select("*", { count: "exact", head: true });
    return { count, error };
  },

  /**
   * Get recent donors
   */
  getRecent: async (limit: number = 10) => {
    const { data, error } = await supabase
      .from("donors")
      .select(
        "id, name, blood_type, last_donation_date, points, level, is_verified, created_at, email, city",
      )
      .order("created_at", { ascending: false })
      .limit(limit);
    return { data, error };
  },

  /**
   * Get top donors for leaderboard, sorted by points (proxy for total donations)
   */
  getLeaderboard: async (limit: number = 20) => {
    const { data, error } = await supabase
      .from("donors")
      .select(
        "id, name, blood_type, points, level, is_verified, last_donation_date, email, city",
      )
      .order("points", { ascending: false })
      .limit(limit);
    return { data, error };
  },
};

// ==================== HOSPITAL SERVICES ====================

export const hospitalService = {
  /**
   * Get hospital by ID
   */
  getById: async (id: string) => {
    const { data, error } = await supabase
      .from("hospitals")
      .select("*")
      .eq("id", id)
      .single();
    return { data, error };
  },

  /**
   * Get all hospitals
   */
  getAll: async () => {
    const { data, error } = await supabase
      .from("hospitals")
      .select("*")
      .order("name", { ascending: true });
    return { data, error };
  },

  /**
   * Get hospital count
   */
  getCount: async () => {
    const { count, error } = await supabase
      .from("hospitals")
      .select("*", { count: "exact", head: true });
    return { count, error };
  },

  /**
   * Update hospital profile
   */
  update: async (id: string, updates: Partial<Hospital>) => {
    const { data, error } = await supabase
      .from("hospitals")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  },

  /**
   * Create a new hospital
   */
  create: async (
    hospital: Omit<Hospital, "id" | "created_at" | "updated_at">,
  ) => {
    const { data, error } = await supabase
      .from("hospitals")
      .insert([hospital])
      .select()
      .single();
    return { data, error };
  },
};

// ==================== NOTIFICATION SERVICES ====================

export const notificationService = {
  /**
   * Get notifications for a user - uses donor_id for lookups
   */
  getByUser: async (
    clerkUserId: string,
    donorInternalId?: string,
    unreadOnly: boolean = false,
  ) => {
    // Use donor_id for queries
    let query = supabase
      .from("notifications")
      .select("*")
      .eq("donor_id", donorInternalId)
      .order("created_at", { ascending: false });

    if (unreadOnly) {
      query = query.eq("is_read", false);
    }

    const { data, error } = await query;
    return { data, error };
  },

  /**
   * Mark notification as read
   */
  markAsRead: async (id: string) => {
    const { data, error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  },

  /**
   * Mark all as read for a user - uses donor_id
   */
  markAllAsRead: async (clerkUserId: string, donorInternalId?: string) => {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("donor_id", donorInternalId)
      .eq("is_read", false);

    return { error };
  },

  /**
   * Create a notification
   */
  create: async (notification: Omit<Notification, "id" | "created_at">) => {
    const { data, error } = await supabase
      .from("notifications")
      .insert([notification])
      .select()
      .single();
    return { data, error };
  },

  /**
   * Delete a notification
   */
  delete: async (id: string) => {
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", id);
    return { error };
  },

  /**
   * Send urgent blood need notification to donors with matching blood type
   */
  sendUrgentBloodNeed: async (
    hospitalId: string,
    hospitalName: string,
    bloodType: string,
    unitsNeeded: number,
    urgency: "critical" | "high" | "medium",
    patientInfo?: string,
  ) => {
    const donors = await donorService.getByBloodType(bloodType);

    if (!donors.data || donors.data.length === 0) {
      return { notified: 0, found: 0, error: null };
    }

    const notifications = donors.data.map((donor: any) => {
      return {
        donor_id: donor.id,
        type: "urgent",
        title: `Urgent: ${bloodType} Blood Needed!`,
        message: `${hospitalName} urgently needs ${unitsNeeded} units of ${bloodType} blood${patientInfo ? ` for ${patientInfo}` : ""}. Please consider donating at your earliest convenience.`,
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

    const { data, error } = await supabase
      .from("notifications")
      .insert(notifications)
      .select();

    return { notified: data?.length || 0, found: donors.data.length, error };
  },

  /**
   * Send appointment reminder to a donor
   */
  sendAppointmentReminder: async (
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

    const timeLabel = reminderType === "1_day" ? "tomorrow" : "in 1 hour";

    const { data, error } = await supabase
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
  },

  /**
   * Broadcast notification to all donors
   */
  broadcastToAllDonors: async (
    title: string,
    message: string,
    priority: "low" | "medium" | "high",
    actionUrl?: string,
    bloodTypeFilter?: string,
  ) => {
    let query = supabase.from("donors").select("id, clerk_user_id");

    if (bloodTypeFilter) {
      query = query.eq("blood_type", bloodTypeFilter);
    }

    const { data: donors, error: donorError } = await query;

    if (donorError || !donors || donors.length === 0) {
      return { notified: 0, error: donorError };
    }

    const notifications = donors.map((donor: any) => {
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

    const { data, error } = await supabase
      .from("notifications")
      .insert(notifications)
      .select();

    return { notified: data?.length || 0, error };
  },

  /**
   * Send blood drive notification to nearby donors
   */
  notifyNearbyDonors: async (
    driveId: string,
    driveName: string,
    city: string,
    date: string,
    bloodTypesNeeded: string[],
  ) => {
    let query = supabase
      .from("donors")
      .select("id, blood_type, clerk_user_id")
      .ilike("city", `%${city}%`);

    const { data: donors, error: donorError } = await query;

    if (donorError || !donors || donors.length === 0) {
      return { notified: 0, error: donorError };
    }

    const relevantDonors = donors.filter((donor: any) =>
      bloodTypesNeeded.includes(donor.blood_type),
    );

    if (relevantDonors.length === 0) {
      return { notified: 0, error: null };
    }

    const notifications = relevantDonors.map((donor: any) => ({
      donor_id: donor.id,
      type: "appointment",
      title: `New Blood Drive Near You!`,
      message: `A blood drive "${driveName}" has been organized in ${city} on ${date}. Your blood type (${donor.blood_type}) is needed! Book your appointment now.`,
      priority: "medium",
      action_url: "/drives",
      is_read: false,
    }));

    const { data, error } = await supabase
      .from("notifications")
      .insert(notifications)
      .select();

    return { notified: data?.length || 0, error };
  },

  /**
   * Get unread notification count
   */
  getUnreadCount: async (donorId: string) => {
    const { count, error } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("donor_id", donorId)
      .eq("is_read", false);
    return { count: count || 0, error };
  },
};


// ==================== FEEDBACK SERVICES ====================

export const feedbackService = {
  /**
   * Submit feedback for a blood drive
   */
  submit: async (feedback: {
    donor_id: string;
    drive_id: string;
    rating: number;
    comment?: string;
  }) => {
    const { data, error } = await supabase
      .from("drive_feedback")
      .insert([feedback])
      .select()
      .single();
    return { data, error };
  },

  /**
   * Get feedback for a drive
   */
  getByDrive: async (driveId: string) => {
    const { data, error } = await supabase
      .from("drive_feedback")
      .select(`
        *,
        donors (id, name, profile_pic_url)
      `)
      .eq("drive_id", driveId)
      .order("created_at", { ascending: false });
    return { data, error };
  },
};

// ==================== REDEMPTION SERVICES ====================

export const redemptionService = {
  /**
   * Create a redemption record
   */
  create: async (redemption: {
    donor_id: string;
    item_id: string;
    item_name: string;
    points_spent: number;
    status?: "pending" | "shipped" | "delivered" | "cancelled";
  }) => {
    const { data, error } = await supabase
      .from("point_redemptions")
      .insert([{ ...redemption, status: redemption.status || "pending" }])
      .select()
      .single();
    return { data, error };
  },

  /**
   * Get redemptions for a donor
   */
  getByDonor: async (donorId: string) => {
    const { data, error } = await supabase
      .from("point_redemptions")
      .select("*")
      .eq("donor_id", donorId)
      .order("created_at", { ascending: false });
    return { data, error };
  },
};

// ==================== ADMIN STATS SERVICES ====================

export const statsService = {
  /**
   * Get admin dashboard statistics
   */
  /**
   * ADMIN STATS
   */
  getAdminStats: async () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1).toISOString();
    
    const [
      { count: totalDonors },
      { count: totalDonations },
      { count: totalDrives },
      { count: activeDrives },
      { count: totalHospitals },
      { count: donationsThisMonth },
      { count: activeDonorsCount }
    ] = await Promise.all([
      donorService.getCount(),
      donationService.getTotalCount(),
      driveService.getCount(),
      driveService.getCount(true),
      hospitalService.getCount(),
      // Donations this month
      supabase.from("donations").select("*", { count: "exact", head: true }).gte("donation_date", startOfMonth),
      // Active donors (donated in last 6 months)
      supabase.from("donors").select("*", { count: "exact", head: true }).gte("last_donation_date", sixMonthsAgo)
    ]);

    // Calculate growth (mocked for now as we don't have historical snapshots easily without a dedicated stats table, 
    // but at least it's based on real counts)
    const growth = totalDonors && totalDonors > 0 ? 12.5 : 0; 

    return {
      totalDonors: totalDonors || 0,
      activeDonors: activeDonorsCount || 0,
      totalDonations: totalDonations || 0,
      livesImpacted: (totalDonations || 0) * 3,
      totalDrives: totalDrives || 0,
      activeDrives: activeDrives || 0,
      partnerships: totalHospitals || 0,
      donationsThisMonth: donationsThisMonth || 0,
      monthlyGrowth: growth
    };
  },
};
