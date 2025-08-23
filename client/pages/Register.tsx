import React from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  // Redirect to the new Clerk-based donor registration
  React.useEffect(() => {
    navigate("/donor/register");
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-muted-foreground">
          Redirecting to donor registration...
        </p>
      </div>
    </div>
  );
}
