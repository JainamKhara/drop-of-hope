// src/App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HybridAuthProvider } from "./contexts/HybridAuthContext";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import Register from "./pages/Register";
import DonorLogin from "./pages/DonorLogin";
import DonorRegister from "./pages/DonorRegister";
import ClerkSetup from "./pages/ClerkSetup";
import DonorDashboard from "./pages/DonorDashboard";
import BloodDrives from "./pages/BloodDrives";
import BookAppointment from "./pages/BookAppointment";
import MyAppointments from "./pages/MyAppointments";
import Profile from "./pages/Profile";
import Rewards from "./pages/Rewards";
import AdminDashboard from "./pages/AdminDashboard";
import HospitalPortal from "./pages/HospitalPortal";
import Community from "./pages/Community";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import RequestBlood from "./pages/RequestBlood";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import HospitalLogin from "./pages/HospitalLogin";

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

const AppContent = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navbar />
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

          {/* ✅ Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

const App = () => {
  return (
    <HybridAuthProvider>
      <AppContent />
    </HybridAuthProvider>
  );
};

export default App;
