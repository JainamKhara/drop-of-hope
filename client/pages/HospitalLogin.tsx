import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { auth } from "@/lib/supabase";
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
  const { user, profile, loading, signIn, getRoleDashboard } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect to appropriate dashboard if already signed in
  React.useEffect(() => {
    if (user && profile && !loading) {
      navigate(getRoleDashboard());
    }
  }, [user, profile, loading, navigate, getRoleDashboard]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Use role-based authentication to ensure only hospital staff can login
    const { error } = await auth.signInWithRole(email, password, 'hospital');

    if (error) {
      setError(error.message);
    } else {
      // Wait a moment for profile to load, then navigate to hospital portal
      setTimeout(() => {
        navigate('/hospital-portal');
      }, 100);
    }
    setIsLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-hope-red rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Heart className="w-5 h-5 text-white fill-current" />
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white dark:from-green-950 dark:to-background">
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
          <Card className="border-0 shadow-xl">
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

          {/* Additional Info */}
          <div className="mt-8 text-center">
            <p className="text-muted-foreground mb-4">
              Not hospital staff?{" "}
              <Link
                to="/login"
                className="text-hope-red hover:text-hope-red/80 font-medium"
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
