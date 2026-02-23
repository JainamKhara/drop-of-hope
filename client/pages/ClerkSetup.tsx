import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, ArrowLeft } from "lucide-react";
import ClerkSetupInstructions from "@/components/ClerkSetupInstructions";

export default function ClerkSetup() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Authentication Setup
          </h1>
          <p className="text-gray-600">
            Configure Clerk to enable donor authentication
          </p>
        </div>

        <ClerkSetupInstructions />

        <div className="text-center mt-8">
          <div className="space-x-4">
            <Button asChild variant="outline">
              <Link to="/admin/login">Admin Login</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/hospital/login">Hospital Login</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
