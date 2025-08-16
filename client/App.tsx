import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DonorDashboard from "./pages/DonorDashboard";
import PlaceholderPage from "./pages/PlaceholderPage";
import NotFound from "./pages/NotFound";

// Import your publishable key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

const queryClient = new QueryClient();

const App = () => (
  <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
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
          <Route path="/drives" element={
            <PlaceholderPage
              title="Find Blood Drives"
              description="This page will show a map view of nearby blood donation drives with filtering options."
              suggestedPrompt="Create a blood drives page with map integration and filtering by location, date, and blood type"
            />
          } />
          <Route path="/find-drives" element={
            <PlaceholderPage
              title="Find Blood Drives"
              description="This page will show a map view of nearby blood donation drives with filtering options."
              suggestedPrompt="Create a blood drives page with map integration and filtering by location, date, and blood type"
            />
          } />
          <Route path="/appointments" element={
            <PlaceholderPage
              title="My Appointments"
              description="This page will show upcoming and past donation appointments with calendar integration."
              suggestedPrompt="Create an appointments page with calendar view and Google Calendar sync"
            />
          } />
          <Route path="/profile" element={
            <PlaceholderPage
              title="My Profile"
              description="This page will allow donors to edit their personal information and view donation history."
              suggestedPrompt="Create a profile page with editable donor information and donation history"
            />
          } />
          <Route path="/request" element={
            <PlaceholderPage
              title="Request Blood"
              description="This page will allow hospitals and individuals to request blood donations."
              suggestedPrompt="Create a blood request form for hospitals and emergency situations"
            />
          } />
          <Route path="/hospital-portal" element={
            <PlaceholderPage
              title="Hospital Portal"
              description="This page will provide hospital dashboard with blood inventory and request management."
              suggestedPrompt="Create a hospital dashboard with blood inventory management and donation drive organization"
            />
          } />
          <Route path="/admin" element={
            <PlaceholderPage
              title="Admin Dashboard"
              description="This page will provide administrative controls for managing the platform."
              suggestedPrompt="Create an admin dashboard with analytics, user management, and drive management"
            />
          } />
          <Route path="/about" element={
            <PlaceholderPage
              title="About Drop of Hope"
              description="This page will contain information about the platform's mission and team."
              suggestedPrompt="Create an about page with mission statement, team information, and impact statistics"
            />
          } />
          <Route path="/contact" element={
            <PlaceholderPage
              title="Contact Us"
              description="This page will contain contact information and support options."
              suggestedPrompt="Create a contact page with support form and contact information"
            />
          } />
          <Route path="/rewards" element={
            <PlaceholderPage
              title="Rewards & Achievements"
              description="This page will show donor rewards, badges, and achievement system."
              suggestedPrompt="Create a rewards page with gamification elements, badges, and point system"
            />
          } />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ClerkProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
