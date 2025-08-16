import React, { createContext, useContext, useState, ReactNode } from 'react';

// Mock user data
const mockUser = {
  id: 'mock-user-1',
  firstName: 'John',
  lastName: 'Doe',
  fullName: 'John Doe',
  emailAddresses: [{ emailAddress: 'john.doe@example.com' }],
  imageUrl: null,
  createdAt: new Date('2022-01-01'),
};

interface MockAuthContextType {
  isSignedIn: boolean;
  isLoaded: boolean;
  user: typeof mockUser | null;
  signIn: () => void;
  signOut: () => void;
}

const MockAuthContext = createContext<MockAuthContextType | undefined>(undefined);

export function MockAuthProvider({ children }: { children: ReactNode }) {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoaded] = useState(true);

  const signIn = () => setIsSignedIn(true);
  const signOut = () => setIsSignedIn(false);

  const value: MockAuthContextType = {
    isSignedIn,
    isLoaded,
    user: isSignedIn ? mockUser : null,
    signIn,
    signOut,
  };

  return (
    <MockAuthContext.Provider value={value}>
      {children}
    </MockAuthContext.Provider>
  );
}

export function useMockAuth() {
  const context = useContext(MockAuthContext);
  if (context === undefined) {
    throw new Error('useMockAuth must be used within a MockAuthProvider');
  }
  return context;
}

// Mock components for Clerk compatibility
export function MockSignIn() {
  const { signIn } = useMockAuth();
  
  return (
    <div className="w-full max-w-sm mx-auto p-6 bg-card rounded-lg border">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Demo Mode</h2>
        <p className="text-muted-foreground text-sm mt-2">
          Clerk authentication is not configured. Click below to simulate sign in.
        </p>
      </div>
      
      <button
        onClick={signIn}
        className="w-full bg-hope-red hover:bg-hope-red/90 text-white font-medium py-2 px-4 rounded-md transition-colors"
      >
        Sign In (Demo)
      </button>
      
      <div className="mt-4 p-3 bg-hope-pink dark:bg-hope-coral rounded text-sm">
        <p className="font-medium text-hope-red mb-1">To use real authentication:</p>
        <ol className="text-muted-foreground space-y-1 text-xs">
          <li>1. Get your Clerk key from dashboard.clerk.com</li>
          <li>2. Replace __CLERK_PUBLISHABLE_KEY__ in .env file</li>
          <li>3. Restart the dev server</li>
        </ol>
      </div>
    </div>
  );
}

export function MockSignUp() {
  const { signIn } = useMockAuth();
  
  return (
    <div className="w-full max-w-sm mx-auto p-6 bg-card rounded-lg border">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Demo Mode</h2>
        <p className="text-muted-foreground text-sm mt-2">
          Clerk authentication is not configured. Click below to simulate sign up.
        </p>
      </div>
      
      <button
        onClick={signIn}
        className="w-full bg-hope-red hover:bg-hope-red/90 text-white font-medium py-2 px-4 rounded-md transition-colors"
      >
        Sign Up (Demo)
      </button>
      
      <div className="mt-4 p-3 bg-hope-pink dark:bg-hope-coral rounded text-sm">
        <p className="font-medium text-hope-red mb-1">To use real authentication:</p>
        <ol className="text-muted-foreground space-y-1 text-xs">
          <li>1. Get your Clerk key from dashboard.clerk.com</li>
          <li>2. Replace __CLERK_PUBLISHABLE_KEY__ in .env file</li>
          <li>3. Restart the dev server</li>
        </ol>
      </div>
    </div>
  );
}

export function MockSignOutButton({ children }: { children: ReactNode }) {
  const { signOut } = useMockAuth();
  
  return (
    <div onClick={signOut} style={{ cursor: 'pointer' }}>
      {children}
    </div>
  );
}
