import React from "react";
import { Link } from "react-router-dom";
import { SignUp, useAuth } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Heart, ArrowLeft, AlertCircle, ExternalLink } from "lucide-react";

function ClerkSignUpForm() {
  return (
    <div className="flex justify-center">
      <SignUp
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
            <li>Go to your Clerk Dashboard</li>
            <li>Navigate to API Keys section</li>
            <li>Copy your Publishable Key (starts with pk_)</li>
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
  // Check if we're in a Clerk context
  let isClerkAvailable = false;
  let clerkError = null;

  try {
    // This will throw if Clerk is not available
    const auth = useAuth();
    isClerkAvailable = true;
  } catch (error) {
    isClerkAvailable = false;
    clerkError = error;
    console.warn("Clerk registration unavailable:", error);
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
              Join Drop of Hope
            </h1>
            <p className="text-muted-foreground">
              Create your donor account and start saving lives
            </p>
          </div>

          {/* Registration Form or Error Message */}
          {isClerkAvailable ? <ClerkSignUpForm /> : <ClerkUnavailableMessage />}

          {/* Additional Info */}
          <div className="mt-8 text-center">
            <p className="text-muted-foreground mb-4">
              Already have an account?{" "}
              <Link
                to="/donor/login"
                className="text-hope-red hover:text-hope-red/80 font-medium"
              >
                Sign in here
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
              <p>By creating an account, you agree to our</p>
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
