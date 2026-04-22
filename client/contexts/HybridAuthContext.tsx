"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useMemo,
} from "react";
import { useAuth as useClerkAuth, useUser } from "@clerk/clerk-react";
import { supabase } from "../lib/supabase";

// ------------------ Types ------------------

export interface DonorProfile {
  id: string;
  clerk_user_id: string;
  email: string;
  name: string;
  phone?: string;
  blood_type?: string;
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
}

export interface AdminProfile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  profile_pic_url?: string;
  is_verified?: boolean;
  permissions?: Record<string, any>;
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
  created_at?: string;
  updated_at?: string;
}

export type UserRole = "donor" | "admin" | "hospital";
export type UserProfile = DonorProfile | AdminProfile;

// ------------------ Context Types ------------------

interface HybridAuthContextType {
  userRole: UserRole | null;
  donorProfile: DonorProfile | null;
  adminProfile: AdminProfile | null;
  hospitalProfile: Hospital | null;

  isLoaded: boolean;
  isSignedIn: boolean;
  loading: boolean;

  clerkSignOut: () => Promise<void>;

  supabaseSignIn: (
    email: string,
    password: string,
    expectedRole: "admin" | "hospital",
  ) => Promise<{ data: any; error: any }>;
  supabaseSignOut: () => Promise<{ error: any }>;

  updateDonorProfile: (
    updates: Partial<DonorProfile>,
  ) => Promise<{ data: any; error: any }>;
  updateAdminProfile: (
    updates: Partial<AdminProfile>,
  ) => Promise<{ data: any; error: any }>;
  updateHospitalProfile: (
    updates: Partial<Hospital>,
  ) => Promise<{ data: any; error: any }>;

  getRoleDashboard: () => string;
  refreshDonorProfile: () => Promise<void>;
}

const HybridAuthContext = createContext<HybridAuthContextType | undefined>(
  undefined,
);

export const useHybridAuth = () => {
  const context = useContext(HybridAuthContext);
  if (context === undefined) {
    throw new Error("useHybridAuth must be used within a HybridAuthProvider");
  }
  return context;
};

// ------------------ Provider ------------------

interface HybridAuthProviderProps {
  children: ReactNode;
}

