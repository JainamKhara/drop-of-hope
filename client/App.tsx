// src/App.tsx
import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HybridAuthProvider } from "./contexts/HybridAuthContext";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Pages (Lazy Loaded)
const Index = lazy(() => import("./pages/public/Index"));
const Login = lazy(() => import("./pages/auth/Login"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const Register = lazy(() => import("./pages/auth/Register"));
const DonorLogin = lazy(() => import("./pages/donor/DonorLogin"));
const DonorRegister = lazy(() => import("./pages/donor/DonorRegister"));
const ClerkSetup = lazy(() => import("./pages/auth/ClerkSetup"));
const DonorDashboard = lazy(() => import("./pages/donor/DonorDashboard"));
const BloodDrives = lazy(() => import("./pages/donor/BloodDrives"));
const BookAppointment = lazy(() => import("./pages/donor/BookAppointment"));
const MyAppointments = lazy(() => import("./pages/donor/MyAppointments"));
const Profile = lazy(() => import("./pages/donor/Profile"));
const Rewards = lazy(() => import("./pages/donor/Rewards"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const HospitalPortal = lazy(() => import("./pages/hospital/HospitalPortal"));
const Community = lazy(() => import("./pages/donor/Community"));
const Terms = lazy(() => import("./pages/public/Terms"));
const Privacy = lazy(() => import("./pages/public/Privacy"));
const RequestBlood = lazy(() => import("./pages/hospital/RequestBlood"));
const About = lazy(() => import("./pages/public/About"));
const Contact = lazy(() => import("./pages/public/Contact"));
const NotFound = lazy(() => import("./pages/public/NotFound"));
const HospitalLogin = lazy(() => import("./pages/hospital/HospitalLogin"));
const BloodTypes = lazy(() => import("./pages/public/BloodTypes"));
const DonationTips = lazy(() => import("./pages/public/DonationTips"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const HospitalProfile = lazy(() => import("./pages/hospital/HospitalProfile"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));

import {
  AdminOnlyRoute,
  DonorOnlyRoute,
  AuthenticatedRoute,
  HospitalOnlyRoute,
} from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";

const queryClient = new QueryClient();

// ✅ Clerk key validation (same logic as main.tsx / DonorRegister)
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const INVALID_KEYS = ["pk_test_example"];
const isClerkAvailable =
  PUBLISHABLE_KEY &&
  PUBLISHABLE_KEY.startsWith("pk_") &&
  PUBLISHABLE_KEY.length > 20 &&
  !PUBLISHABLE_KEY.includes("__") &&
  !PUBLISHABLE_KEY.includes("your_") &&
  !INVALID_KEYS.includes(PUBLISHABLE_KEY);

const LoadingSpinner = () => (
  <div className="min-h-[60vh] flex items-center justify-center bg-background">
    <div className="flex flex-col items-center space-y-4">
      <div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
      <p className="text-muted-foreground animate-pulse font-medium text-sm">Loading Drop of Hope...</p>
    </div>
  </div>
);

const AppContent = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navbar />
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Public landing */}
            <Route path="/" element={<Index />} />

            {/* ✅ Donor-only routes (protected) */}
            {isClerkAvailable ? (
              <>
                <Route
                  path="/dashboard"
                  element={
                    <DonorOnlyRoute>
                      <DonorDashboard />
                    </DonorOnlyRoute>
                  }
                />
                <Route
                  path="/drives"
                  element={
                    <DonorOnlyRoute>
                      <BloodDrives />
                    </DonorOnlyRoute>
                  }
                />
                <Route
                  path="/find-drives"
                  element={
                    <DonorOnlyRoute>
                      <BloodDrives />
                    </DonorOnlyRoute>
                  }
                />
                <Route
                  path="/book-appointment/:driveId"
                  element={
                    <DonorOnlyRoute>
                      <BookAppointment />
                    </DonorOnlyRoute>
                  }
                />
                <Route
                  path="/appointments"
                  element={
                    <DonorOnlyRoute>
                      <MyAppointments />
                    </DonorOnlyRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <DonorOnlyRoute>
                      <Profile />
                    </DonorOnlyRoute>
                  }
                />
                <Route
                  path="/rewards"
                  element={
                    <DonorOnlyRoute>
                      <Rewards />
                    </DonorOnlyRoute>
                  }
                />
                <Route
                  path="/community"
                  element={
                    <DonorOnlyRoute>
                      <Community />
                    </DonorOnlyRoute>
                  }
                />
              </>
            ) : (
              // If Clerk is missing → redirect all donor routes to Clerk setup page
              <Route
                path="/dashboard/*"
                element={<Navigate to="/clerk-setup" />}
              />
            )}

            {/* ✅ Admin-only routes */}
            <Route
              path="/admin"
              element={
                <AdminOnlyRoute>
                  <AdminDashboard />
                </AdminOnlyRoute>
              }
            />

            {/* ✅ Hospital-only routes */}
            <Route
              path="/hospital-portal"
              element={
                <HospitalOnlyRoute>
                  <HospitalPortal />
                </HospitalOnlyRoute>
              }
            />

            {/* ✅ Public routes (no protection, no loops) */}
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/donor/login" element={<DonorLogin />} />
            <Route path="/donor/register" element={<DonorRegister />} />
            <Route path="/clerk-setup" element={<ClerkSetup />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/hospital/login" element={<HospitalLogin />} />

            {/* ✅ Mixed access routes */}
            <Route
              path="/request"
              element={
                <AuthenticatedRoute>
                  <RequestBlood />
                </AuthenticatedRoute>
              }
            />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/blood-types" element={<BloodTypes />} />
            <Route path="/tips" element={<DonationTips />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/hospital/:id" element={<HospitalProfile />} />

            {/* ✅ Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

const App = () => {
  return (
    <ErrorBoundary>
      <HybridAuthProvider>
        <AppContent />
      </HybridAuthProvider>
    </ErrorBoundary>
  );
};

export default App;
