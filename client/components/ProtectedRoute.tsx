import React from "react";
import { Navigate } from "react-router-dom";
import { useHybridAuth, UserRole } from "@/contexts/HybridAuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  redirectTo,
}) => {
  const { userRole, loading, isSignedIn } = useHybridAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-hope-red rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-4 h-4 bg-white rounded-full"></div>
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isSignedIn || !userRole) {
    return <Navigate to="/donor/login" replace />;
  }

  // Check if user role is allowed
  if (!allowedRoles.includes(userRole)) {
    // Redirect to appropriate dashboard based on user's actual role
    const userDashboard =
      userRole === "admin"
        ? "/admin"
        : userRole === "hospital"
          ? "/hospital-portal"
          : "/dashboard";

    return <Navigate to={redirectTo || userDashboard} replace />;
  }

  // User is authenticated and has correct role
  return <>{children}</>;
};

// Specific role-based route components for easier use
export const AdminOnlyRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <ProtectedRoute allowedRoles={["admin"]}>{children}</ProtectedRoute>;

export const HospitalOnlyRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <ProtectedRoute allowedRoles={["hospital"]}>{children}</ProtectedRoute>;

export const DonorOnlyRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <ProtectedRoute allowedRoles={["donor"]}>{children}</ProtectedRoute>;

// Component for any authenticated user (but will redirect to their correct dashboard)
export const AuthenticatedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { userRole, loading, isSignedIn } = useHybridAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-hope-red rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-4 h-4 bg-white rounded-full"></div>
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn || !userRole) {
    return <Navigate to="/donor/login" replace />;
  }

  return <>{children}</>;
};
