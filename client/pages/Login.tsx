import React from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  // Redirect to the new Clerk-based donor login
  React.useEffect(() => {
    navigate("/donor/login");
  }, [navigate]);

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

          {/* Sign In Form */}
          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl text-hope-red">Sign In</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hope-red-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-hope-red-500"
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
                  className="w-full bg-hope-red-600 text-white py-2 px-4 rounded-md hover:bg-hope-red-700 disabled:opacity-50 transition-colors"
                >
                  {isLoading ? "Signing In..." : "Sign In as Donor"}
                </button>
              </form>
            </CardContent>
          </Card>

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
