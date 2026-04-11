import React from "react";
import { Navigate, useLocation } from "react-router-dom";
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
  const location = useLocation();

  // Show loading while checking
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-[hsl(0,80%,50%)] rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-4 h-4 bg-white rounded-full"></div>
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if not signed in (but avoid loops if already on login pages)
  if (!isSignedIn) {
    const path = location.pathname;

    // 🔹 Do not redirect if user is already on their login page
    if (allowedRoles.includes("donor") && !path.startsWith("/donor/login")) {
      return <Navigate to="/donor/login" replace state={{ from: path }} />;
    }
    if (allowedRoles.includes("admin") && path !== "/admin/login") {
      return <Navigate to="/admin/login" replace state={{ from: path }} />;
    }

    // Default login page fallback
    if (!path.includes("login")) {
      return <Navigate to="/login" replace state={{ from: path }} />;
    }
  }

  // Wait for userRole to be assigned
  if (isSignedIn && !userRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-[hsl(0,80%,50%)] rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-4 h-4 bg-white rounded-full"></div>
          </div>
          <p className="text-muted-foreground">Setting up your profile...</p>
        </div>
      </div>
    );
  }

  // If signed in but wrong role → send to their own dashboard
  if (userRole && !allowedRoles.includes(userRole)) {
    const userDashboard = userRole === "admin" ? "/admin" : "/dashboard";

    return <Navigate to={redirectTo || userDashboard} replace />;
  }

  // ✅ Allowed
  return <>{children}</>;
};

// Role wrappers
export const AdminOnlyRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <ProtectedRoute allowedRoles={["admin"]}>{children}</ProtectedRoute>;

export const DonorOnlyRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <ProtectedRoute allowedRoles={["donor"]}>{children}</ProtectedRoute>;

export const HospitalOnlyRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <ProtectedRoute allowedRoles={["hospital"]}>{children}</ProtectedRoute>;

export const AuthenticatedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { userRole, loading, isSignedIn } = useHybridAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-[hsl(0,80%,50%)] rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-4 h-4 bg-white rounded-full"></div>
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn && !location.pathname.includes("login")) {
    return <Navigate to="/login" replace />;
  }

  if (isSignedIn && !userRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-[hsl(0,80%,50%)] rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-4 h-4 bg-white rounded-full"></div>
          </div>
          <p className="text-muted-foreground">Setting up your profile...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
