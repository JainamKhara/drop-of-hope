import React from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  // Redirect to the new Clerk-based donor login
  React.useEffect(() => {
    navigate("/donor/login");
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-muted-foreground">Redirecting to donor login...</p>
      </div>
    </div>
  );
}
