import React from "react";
import { Link, Navigate } from "react-router-dom";
import { SignUp, useAuth } from "@clerk/clerk-react";
import { useHybridAuth } from "@/contexts/HybridAuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Heart, AlertCircle, ExternalLink } from "lucide-react";

function ClerkSignUpForm() {
  return (
    <div className="flex justify-center">
      <SignUp
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "border-2 border-[hsl(0,80%,50%)] rounded-sm bg-white dark:bg-gray-800",
            headerTitle: "text-[hsl(0,80%,50%)] font-bold",
            headerSubtitle: "text-muted-foreground",
            socialButtonsBlockButton:
              "border border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 font-medium",
            socialButtonsBlockButtonText:
              "text-gray-700 dark:text-gray-200 font-medium",
            formButtonPrimary:
              "bg-[hsl(0,80%,50%)] hover:bg-[hsl(0,80%,50%)]/90 border-[hsl(0,80%,50%)] text-white font-medium transition-colors duration-200",
            formFieldInput:
              "border-gray-300 focus:border-[hsl(0,80%,50%)] focus:ring-[hsl(0,80%,50%)]",
            formFieldLabel: "text-gray-700 dark:text-gray-200",
            footerActionLink:
              "text-[hsl(0,80%,50%)] hover:text-[hsl(0,80%,50%)]/80 font-medium",
            dividerLine: "bg-gray-200",
            dividerText: "text-gray-500",
          },
          layout: {
            socialButtonsPlacement: "top",
            socialButtonsVariant: "blockButton",
            termsPageUrl: "/terms",
            privacyPageUrl: "/privacy",
          },
        }}
        redirectUrl="/dashboard"
        afterSignUpUrl="/dashboard"
      />
    </div>
  );
}

function ClerkUnavailableMessage() {
  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="flex items-center text-red-800">
          <AlertCircle className="w-5 h-5 mr-2" />
          Authentication Setup Required
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Clerk authentication is not properly configured. Please set up your
            Clerk publishable key to enable donor registration.
          </AlertDescription>
        </Alert>

        <div className="space-y-3 text-sm">
          <p className="font-medium text-red-800">
            To enable donor registration:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-red-700">
            <li>Go to your Clerk Dashboard (create free account if needed)</li>
            <li>Create a new application or select existing one</li>
            <li>Navigate to API Keys section</li>
            <li>
              Copy your Publishable Key (starts with pk_test_ or pk_live_)
            </li>
            <li>Update the VITE_CLERK_PUBLISHABLE_KEY environment variable</li>
            <li>Restart the development server</li>
          </ol>
        </div>

        <div className="flex flex-col space-y-2">
          <Button
            asChild
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-100"
          >
            <a
              href="https://dashboard.clerk.com/last-active?path=api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Get Clerk API Key
            </a>
          </Button>

          <div className="text-xs text-red-600 bg-red-100 p-2 rounded">
            <strong>Current Key:</strong>{" "}
            {import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "Not set"}
          </div>
        </div>

        <div className="bg-blue-50 p-3 rounded text-sm">
          <p className="font-medium text-blue-800 mb-1">Alternative Access:</p>
          <p className="text-blue-700">
            Admin and Hospital staff can still access their respective login
            pages which use Supabase authentication.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DonorRegister() {
  const { userRole, isSignedIn, loading } = useHybridAuth();
  const { isLoaded: clerkLoaded } = useAuth();

  // Wait for Clerk SDK to initialise at runtime
  if (!clerkLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 animate-pulse">
            <img src="/drop_of_hope_logo.png" alt="Loading..." className="w-full h-full object-contain" />
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if already signed in as donor
  if (isSignedIn && userRole === "donor") {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[hsl(0,0%,6%)] overflow-y-auto">
      <div className="container mx-auto px-4 py-6 md:py-12">
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-[hsl(0,80%,50%)] mb-2">
              Join Drop of Hope
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Create your donor account and start saving lives
            </p>
          </div>

          {/* ✅ If Clerk configured → show SignUp, else fallback */}
          <div className="w-full">
            {clerkLoaded ? <ClerkSignUpForm /> : <ClerkUnavailableMessage />}
          </div>

          <div className="mt-6 text-center pb-8">
            <p className="text-muted-foreground mb-4 text-sm">
              Already have an account?{" "}
              <Link
                to="/donor/login"
                className="text-[hsl(0,80%,50%)] hover:text-[hsl(0,80%,50%)]/80 font-medium"
              >
                Sign in here
              </Link>
            </p>

            <p className="text-muted-foreground mb-4 text-sm">
              Not a donor?{" "}
              <Link
                to="/admin/login"
                className="text-blue-600 hover:text-blue-600/80 font-medium"
              >
                Admin login
              </Link>{" "}
              |{" "}
              <Link
                to="/hospital/login"
                className="text-green-600 hover:text-green-600/80 font-medium"
              >
                Hospital login
              </Link>
            </p>

            <div className="space-y-1 text-xs text-muted-foreground">
              <p>By creating an account, you agree to our</p>
              <div className="space-x-4">
                <Link
                  to="/terms"
                  className="hover:text-[hsl(0,80%,50%)] transition-colors"
                >
                  Terms of Service
                </Link>
                <span>•</span>
                <Link
                  to="/privacy"
                  className="hover:text-[hsl(0,80%,50%)] transition-colors"
                >
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
