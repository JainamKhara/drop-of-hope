import React from "react";
import { Link, Navigate } from "react-router-dom";
import { SignIn, useAuth } from "@clerk/clerk-react";
import { useHybridAuth } from "@/contexts/HybridAuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Heart,
  ArrowLeft,
  AlertCircle,
  ExternalLink,
  Settings,
} from "lucide-react";

function ClerkLoginForm() {
  return (
    <div className="flex justify-center">
      <SignIn
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-xl border-0 bg-white dark:bg-gray-800",
            headerTitle: "text-hope-red font-bold",
            headerSubtitle: "text-muted-foreground",

            // OAuth/Social buttons styling
            socialButtonsBlockButton:
              "border border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 font-medium",
            socialButtonsBlockButtonText:
              "text-gray-700 dark:text-gray-200 font-medium",

            // Primary form button
            formButtonPrimary:
              "bg-hope-red hover:bg-hope-red/90 border-hope-red text-white font-medium transition-colors duration-200",

            // Form styling
            formFieldInput:
              "border-gray-300 focus:border-hope-red focus:ring-hope-red",
            formFieldLabel: "text-gray-700 dark:text-gray-200",

            // Footer links
            footerActionLink:
              "text-hope-red hover:text-hope-red/80 font-medium",

            // Divider styling
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
        afterSignInUrl="/dashboard"
        signUpUrl="/donor/register"
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
            Clerk publishable key.
          </AlertDescription>
        </Alert>

        <div className="space-y-3 text-sm">
          <p className="font-medium text-red-800">To fix this:</p>
          <ol className="list-decimal list-inside space-y-2 text-red-700">
            <li>Go to your Clerk Dashboard (create free account if needed)</li>
            <li>Create a new application or select existing one</li>
            <li>Navigate to API Keys section</li>
            <li>Copy your Publishable Key (starts with pk_test_ or pk_live_)</li>
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
              Open Clerk Dashboard
            </a>
          </Button>

          <Button
            asChild
            variant="outline"
            className="border-blue-300 text-blue-700 hover:bg-blue-100"
          >
            <Link to="/clerk-setup" className="flex items-center">
              <Settings className="w-4 h-4 mr-2" />
              Setup Instructions
            </Link>
          </Button>

          <div className="text-xs text-red-600 bg-red-100 p-2 rounded">
            <strong>Current Key:</strong>{" "}
            {import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "Not set"}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DonorLogin() {
  const { userRole, isSignedIn, loading } = useHybridAuth();

  // Check if we're in a Clerk context
  let isClerkAvailable = false;
  let clerkError = null;

  try {
    // This will throw if Clerk is not available
    const auth = useAuth();
    isClerkAvailable = true;
  } catch (error) {
    clerkError = error;
    isClerkAvailable = false;
    console.warn("Clerk login unavailable:", error);
  }

  // Only redirect if authentication and profile loading are completely finished
  // This prevents redirect cycles by ensuring userRole is fully determined
  if (!loading && isSignedIn && userRole === "donor") {
    return <Navigate to="/dashboard" replace />;
  }

  // Redirect other user types to their dashboards (only if role is definitively determined)
  if (!loading && isSignedIn && userRole && userRole !== "donor") {
    const dashboard = userRole === "admin" ? "/admin" : "/hospital-portal";
    return <Navigate to={dashboard} replace />;
  }

  // Show loading while authentication state is being determined
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-hope-red rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Heart className="w-6 h-6 text-white fill-current" />
          </div>
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-hope-pink to-white dark:from-hope-coral dark:to-background">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md dark:bg-card/80">
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
        <div className="max-w-md mx-auto">
          {/* Welcome Message */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-hope-red mb-2">
              Welcome Back, Donor
            </h1>
            <p className="text-muted-foreground">
              Sign in to continue your life-saving journey
            </p>
          </div>

          {/* Authentication Form or Error Message */}
          {isClerkAvailable ? <ClerkLoginForm /> : <ClerkUnavailableMessage />}

          {/* Additional Info */}
          <div className="mt-8 text-center">
            <p className="text-muted-foreground mb-4">
              Don't have an account?{" "}
              <Link
                to="/donor/register"
                className="text-hope-red hover:text-hope-red/80 font-medium"
              >
                Sign up here
              </Link>
            </p>

            <p className="text-muted-foreground mb-4">
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

            <div className="space-y-2 text-sm text-muted-foreground">
              <p>By signing in, you agree to our</p>
              <div className="space-x-4">
                <Link
                  to="/terms"
                  className="hover:text-hope-red transition-colors"
                >
                  Terms of Service
                </Link>
                <span>•</span>
                <Link
                  to="/privacy"
                  className="hover:text-hope-red transition-colors"
                >
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-hope-pink/30 to-transparent pointer-events-none" />
    </div>
  );
}
