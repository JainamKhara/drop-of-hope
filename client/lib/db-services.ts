/**
 * Database Services for Drop of Hope Platform
 * Comprehensive CRUD operations organized by domain
 */

import { supabase, Drive, Appointment, Donation, BloodRequest, Reward, CommunityPost, CommunityComment, CommunityLike, BloodInventory, Notification, Donor, Hospital } from './supabase';

// ==================== DRIVE SERVICES ====================

export const driveService = {
  /**
   * Get all active drives with optional filters
   */
  getAll: async (filters?: { city?: string; bloodType?: string; date?: string }) => {
    let query = supabase
      .from('drives')
      .select(`
        *,
        hospitals (name, city, state)
      `)
      .eq('is_active', true)
      .order('start_date', { ascending: true });

    if (filters?.city) {
      query = query.ilike('city', `%${filters.city}%`);
    }
    if (filters?.bloodType) {
      query = query.contains('blood_types_needed', [filters.bloodType]);
    }
    if (filters?.date) {
      query = query.gte('start_date', filters.date);
    }

    const { data, error } = await query;
    return { data, error };
  },

  /**
   * Get a single drive by ID
   */
  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('drives')
      .select(`
        *,
        hospitals (name, city, state, phone, email)
      `)
      .eq('id', id)
      .single();
    return { data, error };
  },

  /**
   * Get upcoming drives (next 30 days)
   */
  getUpcoming: async (limit: number = 5) => {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('drives')
      .select('*')
      .eq('is_active', true)
      .gte('start_date', today)
      .order('start_date', { ascending: true })
      .limit(limit);
    return { data, error };
  },

  /**
   * Get all drives for admin (including inactive)
   */
  getAdminAll: async () => {
    const { data, error } = await supabase
      .from('drives')
      .select('*')
      .order('start_date', { ascending: false });
    return { data, error };
  },

  /**
   * Get drives count
   */
  getCount: async (activeOnly: boolean = false) => {
    let query = supabase.from('drives').select('*', { count: 'exact', head: true });
    if (activeOnly) {
      query = query.eq('is_active', true);
    }
    const { count, error } = await query;
    return { count, error };
  },

  /**
   * Create a new blood drive
   */
  create: async (drive: Omit<Drive, 'id' | 'created_at' | 'updated_at' | 'registered_count'>) => {
    const { data, error } = await supabase
      .from('drives')
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
      .from('drives')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  }
};

// ==================== APPOINTMENT SERVICES ====================

