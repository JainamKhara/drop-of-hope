import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import { MockAuthProvider } from "./contexts/MockAuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DonorDashboard from "./pages/DonorDashboard";
import BloodDrives from "./pages/BloodDrives";
import BookAppointment from "./pages/BookAppointment";
import MyAppointments from "./pages/MyAppointments";
import Profile from "./pages/Profile";
import Rewards from "./pages/Rewards";
import AdminDashboard from "./pages/AdminDashboard";
import HospitalPortal from "./pages/HospitalPortal";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import PlaceholderPage from "./pages/PlaceholderPage";
import NotFound from "./pages/NotFound";

// Import your publishable key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Check if we have a valid Clerk key (not the placeholder)
const hasValidClerkKey =
  PUBLISHABLE_KEY && PUBLISHABLE_KEY !== "__CLERK_PUBLISHABLE_KEY__";

const queryClient = new QueryClient();

const AppContent = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<DonorDashboard />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/drives" element={<BloodDrives />} />
          <Route path="/find-drives" element={<BloodDrives />} />
          <Route path="/book-appointment/:driveId" element={<BookAppointment />} />
          <Route path="/appointments" element={<MyAppointments />} />
          <Route path="/profile" element={<Profile />} />
          <Route
            path="/request"
            element={
              <PlaceholderPage
                title="Request Blood"
                description="This page will allow hospitals and individuals to request blood donations."
                suggestedPrompt="Create a blood request form for hospitals and emergency situations"
              />
            }
          />
          <Route
            path="/hospital-portal"
            element={
              <PlaceholderPage
                title="Hospital Portal"
                description="This page will provide hospital dashboard with blood inventory and request management."
                suggestedPrompt="Create a hospital dashboard with blood inventory management and donation drive organization"
              />
            }
          />
          <Route path="/admin" element={<AdminDashboard />} />
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
          <Route path="/rewards" element={<Rewards />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

const App = () => {
  if (hasValidClerkKey) {
    return (
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <AppContent />
      </ClerkProvider>
    );
  }

  return (
    <MockAuthProvider>
      <AppContent />
    </MockAuthProvider>
  );
};

createRoot(document.getElementById("root")!).render(<App />);
