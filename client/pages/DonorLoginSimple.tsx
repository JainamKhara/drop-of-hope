import React from "react";
import { SignIn } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

export default function DonorLoginSimple() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-md mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-center">Simple Donor Login</h1>
        
        {/* Debug info */}
        <div className="bg-gray-100 p-4 rounded text-sm">
          <p>Clerk Key: {import.meta.env.VITE_CLERK_PUBLISHABLE_KEY?.slice(0, 30)}...</p>
          <p>Mode: {import.meta.env.MODE}</p>
        </div>

        {/* Minimal SignIn - no custom styling */}
        <div className="border p-4 rounded">
          <SignIn 
            routing="hash"
            redirectUrl="/dashboard"
            afterSignInUrl="/dashboard"
          />
        </div>

        <div className="text-center space-x-4">
          <Link to="/clerk-test" className="text-blue-600">Test Page</Link>
          <Link to="/donor/login" className="text-blue-600">Styled Version</Link>
          <Link to="/" className="text-blue-600">Home</Link>
        </div>
      </div>
    </div>
  );
}