export const appointmentService = {
  /**
   * Create a new appointment
   */
  create: async (appointment: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('appointments')
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
      .from('appointments')
      .select(`
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
      `)
      .eq('donor_id', donorId)
      .order('appointment_date', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    return { data, error };
  },

  /**
   * Get upcoming appointments for a donor
   */
  getUpcomingByDonor: async (donorId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        drives (
          name,
          location,
          address,
          city,
          state
        )
      `)
      .eq('donor_id', donorId)
      .eq('status', 'scheduled')
      .gte('appointment_date', today)
      .order('appointment_date', { ascending: true });
    return { data, error };
  },

  /**
   * Update appointment status
   */
  updateStatus: async (id: string, status: Appointment['status']) => {
    const { data, error } = await supabase
      .from('appointments')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  /**
   * Cancel an appointment
   */
  cancel: async (id: string) => {
    return appointmentService.updateStatus(id, 'cancelled');
  },

  /**
   * Reschedule an appointment
   */
  reschedule: async (id: string, newDate: string, newTime: string) => {
    const { data, error } = await supabase
      .from('appointments')
      .update({ 
        appointment_date: newDate, 
        appointment_time: newTime,
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
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
        .from('drives')
        .select('id')
        .eq('hospital_id', hospitalId);

      let query;

      if (!drivesError && drives && drives.length > 0) {
        // Hospital has drives assigned — filter appointments by those drives
        const driveIds = drives.map((d: any) => d.id);
        query = supabase
          .from('appointments')
          .select(`
            *,
            donors (id, name, blood_type, email, phone),
            drives (id, name, location, hospital_id)
          `)
          .in('drive_id', driveIds)
          .order('appointment_date', { ascending: true });
      } else {
        // No drives assigned to this hospital — show all appointments as fallback
        query = supabase
          .from('appointments')
          .select(`
            *,
            donors (id, name, blood_type, email, phone),
            drives (id, name, location, hospital_id)
          `)
          .order('appointment_date', { ascending: true });
      }

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      return { data, error };
    } catch (err) {
      console.error('Error fetching appointments by hospital:', err);
      return { data: [], error: err };
    }
  },

  /**
   * Get all appointments (for admin)
   */
  getAll: async (status?: Appointment['status']) => {
    let query = supabase
      .from('appointments')
      .select(`
        *,
        donors (id, name, blood_type, email, phone),
        drives (id, name, location, start_date)
      `)
      .order('appointment_date', { ascending: true });
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query;
    return { data, error };
  },

  /**
   * Get pending appointments count
   */
  getPendingCount: async () => {
    const { count, error } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'scheduled');
    return { count, error };
  },

  /**
   * Approve an appointment (mark as confirmed/scheduled)
   */
  approve: async (id: string, notes?: string) => {
    const { data, error } = await supabase
      .from('appointments')
      .update({ 
        status: 'completed',
        notes: notes || undefined,
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  /**
   * Reject an appointment
   */
  reject: async (id: string, reason?: string) => {
    const { data, error } = await supabase
      .from('appointments')
      .update({ 
        status: 'cancelled',
        notes: reason || 'Appointment rejected by administrator',
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  }
};

// ==================== DONATION SERVICES ====================

export const donationService = {
  /**
   * Get donations by donor
   */
  getByDonor: async (donorId: string) => {
    const { data, error } = await supabase
      .from('donations')
      .select(`
        *,
        drives (name, location),
        hospitals (name)
      `)
      .eq('donor_id', donorId)
      .order('donation_date', { ascending: false });
    return { data, error };
  },

  /**
   * Get donation statistics for a donor
   */
  getStatsByDonor: async (donorId: string) => {
    const { data, error } = await supabase
      .from('donations')
      .select('*')
      .eq('donor_id', donorId)
      .eq('status', 'completed');
    
    if (error) return { stats: null, error };
    
    const totalDonations = data?.length || 0;
    const totalMl = data?.reduce((sum, d) => sum + (d.quantity_ml || 450), 0) || 0;
    const totalPoints = data?.reduce((sum, d) => sum + (d.points_earned || 0), 0) || 0;
    const lastDonation = data?.[0]?.donation_date || null;
    
    return { 
      stats: { 
        totalDonations, 
        totalMl, 
        totalPoints, 
        lastDonation,
        livesImpacted: totalDonations * 3 // Each donation can save up to 3 lives
      }, 
      error: null 
    };
  },

  /**
   * Get total donation count (platform-wide)
   */
  getTotalCount: async () => {
    const { count, error } = await supabase
      .from('donations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed');
    return { count, error };
  },

  /**
   * Create a donation record
   */
  create: async (donation: Omit<Donation, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('donations')
      .insert([donation])
      .select()
      .single();
    return { data, error };
  }
};

// ==================== REWARD SERVICES ====================

export const rewardService = {
  /**
   * Get rewards/badges for a donor
   */
  getByDonor: async (donorId: string) => {
    const { data, error } = await supabase
      .from('rewards')
      .select('*')
      .eq('donor_id', donorId)
      .order('earned_at', { ascending: false });
    return { data, error };
  },

  /**
   * Award a badge to a donor
   */
  awardBadge: async (reward: Omit<Reward, 'id' | 'earned_at'>) => {
    const { data, error } = await supabase
      .from('rewards')
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
      .from('donors')
      .select('id, name, points, level, blood_type, profile_pic_url')
      .order('points', { ascending: false })
      .limit(limit);
    return { data, error };
  }
};

// ==================== COMMUNITY SERVICES ====================

export const communityService = {
  /**
   * Get community posts with author info
   */
  getPosts: async (limit: number = 20) => {
    const { data, error } = await supabase
      .from('community_posts')
      .select(`
        *,
        donors:author_id (id, name, blood_type, level, profile_pic_url, points)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);
    return { data, error };
  },

  /**
   * Create a new post
   */
  createPost: async (post: Omit<CommunityPost, 'id' | 'created_at' | 'updated_at' | 'likes_count' | 'comments_count'>) => {
    const { data, error } = await supabase
      .from('community_posts')
      .insert([{ ...post, likes_count: 0, comments_count: 0 }])
      .select()
      .single();
    return { data, error };
  },

  /**
   * Like/unlike a post
   */
  toggleLike: async (postId: string, userId: string) => {
    // Check if like exists
    const { data: existingLike } = await supabase
      .from('community_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    if (existingLike) {
      // Unlike
      await supabase.from('community_likes').delete().eq('id', existingLike.id);
      await supabase.rpc('decrement_likes', { post_id: postId });
      return { liked: false, error: null };
    } else {
      // Like
      const { error } = await supabase
        .from('community_likes')
        .insert([{ post_id: postId, user_id: userId }]);
      if (!error) {
        await supabase.rpc('increment_likes', { post_id: postId });
      }
      return { liked: true, error };
    }
  },

  /**
   * Get comments for a post
   */
  getComments: async (postId: string) => {
    const { data, error } = await supabase
      .from('community_comments')
      .select(`
        *,
        donors:author_id (id, name, profile_pic_url)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    return { data, error };
  },

  /**
   * Add a comment
   */
  addComment: async (comment: Omit<CommunityComment, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('community_comments')
      .insert([comment])
      .select()
      .single();
    
    if (!error) {
      await supabase.rpc('increment_comments', { post_id: comment.post_id });
    }
    return { data, error };
  },

  /**
   * Get blood type groups with member counts
   */
  getBloodTypeGroups: async () => {
    const { data, error } = await supabase
      .from('donors')
      .select('blood_type');
    
    if (error) return { data: null, error };
    
    const counts: Record<string, number> = {};
    data?.forEach(d => {
      if (d.blood_type) {
        counts[d.blood_type] = (counts[d.blood_type] || 0) + 1;
      }
    });
    
    const bloodTypeDescriptions: Record<string, string> = {
      'O+': 'Universal donors for positive blood types',
      'O-': 'Universal donors - most needed!',
      'A+': 'Second most common blood type',
      'A-': 'Can donate to A and AB types',
      'B+': 'Can donate to B+ and AB+',
      'B-': 'Can donate to B and AB types',
      'AB+': 'Universal recipient',
      'AB-': 'Can receive from all negative types'
    };
    
    const groups = Object.entries(counts).map(([type, count]) => ({
      type,
      members: count,
      description: bloodTypeDescriptions[type] || ''
    }));
    
    return { data: groups, error: null };
  }
};

// ==================== BLOOD REQUEST SERVICES ====================

export const bloodRequestService = {
  /**
   * Create a blood request
   */
  create: async (request: Omit<BloodRequest, 'id' | 'created_at' | 'updated_at' | 'fulfilled_units'>) => {
    const { data, error } = await supabase
      .from('blood_requests')
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
      .from('blood_requests')
      .select('*')
      .eq('hospital_id', hospitalId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  /**
   * Update request status
   */
  updateStatus: async (id: string, status: BloodRequest['status'], fulfilledUnits?: number) => {
    const updates: Partial<BloodRequest> = { status };
    if (fulfilledUnits !== undefined) {
      updates.fulfilled_units = fulfilledUnits;
    }
    const { data, error } = await supabase
      .from('blood_requests')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  /**
   * Get all pending requests
   */
  getPending: async () => {
    const { data, error } = await supabase
      .from('blood_requests')
      .select(`
        *,
        hospitals (name, city, state)
      `)
      .eq('status', 'pending')
      .order('urgency', { ascending: false })
      .order('created_at', { ascending: true });
    return { data, error };
  },

  /**
   * Get all blood requests (for admin)
   */
  getAll: async (status?: string) => {
    let query = supabase
      .from('blood_requests')
      .select(`
        *,
        hospitals (id, name, city, state, email, phone)
      `)
      .order('created_at', { ascending: false });
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query;
    return { data, error };
  },

  /**
   * Approve a blood request
   */
  approve: async (id: string, notes?: string) => {
    const { data, error } = await supabase
      .from('blood_requests')
      .update({ status: 'fulfilled' })
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  /**
   * Reject a blood request
   */
  reject: async (id: string, reason?: string) => {
    const { data, error } = await supabase
      .from('blood_requests')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  }
};

// ==================== INVENTORY SERVICES ====================

export const inventoryService = {
  /**
   * Get inventory by hospital
   */
  getByHospital: async (hospitalId: string) => {
    const { data, error } = await supabase
      .from('blood_inventory')
      .select('*')
      .eq('hospital_id', hospitalId)
      .order('blood_type', { ascending: true });
    return { data, error };
  },

  /**
   * Update inventory
   */
  update: async (id: string, updates: Partial<BloodInventory>) => {
    const { data, error } = await supabase
      .from('blood_inventory')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  /**
   * Get inventory summary (aggregate by blood type)
   */
  getSummary: async () => {
    const { data, error } = await supabase
      .from('blood_inventory')
      .select('blood_type, units_available');
    
    if (error) return { data: null, error };
    
    const summary: Record<string, number> = {};
    data?.forEach(item => {
      summary[item.blood_type] = (summary[item.blood_type] || 0) + item.units_available;
    });
    
    return { data: summary, error: null };
  }
};

// ==================== DONOR SERVICES ====================

export const donorService = {
  /**
   * Get donor by ID
   */
  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('donors')
      .select('*')
      .eq('id', id)
      .single();
    return { data, error };
  },

  /**
   * Get donor by Clerk user ID
   */
  getByClerkId: async (clerkUserId: string) => {
    const { data, error } = await supabase
      .from('donors')
      .select('*')
      .eq('clerk_user_id', clerkUserId)
      .single();
    return { data, error };
  },

  /**
   * Update donor profile
   */
  update: async (id: string, updates: Partial<Donor>) => {
    const { data, error } = await supabase
      .from('donors')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  /**
   * Add points to donor
   */
  addPoints: async (id: string, points: number) => {
    const { data: donor } = await supabase
      .from('donors')
      .select('points, level')
      .eq('id', id)
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
      .from('donors')
      .update({ points: newPoints, level: newLevel })
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  /**
   * Get total donor count
   */
  getCount: async () => {
    const { count, error } = await supabase
      .from('donors')
      .select('*', { count: 'exact', head: true });
    return { count, error };
  },

  /**
   * Get recent donors
   */
  getRecent: async (limit: number = 10) => {
    const { data, error } = await supabase
      .from('donors')
      .select('id, name, blood_type, last_donation_date, points, level, is_verified, created_at, email, city')
      .order('created_at', { ascending: false })
      .limit(limit);
    return { data, error };
  },

  /**
   * Get top donors for leaderboard, sorted by points (proxy for total donations)
   */
  getLeaderboard: async (limit: number = 20) => {
    const { data, error } = await supabase
      .from('donors')
      .select('id, name, blood_type, points, level, is_verified, last_donation_date, email, city')
      .order('points', { ascending: false })
      .limit(limit);
    return { data, error };
  }
};

// ==================== HOSPITAL SERVICES ====================

export const hospitalService = {
  /**
   * Get hospital by ID
   */
  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('hospitals')
      .select('*')
      .eq('id', id)
      .single();
    return { data, error };
  },

  /**
   * Get all hospitals
   */
  getAll: async () => {
    const { data, error } = await supabase
      .from('hospitals')
      .select('*')
      .order('name', { ascending: true });
    return { data, error };
  },

  /**
   * Get hospital count
   */
  getCount: async () => {
    const { count, error } = await supabase
      .from('hospitals')
      .select('*', { count: 'exact', head: true });
    return { count, error };
  },

  /**
   * Update hospital profile
   */
  update: async (id: string, updates: Partial<Hospital>) => {
    const { data, error } = await supabase
      .from('hospitals')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  /**
   * Create a new hospital
   */
  create: async (hospital: Omit<Hospital, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('hospitals')
      .insert([hospital])
      .select()
      .single();
    return { data, error };
  }
};

// ==================== NOTIFICATION SERVICES ====================

export const notificationService = {
  /**
   * Get notifications for a user
   */
  getByUser: async (userId: string, unreadOnly: boolean = false) => {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (unreadOnly) {
      query = query.eq('is_read', false);
    }
    
    const { data, error } = await query;
    return { data, error };
  },

  /**
   * Mark notification as read
   */
  markAsRead: async (id: string) => {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  /**
   * Mark all as read for a user
   */
  markAllAsRead: async (userId: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);
    return { error };
  },

  /**
   * Create a notification
   */
  create: async (notification: Omit<Notification, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('notifications')
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
      .from('notifications')
      .delete()
      .eq('id', id);
    return { error };
  }
};

// ==================== ADMIN STATS SERVICES ====================

export const statsService = {
  /**
   * Get admin dashboard statistics
   */
  getAdminStats: async () => {
    const [
      { count: totalDonors },
      { count: totalDonations },
      { count: totalDrives },
      { count: activeDrives },
      { count: totalHospitals }
    ] = await Promise.all([
      donorService.getCount(),
      donationService.getTotalCount(),
      driveService.getCount(),
      driveService.getCount(true),
      hospitalService.getCount()
    ]);

    return {
      totalDonors: totalDonors || 0,
      totalDonations: totalDonations || 0,
      livesImpacted: (totalDonations || 0) * 3,
      totalDrives: totalDrives || 0,
      activeDrives: activeDrives || 0,
      partnerships: totalHospitals || 0
    };
  }
};
