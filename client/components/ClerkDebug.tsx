import React from "react";
import { useAuth, useUser } from "@clerk/clerk-react";

export default function ClerkDebug() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();

  if (!isLoaded) {
    return <div className="p-4 bg-yellow-100 text-yellow-800">Clerk: Loading...</div>;
  }

  return (
    <div className="p-4 bg-blue-100 text-blue-800 text-xs space-y-2">
      <div>Clerk Status: {isSignedIn ? "Signed In" : "Not Signed In"}</div>
      <div>Clerk Key: {import.meta.env.VITE_CLERK_PUBLISHABLE_KEY?.slice(0, 20)}...</div>
      <div>User: {user ? user.emailAddresses?.[0]?.emailAddress : "None"}</div>
      <div>Environment: {import.meta.env.MODE}</div>
    </div>
  );
}
