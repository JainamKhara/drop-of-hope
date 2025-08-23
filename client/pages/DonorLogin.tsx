import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { SignIn } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Heart, ArrowLeft } from "lucide-react";
import ClerkDebug from "@/components/ClerkDebug";

export default function DonorLogin() {
  const navigate = useNavigate();

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
          {/* Debug Info */}
          <ClerkDebug />

          {/* Welcome Message */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-hope-red mb-2">
              Welcome Back, Donor
            </h1>
            <p className="text-muted-foreground">
              Sign in to continue your life-saving journey
            </p>
          </div>

          {/* Clerk Sign In Component */}
          <div className="flex justify-center">
            <SignIn
              appearance={{
                elements: {
                  rootBox: "mx-auto",
                  card: "shadow-xl border-0 bg-white dark:bg-gray-800",
                  headerTitle: "text-hope-red font-bold",
                  headerSubtitle: "text-muted-foreground",

                  // OAuth/Social buttons styling
                  socialButtonsBlockButton: "border border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 font-medium",
                  socialButtonsBlockButtonText: "text-gray-700 dark:text-gray-200 font-medium",

                  // Primary form button
                  formButtonPrimary: "bg-hope-red hover:bg-hope-red/90 border-hope-red text-white font-medium transition-colors duration-200",

                  // Form styling
                  formFieldInput: "border-gray-300 focus:border-hope-red focus:ring-hope-red",
                  formFieldLabel: "text-gray-700 dark:text-gray-200",

                  // Footer links
                  footerActionLink: "text-hope-red hover:text-hope-red/80 font-medium",

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
              afterSignInUrl="/dashboard"
            />
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-center">
            <p className="text-muted-foreground mb-4">
              Don't have an account?{" "}
              <Link
                to="/register"
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
