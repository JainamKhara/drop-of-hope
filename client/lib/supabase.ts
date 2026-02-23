import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types based on your schema
// Donor table (from your schema)
export interface Donor {
  id?: string;
  clerk_user_id?: string;
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
  points?: number;
  level?: number;
  is_verified?: boolean;
  last_donation_date?: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string; // filled by Supabase
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
  hospital_id?: string;
  blood_type: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
  quantity_units: number;
  urgency?: "low" | "medium" | "high" | "critical" | "routine" | "urgent";
  status?: "pending" | "approved" | "rejected" | "fulfilled" | "cancelled";
  needed_by?: string;
  reason?: string;
  fulfilled_units?: number;
  patient_name?: string;
  contact_phone?: string;
  location?: string;
  notes?: string;
  requested_by?: string;
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
  signUp: async (
    email: string,
    password: string,
    userData: { name: string; role?: string },
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    });
    return { data, error };
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  getCurrentUser: async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    return { user, error };
  },

  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  },

  // Role-based authentication functions
  signInWithRole: async (
    email: string,
    password: string,
    expectedRole: "donor" | "admin" | "hospital",
  ) => {
    // First, authenticate with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { data: null, error };
    }

    if (!data.user) {
      return { data: null, error: { message: "Authentication failed" } };
    }

    // Check user role in profiles table
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (profileError) {
      // Sign out the user since role check failed
      await supabase.auth.signOut();
      return { data: null, error: { message: "Unable to verify user role" } };
    }

    if (profile.role !== expectedRole) {
      // Sign out the user since role doesn't match
      await supabase.auth.signOut();
      return {
        data: null,
        error: {
          message: `Access denied. This login is for ${expectedRole} users only.`,
        },
      };
    }

    return { data, error: null };
  },
};

// Helper functions for database operations
// Only keeping operations needed for login/signup and profile management
export const db = {
  // Profile operations (for login/signup and profile updates)
  getDonorById: async (userId: string) => {
    const { data, error } = await supabase
      .from("donors")
      .select("*")
      .eq("id", userId)
      .single();
    return { data, error };
  },

  updateDonor: async (userId: string, updates: Partial<Donor>) => {
    const { data, error } = await supabase
      .from("donors")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();
    return { data, error };
  },

  createDonor: async (
    donor: Omit<Donor, "id" | "created_at" | "updated_at" | "user_id">,
  ) => {
    const { data, error } = await supabase
      .from("donors")
      .insert([donor])
      .select()
      .single();
    return { data, error };
  },

  // Admin operations (for login and profile)
  getAdminById: async (adminId: string) => {
    const { data, error } = await supabase
      .from("admins")
      .select("*")
      .eq("id", adminId)
      .single();
    return { data, error };
  },

  // Hospital operations (for login and profile)
  getHospitalById: async (hospitalId: string) => {
    const { data, error } = await supabase
      .from("hospitals")
      .select("*")
      .eq("id", hospitalId)
      .single();
    return { data, error };
  },
};