import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { SignUp, useAuth } from "@clerk/clerk-react";
import { useMockAuth, MockSignUp } from "@/contexts/MockAuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, ArrowLeft } from "lucide-react";

const hasValidClerkKey =
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY &&
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY !== "__CLERK_PUBLISHABLE_KEY__";

export default function Register() {
  // Use Clerk auth if available, otherwise use mock auth
  let isSignedIn, isLoaded;

  if (hasValidClerkKey) {
    const clerkAuth = useAuth();
    isSignedIn = clerkAuth.isSignedIn;
    isLoaded = clerkAuth.isLoaded;
  } else {
    const mockAuth = useMockAuth();
    isSignedIn = mockAuth.isSignedIn;
    isLoaded = mockAuth.isLoaded;
  }

  const navigate = useNavigate();

  // Redirect to dashboard if already signed in
  React.useEffect(() => {
    if (isSignedIn) {
      navigate("/dashboard");
    }
  }, [isSignedIn, navigate]);

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
              Start your journey as a life-saving donor
            </p>
          </div>

          {/* Clerk Sign Up Component */}
          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl text-hope-red">
                Create Account
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex justify-center">
                {hasValidClerkKey ? (
                  <SignUp
                    routing="path"
                    path="/register"
                    redirectUrl="/dashboard"
                    signInUrl="/login"
                    appearance={{
                      elements: {
                        formButtonPrimary: {
                          backgroundColor: "hsl(var(--hope-red))",
                          "&:hover": {
                            backgroundColor: "hsl(var(--hope-red) / 0.9)",
                          },
                        },
                        socialButtonsBlockButton: {
                          border: "1px solid hsl(var(--border))",
                          "&:hover": {
                            backgroundColor: "hsl(var(--hope-red))",
                            color: "white",
                          },
                        },
                        dividerLine: {
                          backgroundColor: "hsl(var(--border))",
                        },
                        formFieldInput: {
                          borderColor: "hsl(var(--border))",
                          "&:focus": {
                            borderColor: "hsl(var(--hope-red))",
                            boxShadow: "0 0 0 2px hsl(var(--hope-red) / 0.2)",
                          },
                        },
                        footerActionLink: {
                          color: "hsl(var(--hope-red))",
                          "&:hover": {
                            color: "hsl(var(--hope-red) / 0.8)",
                          },
                        },
                      },
                      layout: {
                        socialButtonsPlacement: "top",
                        socialButtonsVariant: "blockButton",
                      },
                    }}
                  />
                ) : (
                  <MockSignUp />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <div className="mt-8 text-center">
            <p className="text-muted-foreground mb-4">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-hope-red hover:text-hope-red/80 font-medium"
              >
                Sign in here
              </Link>
            </p>

            <div className="bg-hope-pink dark:bg-hope-coral p-4 rounded-lg mb-4">
              <h3 className="font-semibold text-hope-red mb-2">
                Why Join Drop of Hope?
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1 text-left">
                <li>• Save lives through blood donation</li>
                <li>• Earn rewards and recognition</li>
                <li>• Find donation drives near you</li>
                <li>• Track your donation impact</li>
              </ul>
            </div>

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
