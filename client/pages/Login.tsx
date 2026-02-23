import React from "react";
import { useNavigate } from "react-router-dom";
import { useHybridAuth } from "@/contexts/HybridAuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { isSignedIn, userRole, loading } = useHybridAuth();

  // Redirect to appropriate dashboard or donor login
  React.useEffect(() => {
    if (!loading) {
      if (isSignedIn) {
        if (userRole === "admin") navigate("/admin");
        else if (userRole === "hospital") navigate("/hospital-portal");
        else navigate("/dashboard");
      } else {
        navigate("/donor/login");
      }
    }
  }, [navigate, isSignedIn, userRole, loading]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-muted-foreground">Redirecting to donor login...</p>
      </div>
    </div>
  );
}