export const HybridAuthProvider = ({ children }: HybridAuthProviderProps) => {
  // Clerk setup
  const clerkAuth = useClerkAuth();
  const { user: clerkUser } = useUser();

  const { isLoaded, isSignedIn, signOut: clerkSignOut } = clerkAuth;

  // We no longer use Supabase Auth, so we don't need these states

  // Profiles
  const [donorProfile, setDonorProfile] = useState<DonorProfile | null>(null);
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [hospitalProfile, setHospitalProfile] = useState<Hospital | null>(null);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  // Computed user role based on which profile exists
  const userRole: UserRole | null = useMemo(() => {
    if (adminProfile) return "admin";
    if (donorProfile) return "donor";
    if (hospitalProfile) return "hospital";
    return null;
  }, [donorProfile, adminProfile, hospitalProfile]);

  // ------------------ Loading State Management ------------------

  // Ensure loading state is properly managed when Clerk is not loaded
  useEffect(() => {
    if (!isLoaded) {
      setLoading(true);
    }
  }, [isLoaded]);

  // Load Admin and Hospital profiles from localStorage on mount
  useEffect(() => {
    const savedAdmin = localStorage.getItem("adminProfile");
    const savedHospital = localStorage.getItem("hospitalProfile");

    if (savedAdmin) {
      try {
        setAdminProfile(JSON.parse(savedAdmin));
      } catch (e) {
        console.error("Failed to parse saved admin profile", e);
      }
    }

    if (savedHospital) {
      try {
        setHospitalProfile(JSON.parse(savedHospital));
      } catch (e) {
        console.error("Failed to parse saved hospital profile", e);
      }
    }
  }, []);

  // ------------------ Donor Profile ------------------

  const loadDonorProfile = async () => {
    if (!clerkUser) {
      setDonorProfile(null);
      setLoading(false);
      return;
    }

    try {
      // Test database connection
      const { data: testData, error: testError } = await supabase
        .from("donors")
        .select("count")
        .limit(1);

      if (testError) {
        console.error("Database connection test failed:", testError);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("donors")
        .select("*")
        .eq("clerk_user_id", clerkUser.id)
        .maybeSingle();

      if (error) console.error("Error fetching donor profile:", error);

      if (!data) {
        const donorName = (() => {
          if (clerkUser.fullName && clerkUser.fullName.trim()) {
            return clerkUser.fullName;
          }
          if (clerkUser.primaryEmailAddress?.emailAddress) {
            const emailPrefix =
              clerkUser.primaryEmailAddress.emailAddress.split("@")[0];
            if (emailPrefix && emailPrefix.trim()) {
              return emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
            }
          }
          return "Anonymous Donor";
        })();

        if (!donorName || donorName.trim() === "") {
          console.error("Failed to generate a valid donor name");
          setLoading(false);
          return;
        }

        const { data: insertData, error: insertError } = await supabase
          .from("donors")
          .insert({
            clerk_user_id: clerkUser.id,
            email: clerkUser.primaryEmailAddress?.emailAddress,
            name: donorName,
            phone: clerkUser.phoneNumbers[0]?.phoneNumber || null,
            profile_pic_url: clerkUser.imageUrl || null,
            points: 0,
            level: 1,
            is_verified: false,
          })
          .select()
          .single();

        if (insertError) {
          console.error("Error creating donor profile:", insertError);
          console.error("Clerk user data:", {
            id: clerkUser.id,
            fullName: clerkUser.fullName,
            email: clerkUser.primaryEmailAddress?.emailAddress,
            phone: clerkUser.phoneNumbers[0]?.phoneNumber,
            imageUrl: clerkUser.imageUrl,
          });
          console.error("Attempted to insert data:", {
            clerk_user_id: clerkUser.id,
            email: clerkUser.primaryEmailAddress?.emailAddress,
            name: donorName,
            phone: clerkUser.phoneNumbers[0]?.phoneNumber || null,
            profile_pic_url: clerkUser.imageUrl || null,
            points: 0,
            level: 1,
            is_verified: false,
          });
        } else {
          setDonorProfile(insertData);
        }
      } else {
        // Update profile with latest Clerk data
        const updateDonorName = (() => {
          if (clerkUser.fullName && clerkUser.fullName.trim()) {
            return clerkUser.fullName;
          }
          if (clerkUser.primaryEmailAddress?.emailAddress) {
            const emailPrefix =
              clerkUser.primaryEmailAddress.emailAddress.split("@")[0];
            if (emailPrefix && emailPrefix.trim()) {
              return emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);
            }
          }
          return "Anonymous Donor";
        })();

        const { data: updatedData, error: updateError } = await supabase
          .from("donors")
          .update({
            name: updateDonorName,
            email: clerkUser.primaryEmailAddress?.emailAddress,
            phone: clerkUser.phoneNumbers[0]?.phoneNumber || null,
            profile_pic_url: clerkUser.imageUrl || null,
          })
          .eq("clerk_user_id", clerkUser.id)
          .select()
          .single();

        if (updateError) {
          console.error("Error updating donor profile:", updateError);
          setDonorProfile(data);
        } else {
          setDonorProfile(updatedData);
        }
      }
    } catch (err) {
      console.error("Unexpected error loading donor profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSignedIn) {
      loadDonorProfile();
    } else {
      setDonorProfile(null);
      // Only set loading to false if Clerk is loaded and user is not signed in
      if (isLoaded) {
        setLoading(false);
      }
    }
  }, [isSignedIn, clerkUser, isLoaded]);

  // ------------------ Admin Profile ------------------

  const loadAdminProfile = async (email: string) => {
    try {
      const { data, error } = await supabase
        .from("admins")
        .select("*")
        .eq("email", email)
        .single();

      if (error) throw error;

      setAdminProfile(data);
    } catch (error) {
      console.error("Error loading admin profile:", error);
      setAdminProfile(null);
    }
  };

  // ------------------ Hospital Profile ------------------

  const loadHospitalProfile = async (email: string) => {
    try {
      const { data, error } = await supabase
        .from("hospitals")
        .select("*")
        .eq("email", email)
        .single();

      if (error) throw error;

      setHospitalProfile(data);
    } catch (error) {
      console.error("Error loading hospital profile:", error);
      setHospitalProfile(null);
    }
  };

  // We no longer use Supabase Auth, so we don't need this function

  // ------------------ Auth Functions ------------------

  const supabaseSignIn = async (
    email: string,
    password: string,
    expectedRole: "admin" | "hospital",
  ) => {
    try {
      if (expectedRole === "admin") {
        // Check admin credentials directly in the custom 'admins' table
        const { data: profileData, error: profileError } = await supabase
          .from("admins")
          .select("*")
          .eq("email", email)
          .eq("password", password)
          .single();

        if (profileError || !profileData) {
          throw new Error("Invalid admin credentials");
        }

        // Set the admin profile
        setAdminProfile(profileData);
        localStorage.setItem("adminProfile", JSON.stringify(profileData));

        return { data: profileData, error: null };
      } else if (expectedRole === "hospital") {
        // Check hospital credentials directly in the custom 'hospitals' table
        const { data: profileData, error: profileError } = await supabase
          .from("hospitals")
          .select("*")
          .eq("email", email)
          .eq("password", password)
          .single();

        if (profileError || !profileData) {
          throw new Error("Invalid hospital credentials");
        }

        // Set the hospital profile
        setHospitalProfile(profileData);
        localStorage.setItem("hospitalProfile", JSON.stringify(profileData));

        return { data: profileData, error: null };
      }

      throw new Error("Invalid role specified");
    } catch (error) {
      console.error("Sign in error:", error);
      return { data: null, error };
    }
  };

  const supabaseSignOut = async () => {
    setAdminProfile(null);
    setHospitalProfile(null);
    localStorage.removeItem("adminProfile");
    localStorage.removeItem("hospitalProfile");
    return { error: null };
  };

  // ------------------ Dashboard Routing ------------------

  const getRoleDashboard = () => {
    if (userRole === "admin") return "/admin";
    if (userRole === "donor") return "/dashboard";
    if (userRole === "hospital") return "/hospital-portal";
    return "/";
  };

  // ------------------ Provider Value ------------------

  const value: HybridAuthContextType = {
    userRole,
    donorProfile,
    adminProfile,
    hospitalProfile,
    isLoaded,
    isSignedIn: isSignedIn || !!adminProfile || !!hospitalProfile,
    loading: loading || profileLoading,
    clerkSignOut,
    supabaseSignIn,
    supabaseSignOut,
    updateDonorProfile: async (updates: Partial<DonorProfile>) => {
      if (!donorProfile?.id) {
        return { data: null, error: new Error("No donor profile loaded") };
      }
      try {
        const { data, error } = await supabase
          .from("donors")
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq("id", donorProfile.id)
          .select()
          .single();
        if (!error && data) {
          setDonorProfile(data);
        }
        return { data, error };
      } catch (err) {
        return { data: null, error: err as Error };
      }
    },
    updateAdminProfile: async (updates: Partial<AdminProfile>) => {
      if (!adminProfile?.id) {
        return { data: null, error: new Error("No admin profile loaded") };
      }
      try {
        const { data, error } = await supabase
          .from("admins")
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq("id", adminProfile.id)
          .select()
          .single();
        if (!error && data) {
          setAdminProfile(data);
          localStorage.setItem("adminProfile", JSON.stringify(data));
        }
        return { data, error };
      } catch (err) {
        return { data: null, error: err as Error };
      }
    },
    updateHospitalProfile: async (updates: Partial<Hospital>) => {
      if (!hospitalProfile?.id) {
        return { data: null, error: new Error("No hospital profile loaded") };
      }
      try {
        const { data, error } = await supabase
          .from("hospitals")
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq("id", hospitalProfile.id)
          .select()
          .single();
        if (!error && data) {
          setHospitalProfile(data);
          localStorage.setItem("hospitalProfile", JSON.stringify(data));
        }
        return { data, error };
      } catch (err) {
        return { data: null, error: err as Error };
      }
    },
    getRoleDashboard,
    refreshDonorProfile: loadDonorProfile,
  };

  return (
    <HybridAuthContext.Provider value={value}>
      {children}
    </HybridAuthContext.Provider>
  );
};
