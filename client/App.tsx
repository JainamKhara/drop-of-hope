import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HybridAuthProvider } from "./contexts/HybridAuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import HospitalLogin from "./pages/HospitalLogin";
import Register from "./pages/Register";
import DonorLogin from "./pages/DonorLogin";
import DonorRegister from "./pages/DonorRegister";
import ClerkTest from "./pages/ClerkTest";
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
import Setup from "./pages/Setup";
import PlaceholderPage from "./pages/PlaceholderPage";
import NotFound from "./pages/NotFound";
import {
  AdminOnlyRoute,
  HospitalOnlyRoute,
  DonorOnlyRoute,
  AuthenticatedRoute,
} from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const AppContent = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />

          {/* Donor-only routes */}
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

          {/* Admin-only routes */}
          <Route
            path="/admin"
            element={
              <AdminOnlyRoute>
                <AdminDashboard />
              </AdminOnlyRoute>
            }
          />

          {/* Hospital-only routes */}
          <Route
            path="/hospital-portal"
            element={
              <HospitalOnlyRoute>
                <HospitalPortal />
              </HospitalOnlyRoute>
            }
          />

          {/* Public routes */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/donor/login" element={<DonorLogin />} />
          <Route path="/donor/register" element={<DonorRegister />} />
          <Route path="/clerk-test" element={<ClerkTest />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/hospital/login" element={<HospitalLogin />} />

          {/* Mixed access routes */}
          <Route
            path="/request"
            element={
              <AuthenticatedRoute>
                <PlaceholderPage
                  title="Request Blood"
                  description="This page will allow hospitals and individuals to request blood donations."
                  suggestedPrompt="Create a blood request form for hospitals and emergency situations"
                />
              </AuthenticatedRoute>
            }
          />
          <Route
            path="/about"
            element={
              <PlaceholderPage
                title="About Drop of Hope"
                description="This page will contain information about the platform's mission and team."
                suggestedPrompt="Create an about page with mission statement, team information, and impact statistics"
              />
            }
          />
          <Route
            path="/contact"
            element={
              <PlaceholderPage
                title="Contact Us"
                description="This page will contain contact information and support options."
                suggestedPrompt="Create a contact page with support form and contact information"
              />
            }
          />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/setup" element={<Setup />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
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
