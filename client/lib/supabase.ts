import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Database types based on your schema
export interface Profile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  blood_type?: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
  date_of_birth?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  profile_pic_url?: string;
  role: "donor" | "admin" | "hospital";
  points?: number;
  level?: number;
  is_verified?: boolean;
  last_donation_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  postal_code?: string;
  phone: string;
  email: string;
  contact_person: string;
  license_number?: string;
  is_verified?: boolean;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Drive {
  id: string;
  name: string;
  description?: string;
  organizer_id: string;
  hospital_id?: string;
  location: string;
  address: string;
  city: string;
  state: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  blood_types_needed?: string[];
  capacity: number;
  registered_count?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Appointment {
  id: string;
  donor_id: string;
  drive_id: string;
  appointment_date: string;
  appointment_time: string;
  status?: "scheduled" | "completed" | "cancelled" | "no_show";
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Donation {
  id: string;
  donor_id: string;
  drive_id?: string;
  hospital_id?: string;
  donation_date: string;
  blood_type: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
  quantity_ml?: number;
  status?: "scheduled" | "completed" | "deferred" | "cancelled";
  points_earned?: number;
  hemoglobin_level?: number;
  blood_pressure?: string;
  notes?: string;
  created_at?: string;
}

export interface BloodRequest {
  id: string;
  hospital_id: string;
  blood_type: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
  quantity_units: number;
  urgency?: "low" | "medium" | "high" | "critical";
  status?: "pending" | "fulfilled" | "cancelled";
  needed_by: string;
  reason?: string;
  fulfilled_units?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Reward {
  id: string;
  donor_id: string;
  badge_name: string;
  badge_description?: string;
  badge_icon?: string;
  points_threshold: number;
  earned_at?: string;
}

export interface CommunityPost {
  id: string;
  author_id: string;
  content: string;
  image_url?: string;
  likes_count?: number;
  comments_count?: number;
  is_pinned?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type?: string;
  is_read?: boolean;
  action_url?: string;
  priority?: string;
  created_at?: string;
}

export interface CommunityComment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at?: string;
  updated_at?: string;
}

export interface CommunityLike {
  id: string;
  post_id: string;
  user_id: string;
  created_at?: string;
}

export interface BloodInventory {
  id: string;
  hospital_id: string;
  blood_type: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
  units_available: number;
  units_reserved: number;
  expiry_date: string;
  donation_id?: string;
  created_at?: string;
  updated_at?: string;
}

// Helper functions for authentication
export const auth = {
  signUp: async (email: string, password: string, userData: { name: string; role?: string }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });
    return { data, error };
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  }
};

// Helper functions for database operations
export const db = {
  // Profile operations
  getProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    return { data, error };
  },

  updateProfile: async (userId: string, updates: Partial<Profile>) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    return { data, error };
  },

  createProfile: async (profile: Omit<Profile, 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('profiles')
      .insert([profile])
      .select()
      .single();
    return { data, error };
  },

  // Blood drives operations
  getDrives: async (filters?: { city?: string; bloodType?: string; date?: string }) => {
    let query = supabase
      .from('drives')
      .select(`
        *,
        hospitals(name, city, state),
        profiles!drives_organizer_id_fkey(name)
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

  createDrive: async (drive: Omit<Drive, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('drives')
      .insert([drive])
      .select()
      .single();
    return { data, error };
  },

  // Appointments operations
  createAppointment: async (appointment: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('appointments')
      .insert([appointment])
      .select()
      .single();
    return { data, error };
  },

  getUserAppointments: async (userId: string) => {
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        drives(name, location, city, start_date, start_time)
      `)
      .eq('donor_id', userId)
      .order('appointment_date', { ascending: true });
    return { data, error };
  },

  // Donations operations
  getUserDonations: async (userId: string) => {
    const { data, error } = await supabase
      .from('donations')
      .select(`
        *,
        drives(name, location),
        hospitals(name, city)
      `)
      .eq('donor_id', userId)
      .order('donation_date', { ascending: false });
    return { data, error };
  },

  createDonation: async (donation: Omit<Donation, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('donations')
      .insert([donation])
      .select()
      .single();
    return { data, error };
  },

  // Rewards operations
  getUserRewards: async (userId: string) => {
    const { data, error } = await supabase
      .from('rewards')
      .select('*')
      .eq('donor_id', userId)
      .order('earned_at', { ascending: false });
    return { data, error };
  },

  // Notifications operations
  getUserNotifications: async (userId: string) => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  markNotificationAsRead: async (notificationId: string) => {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
    return { data, error };
  },

  createNotification: async (notification: Omit<Notification, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('notifications')
      .insert([notification])
      .select()
      .single();
    return { data, error };
  },

  // Community operations
  getCommunityPosts: async () => {
    const { data, error } = await supabase
      .from('community_posts')
      .select(`
        *,
        profiles!community_posts_author_id_fkey(name, profile_pic_url)
      `)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  createCommunityPost: async (post: Omit<CommunityPost, 'id' | 'created_at' | 'updated_at' | 'likes_count' | 'comments_count'>) => {
    const { data, error } = await supabase
      .from('community_posts')
      .insert([post])
      .select()
      .single();
    return { data, error };
  },

  // Blood inventory operations (for hospitals)
  getBloodInventory: async (hospitalId: string) => {
    const { data, error } = await supabase
      .from('blood_inventory')
      .select('*')
      .eq('hospital_id', hospitalId)
      .order('expiry_date', { ascending: true });
    return { data, error };
  },

  // Blood requests operations
  getBloodRequests: async (hospitalId?: string) => {
    let query = supabase
      .from('blood_requests')
      .select(`
        *,
        hospitals(name, city, state)
      `)
      .order('created_at', { ascending: false });

    if (hospitalId) {
      query = query.eq('hospital_id', hospitalId);
    }

    const { data, error } = await query;
    return { data, error };
  },

  createBloodRequest: async (request: Omit<BloodRequest, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('blood_requests')
      .insert([request])
      .select()
      .single();
    return { data, error };
  },

  // Analytics operations
  getAnalytics: async () => {
    const [
      { count: totalDonors },
      { count: totalDonations },
      { count: totalDrives },
      { count: totalHospitals }
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'donor'),
      supabase.from('donations').select('*', { count: 'exact', head: true }),
      supabase.from('drives').select('*', { count: 'exact', head: true }),
      supabase.from('hospitals').select('*', { count: 'exact', head: true })
    ]);

    return {
      totalDonors,
      totalDonations,
      totalDrives,
      totalHospitals
    };
  }
};
