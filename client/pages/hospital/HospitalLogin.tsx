import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useHybridAuth } from "@/contexts/HybridAuthContext";
import { validateCredentials } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Heart,
  ArrowLeft,
  Building2,
  Package,
  FileText,
  Calendar,
  Users,
} from "lucide-react";

export default function HospitalLogin() {
  const { hospitalProfile, loading, supabaseSignIn, getRoleDashboard } =
    useHybridAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect to appropriate dashboard if already signed in
  React.useEffect(() => {
    if (hospitalProfile && !loading) {
      navigate("/hospital-portal");
    }
  }, [hospitalProfile, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Validate credentials format before submission
      const validation = validateCredentials(email, password);
      if (!validation.valid) {
        setError(validation.error || "Invalid input");
        setIsLoading(false);
        return;
      }

      // Use role-based authentication to ensure only hospital staff can login
      const { data, error } = await supabaseSignIn(email, password, "hospital");

      if (error) {
        setError(error.message || "Authentication failed");
      } else if (data) {
        // Successfully authenticated as hospital
        setError("");
        // Navigate to hospital portal
        navigate("/hospital-portal");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);

    // Auto-submit after setting demo credentials
    setTimeout(() => {
      const form = document.querySelector("form");
      if (form) {
        form.dispatchEvent(
          new Event("submit", { cancelable: true, bubbles: true }),
        );
      }
    }, 100);
  };

  if (loading) {
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-green-950 dark:to-background">
      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          {/* Welcome Message */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
              Hospital Portal
            </h1>
            <p className="text-muted-foreground">
              Manage blood inventory and requests
            </p>
          </div>

          {/* Hospital Features Overview */}
          <Card className="mb-6 border-green-200 dark:border-green-800">
            <CardHeader>
              <CardTitle className="text-green-600 dark:text-green-400 text-center">
                Hospital Portal Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Package className="w-4 h-4 text-green-600" />
                  <span>Blood Inventory</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-green-600" />
                  <span>Blood Requests</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-green-600" />
                  <span>Drive Management</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-green-600" />
                  <span>Donor Coordination</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sign In Form */}
          <Card className="border-2 border-[hsl(0,80%,50%)] rounded-sm">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl text-green-600 dark:text-green-400">
                Hospital Staff Sign In
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Access your hospital's blood management portal
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Hospital Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="staff@hospital.com"
                    required
                  />
                </div>
                <div>
                  <Label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {isLoading ? "Signing In..." : "Access Hospital Portal"}
                </button>
              </form>
            </CardContent>
          </Card>

          {/* Demo Credentials */}
          <Card className="mt-6 border-green-200 bg-green-50 dark:bg-green-950">
            <CardHeader>
              <CardTitle className="text-green-800 dark:text-green-200 text-center">
                Demo Credentials
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-green-700 dark:text-green-300 text-center mb-3">
                  Use these test credentials to access the hospital portal:
                </p>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-green-700 border-green-300 hover:bg-green-100 dark:text-green-300 dark:border-green-800 dark:hover:bg-green-900/50"
                    onClick={() =>
                      handleDemoLogin("info@citygeneral.com", "hospital123")
                    }
                    disabled={isLoading}
                  >
                    City General Hospital
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <div className="mt-8 text-center">
            <p className="text-muted-foreground mb-4">
              Not hospital staff?{" "}
              <Link
                to="/login"
                className="text-[hsl(0,80%,50%)] hover:text-[hsl(0,80%,50%)]/80 font-medium"
              >
                Donor login
              </Link>{" "}
              |{" "}
              <Link
                to="/admin/login"
                className="text-blue-600 hover:text-blue-600/80 font-medium"
              >
                Admin login
              </Link>
            </p>

            <Alert className="border-green-200 bg-green-50 dark:bg-green-950 mb-4">
              <Building2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                <strong>Hospital Staff Only:</strong> This portal is for
                verified hospital personnel. Access requires proper credentials
                and authorization from your hospital administrator.
              </AlertDescription>
            </Alert>

            {/* Hospital Registration Info */}
            <Card className="border-green-200 bg-green-50 dark:bg-green-950">
              <CardContent className="pt-4">
                <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                  New Hospital Registration
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                  If your hospital isn't registered with Drop of Hope, please
                  contact our team to get started.
                </p>
                <div className="space-y-1 text-sm text-green-600">
                  <p>📧 hospitals@dropofhope.com</p>
                  <p>📞 1-800-HOSPITAL</p>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2 text-sm text-muted-foreground mt-4">
              <p>By signing in, you agree to our</p>
              <div className="space-x-4">
                <Link
                  to="/terms"
                  className="hover:text-green-600 transition-colors"
                >
                  Terms of Service
                </Link>
                <span>•</span>
                <Link
                  to="/privacy"
                  className="hover:text-green-600 transition-colors"
                >
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-green-100/30 to-transparent pointer-events-none dark:from-green-900/30" />
    </div>
  );
}
