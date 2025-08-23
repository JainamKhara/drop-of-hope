import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useAuth as useClerkAuth, useUser } from "@clerk/clerk-react";
import { User as SupabaseUser, Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

import { Profile } from "../lib/supabase";

// Use the unified Profile interface from supabase.ts
export type UserRole = "donor" | "admin" | "hospital";
export type UserProfile = Profile;

interface HybridAuthContextType {
  // User data
  userRole: UserRole | null;
  userProfile: Profile | null;

  // Auth state
  isLoaded: boolean;
  isSignedIn: boolean;
  loading: boolean;

  // Clerk auth functions (for donors)
  clerkSignOut: () => Promise<void>;

  // Supabase auth functions (for admins and hospital staff)
  supabaseSignIn: (
    email: string,
    password: string,
    expectedRole: "admin" | "hospital",
  ) => Promise<{ data: any; error: any }>;
  supabaseSignOut: () => Promise<{ error: any }>;

  // Profile management
  updateProfile: (
    updates: Partial<Profile>,
  ) => Promise<{ data: any; error: any }>;

  // Navigation helper
  getRoleDashboard: () => string;
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

interface HybridAuthProviderProps {
  children: ReactNode;
}

export const HybridAuthProvider = ({ children }: HybridAuthProviderProps) => {
  // Check if Clerk publishable key is configured
  const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  const isClerkConfigured =
    clerkPublishableKey && clerkPublishableKey.startsWith("pk_");

  // Only use Clerk hooks if properly configured
  let clerkAuth: any = null;
  let clerkUser: any = null;
  let isClerkAvailable = false;

  if (isClerkConfigured) {
    try {
      clerkAuth = useClerkAuth();
      clerkUser = useUser().user;
      isClerkAvailable = true;
    } catch (error) {
      // Only catch configuration errors, not runtime auth errors
      console.warn("Clerk configuration error:", error);
      isClerkAvailable = false;
    }
  }

  // Use Clerk data if available, otherwise use fallback values
  const {
    isLoaded,
    isSignedIn,
    signOut: clerkSignOut,
  } = isClerkAvailable
    ? clerkAuth
    : { isLoaded: true, isSignedIn: false, signOut: async () => {} };

  // Supabase auth for admins and hospital staff
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [supabaseSession, setSupabaseSession] = useState<Session | null>(null);

  // Unified user profile
  const [userProfile, setUserProfile] = useState<Profile | null>(null);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  // Determine user role from profile
  const userRole: UserRole | null = userProfile?.role || null;

  // Initialize Supabase auth
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSupabaseSession(session);
      setSupabaseUser(session?.user ?? null);
      if (session?.user) {
        loadSupabaseUserProfile(session.user.id);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSupabaseSession(session);
      setSupabaseUser(session?.user ?? null);

      if (session?.user) {
        await loadSupabaseUserProfile(session.user.id);
      } else {
        setAdminProfile(null);
        setHospitalStaffProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load donor profile when Clerk user changes
  useEffect(() => {
    if (isLoaded && isSignedIn && clerkUser) {
      loadDonorProfile(clerkUser.id);
    } else {
      setDonorProfile(null);
    }
  }, [isLoaded, isSignedIn, clerkUser]);

  // Set loading to false when auth system is loaded or when Clerk is not configured
  useEffect(() => {
    if (isLoaded || !isClerkConfigured) {
      // Only set loading to false if we're not waiting for profile to load
      if (!profileLoading) {
        setLoading(false);
      }
    }
  }, [isLoaded, isClerkConfigured, profileLoading]);

  // Handle loading state when profile is being loaded
  useEffect(() => {
    if (!profileLoading && (isLoaded || !isClerkConfigured)) {
      setLoading(false);
    }
  }, [profileLoading, isLoaded, isClerkConfigured]);

  const loadDonorProfile = async (clerkUserId: string) => {
    setProfileLoading(true);
    try {
      const { data, error } = await supabase
        .from("donors")
        .select("*")
        .eq("clerk_user_id", clerkUserId)
        .single();

      if (error && error.code === "PGRST116") {
        // Profile doesn't exist, create one
        if (clerkUser) {
          const newProfile: Omit<DonorProfile, "created_at" | "updated_at"> = {
            id: crypto.randomUUID(),
            clerk_user_id: clerkUserId,
            email: clerkUser.emailAddresses[0]?.emailAddress || "",
            name: clerkUser.fullName || clerkUser.firstName || "User",
            points: 0,
            level: 1,
            is_verified: false,
          };

          const { data: createdProfile, error: createError } = await supabase
            .from("donors")
            .insert([newProfile])
            .select()
            .single();

          if (createError) {
            console.error("Error creating donor profile:", createError);
          } else {
            setDonorProfile(createdProfile);
          }
        }
      } else if (data) {
        setDonorProfile(data);
      }
    } catch (error) {
      console.error("Error loading donor profile:", error);
    } finally {
      setProfileLoading(false);
    }
  };

  const loadSupabaseUserProfile = async (userId: string) => {
    setProfileLoading(true);
    try {
      // Try to find admin profile
      const { data: adminData } = await supabase
        .from("admins")
        .select("*")
        .eq("id", userId)
        .single();

      if (adminData) {
        setAdminProfile(adminData);
        return;
      }

      // Try to find hospital staff profile
      const { data: hospitalData } = await supabase
        .from("hospital_staff")
        .select("*")
        .eq("id", userId)
        .single();

      if (hospitalData) {
        setHospitalStaffProfile(hospitalData);
        return;
      }
    } catch (error) {
      console.error("Error loading Supabase user profile:", error);
    } finally {
      setProfileLoading(false);
    }
  };

  const supabaseSignIn = async (
    email: string,
    password: string,
    expectedRole: "admin" | "hospital",
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

    // Check user role in the appropriate table
    const tableName = expectedRole === "admin" ? "admins" : "hospital_staff";
    const { data: profile, error: profileError } = await supabase
      .from(tableName)
      .select("*")
      .eq("id", data.user.id)
      .single();

    if (profileError) {
      // Sign out the user since role check failed
      await supabase.auth.signOut();
      return { data: null, error: { message: "Unable to verify user role" } };
    }

    if (!profile) {
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
  };

  const supabaseSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    setSupabaseUser(null);
    setAdminProfile(null);
    setHospitalStaffProfile(null);
    setSupabaseSession(null);
    return { error };
  };

  const updateDonorProfile = async (updates: Partial<DonorProfile>) => {
    if (!donorProfile) {
      return { data: null, error: new Error("No donor profile loaded") };
    }

    try {
      const { data, error } = await supabase
        .from("donors")
        .update(updates)
        .eq("id", donorProfile.id)
        .select()
        .single();

      if (data) {
        setDonorProfile(data);
      }
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  };

  const updateAdminProfile = async (updates: Partial<AdminProfile>) => {
    if (!adminProfile) {
      return { data: null, error: new Error("No admin profile loaded") };
    }

    try {
      const { data, error } = await supabase
        .from("admins")
        .update(updates)
        .eq("id", adminProfile.id)
        .select()
        .single();

      if (data) {
        setAdminProfile(data);
      }
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  };

  const updateHospitalStaffProfile = async (
    updates: Partial<HospitalStaffProfile>,
  ) => {
    if (!hospitalStaffProfile) {
      return {
        data: null,
        error: new Error("No hospital staff profile loaded"),
      };
    }

    try {
      const { data, error } = await supabase
        .from("hospital_staff")
        .update(updates)
        .eq("id", hospitalStaffProfile.id)
        .select()
        .single();

      if (data) {
        setHospitalStaffProfile(data);
      }
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  };

  const getRoleDashboard = () => {
    switch (userRole) {
      case "admin":
        return "/admin";
      case "hospital":
        return "/hospital-portal";
      case "donor":
      default:
        return "/dashboard";
    }
  };

  const value: HybridAuthContextType = {
    userRole,
    donorProfile,
    adminProfile,
    hospitalStaffProfile,
    isLoaded,
    isSignedIn: isSignedIn || !!supabaseUser,
    loading: loading || profileLoading,
    clerkSignOut,
    supabaseSignIn,
    supabaseSignOut,
    updateDonorProfile,
    updateAdminProfile,
    updateHospitalStaffProfile,
    getRoleDashboard,
  };

  return (
    <HybridAuthContext.Provider value={value}>
      {children}
    </HybridAuthContext.Provider>
  );
};

// Legacy Auth Hook for backward compatibility
export const useAuth = () => {
  const hybridAuth = useHybridAuth();

  // Convert hybrid auth to legacy auth format for existing components
  return {
    user:
      hybridAuth.donorProfile ||
      hybridAuth.adminProfile ||
      hybridAuth.hospitalStaffProfile,
    profile:
      hybridAuth.donorProfile ||
      hybridAuth.adminProfile ||
      hybridAuth.hospitalStaffProfile,
    session: null, // Legacy session not needed
    loading: hybridAuth.loading,
    signUp: () =>
      Promise.resolve({
        data: null,
        error: new Error("Use Clerk for donor signup"),
      }),
    signIn: () =>
      Promise.resolve({
        data: null,
        error: new Error("Use role-specific signin"),
      }),
    signOut: () => {
      if (hybridAuth.userRole === "donor") {
        return hybridAuth.clerkSignOut().then(() => ({ error: null }));
      } else {
        return hybridAuth.supabaseSignOut();
      }
    },
    updateProfile: (updates: any) => {
      if (hybridAuth.userRole === "donor") {
        return hybridAuth.updateDonorProfile(updates);
      } else if (hybridAuth.userRole === "admin") {
        return hybridAuth.updateAdminProfile(updates);
      } else if (hybridAuth.userRole === "hospital") {
        return hybridAuth.updateHospitalStaffProfile(updates);
      }
      return Promise.resolve({
        data: null,
        error: new Error("No profile loaded"),
      });
    },
    getRoleDashboard: hybridAuth.getRoleDashboard,
  };
};
