import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useHybridAuth } from "@/contexts/HybridAuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Heart,
  ArrowLeft,
  Shield,
  Users,
  BarChart3,
  Settings,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";

export default function AdminLogin() {
  const { adminProfile, loading, supabaseSignIn, getRoleDashboard } =
    useHybridAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Redirect to appropriate dashboard if already signed in
  useEffect(() => {
    if (adminProfile && !loading) {
      navigate(getRoleDashboard());
    }
  }, [adminProfile, loading, navigate, getRoleDashboard]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Use role-based authentication to ensure only admins can login
      const { data, error } = await supabaseSignIn(email, password, "admin");

      if (error) {
        setError(error.message || "Authentication failed");
      } else if (data) {
        // Successfully authenticated as admin
        setError("");
        // Navigate to admin dashboard
        navigate("/admin");
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
          <div className="w-8 h-8 bg-[hsl(0,80%,50%)] rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Heart className="w-5 h-5 text-white fill-current" />
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-blue-950 dark:to-background">
      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          {/* Welcome Message */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              Admin Portal
            </h1>
            <p className="text-muted-foreground">
              Manage the Drop of Hope platform
            </p>
          </div>

          {/* Admin Features Overview */}
          <Card className="mb-6 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="text-blue-600 dark:text-blue-400 text-center">
                Admin Dashboard Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>User Management</span>
                </div>
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4 text-blue-600" />
                  <span>Analytics</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Heart className="w-4 h-4 text-blue-600" />
                  <span>Drive Management</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Settings className="w-4 h-4 text-blue-600" />
                  <span>System Settings</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sign In Form */}
          <Card className="border-2 border-[hsl(0,80%,50%)] rounded-sm">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl text-blue-600 dark:text-blue-400">
                Admin Sign In
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Access the administrative panel
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Admin Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="admin@dropofhope.com"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter password"
                      required
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    "Sign In to Admin Panel"
                  )}
                </Button>
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
                  Use these test credentials to access the admin panel:
                </p>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-green-700 border-green-300 hover:bg-green-100"
                    onClick={() =>
                      handleDemoLogin("admin@dropofhope.com", "admin123")
                    }
                    disabled={isLoading}
                  >
                    System Administrator
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-green-700 border-green-300 hover:bg-green-100"
                    onClick={() =>
                      handleDemoLogin("sarah.admin@dropofhope.com", "admin123")
                    }
                    disabled={isLoading}
                  >
                    Sarah Johnson
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-green-700 border-green-300 hover:bg-green-100"
                    onClick={() =>
                      handleDemoLogin(
                        "michael.admin@dropofhope.com",
                        "admin123",
                      )
                    }
                    disabled={isLoading}
                  >
                    Michael Chen
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <div className="mt-8 text-center">
            <p className="text-muted-foreground mb-4">
              Not an admin?{" "}
              <Link
                to="/login"
                className="text-[hsl(0,80%,50%)] hover:text-[hsl(0,80%,50%)]/80 font-medium"
              >
                Donor login
              </Link>
            </p>

            <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950">
              <Shield className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 dark:text-blue-200">
                <strong>Admin Access Required:</strong> This portal is
                restricted to authorized administrative personnel only.
                Unauthorized access attempts are logged and monitored.
              </AlertDescription>
            </Alert>

            <div className="space-y-2 text-sm text-muted-foreground mt-4">
              <p>By signing in, you agree to our</p>
              <div className="space-x-4">
                <Link
                  to="/terms"
                  className="hover:text-blue-600 transition-colors"
                >
                  Terms of Service
                </Link>
                <span>•</span>
                <Link
                  to="/privacy"
                  className="hover:text-blue-600 transition-colors"
                >
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-100/30 to-transparent pointer-events-none dark:from-blue-900/30" />
    </div>
  );
}
