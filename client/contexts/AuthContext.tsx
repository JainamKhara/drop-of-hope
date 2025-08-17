import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, auth, db, Profile } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: { name: string; role?: string }) => Promise<{ data: any; error: any }>;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<{ error: any }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ data: any; error: any }>;
  getRoleDashboard: () => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await loadUserProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data: existingProfile, error } = await db.getProfile(userId);
      
      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create one
        const user = await auth.getCurrentUser();
        if (user.user) {
          const newProfile: Omit<Profile, 'created_at' | 'updated_at'> = {
            id: userId,
            email: user.user.email || '',
            name: user.user.user_metadata?.name || 'User',
            role: user.user.user_metadata?.role || 'donor',
            points: 0,
            level: 1,
            is_verified: false
          };
          
          const { data: createdProfile, error: createError } = await db.createProfile(newProfile);
          if (createError) {
            console.error('Error creating profile:', createError);
          } else {
            setProfile(createdProfile);
          }
        }
      } else if (existingProfile) {
        setProfile(existingProfile);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: { name: string; role?: string }) => {
    setLoading(true);
    try {
      const result = await auth.signUp(email, password, userData);
      return result;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const result = await auth.signIn(email, password);
      return result;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      const result = await auth.signOut();
      setUser(null);
      setProfile(null);
      setSession(null);
      return result;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) {
      return { data: null, error: new Error('No user logged in') };
    }

    try {
      const result = await db.updateProfile(user.id, updates);
      if (result.data) {
        setProfile(result.data);
      }
      return result;
    } catch (error) {
      return { data: null, error };
    }
  };

  const getRoleDashboard = () => {
    if (!profile) return '/dashboard';

    switch (profile.role) {
      case 'admin':
        return '/admin';
      case 'hospital':
        return '/hospital-portal';
      case 'donor':
      default:
        return '/dashboard';
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Auth UI Components for sign in/up forms
export const SignInForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await signIn(email, password);
    
    if (error) {
      setError(error.message);
    } else {
      onSuccess?.();
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hope-red-500"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hope-red-500"
            required
          />
        </div>
        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-hope-red-600 text-white py-2 px-4 rounded-md hover:bg-hope-red-700 disabled:opacity-50"
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
};

export const SignUpForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('donor');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await signUp(email, password, { name, role });
    
    if (error) {
      setError(error.message);
    } else {
      onSuccess?.();
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hope-red-500"
            required
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hope-red-500"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hope-red-500"
            required
          />
        </div>
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
            Role
          </label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hope-red-500"
          >
            <option value="donor">Donor</option>
            <option value="hospital">Hospital Staff</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-hope-red-600 text-white py-2 px-4 rounded-md hover:bg-hope-red-700 disabled:opacity-50"
        >
          {loading ? 'Signing Up...' : 'Sign Up'}
        </button>
      </form>
    </div>
  );
};

export const SignOutButton = ({ className = "" }: { className?: string }) => {
  const { signOut, loading } = useAuth();

  return (
    <button
      onClick={signOut}
      disabled={loading}
      className={`bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 disabled:opacity-50 ${className}`}
    >
      {loading ? 'Signing Out...' : 'Sign Out'}
    </button>
  );
};
