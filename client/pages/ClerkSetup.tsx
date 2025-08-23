import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, ArrowLeft } from "lucide-react";
import ClerkSetupInstructions from "@/components/ClerkSetupInstructions";

export default function ClerkSetup() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-hope-red rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-white fill-current" />
              </div>
              <span className="text-xl font-bold text-hope-red">
                Drop of Hope
              </span>
            </Link>
            <Button variant="outline" asChild>
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </header>

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
