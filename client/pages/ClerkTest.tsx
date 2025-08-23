import React from "react";
import { SignIn, SignUp, useAuth, useUser } from "@clerk/clerk-react";

export default function ClerkTest() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();

  return (
    <div className="min-h-screen p-8 space-y-8">
      <h1 className="text-2xl font-bold">Clerk Test Page</h1>
      
      {/* Debug Info */}
      <div className="bg-gray-100 p-4 rounded">
        <h2 className="font-bold mb-2">Debug Info:</h2>
        <p>Clerk Loaded: {isLoaded ? "Yes" : "No"}</p>
        <p>Signed In: {isSignedIn ? "Yes" : "No"}</p>
        <p>User: {user ? user.emailAddresses?.[0]?.emailAddress || "No email" : "None"}</p>
        <p>Clerk Key: {import.meta.env.VITE_CLERK_PUBLISHABLE_KEY?.slice(0, 30)}...</p>
        <p>Environment: {import.meta.env.MODE}</p>
      </div>

      {/* Simple SignIn Test */}
      <div className="bg-white border rounded p-4">
        <h2 className="font-bold mb-4">Simple Sign In Test:</h2>
        <SignIn 
          path="/clerk-test"
          routing="path"
          signUpUrl="/clerk-test"
          appearance={{
            elements: {
              card: "shadow-lg"
            }
          }}
        />
      </div>

      {/* Check if social providers are configured */}
      <div className="bg-blue-50 p-4 rounded">
        <h2 className="font-bold mb-2">Social Providers:</h2>
        <p>If you don't see Google/social buttons above, you need to:</p>
        <ol className="list-decimal list-inside space-y-1 text-sm mt-2">
          <li>Go to your Clerk Dashboard</li>
          <li>Navigate to Configure → Social providers</li>
          <li>Enable Google OAuth</li>
          <li>Add your Google OAuth credentials</li>
        </ol>
      </div>
    </div>
  );
}
