import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useHybridAuth, DonorProfile } from "@/contexts/HybridAuthContext";
import { useUser } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ChatbotWidget from "@/components/ChatbotWidget";
import NotificationCenter from "@/components/NotificationCenter";
import { PaginationControls } from "@/components/PaginationControls";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import {
  generateGoogleCalendarUrl,
  parseAppointmentDateTime,
} from "@/lib/calendar";
import {
  appointmentService,
  donationService,
  rewardService,
  driveService,
} from "@/lib/db-services";
import {
  Heart,
  MapPin,
  Calendar,
  User,
  Award,
  LogOut,
  Droplets,
  TrendingUp,
  ChevronRight,
  Star,
  Shield,
  Activity,
  ExternalLink,
} from "lucide-react";

interface DashboardData {
  appointments: any[];
  donations: any[];
  rewards: any[];
  upcomingDrives: any[];
  stats: {
    totalDonations: number;
    totalPoints: number;
    level: number;
    daysUntilNextDonation: number;
  };
}

export default function DonorDashboard() {
  const { donorProfile, isSignedIn, loading, clerkSignOut, userRole } =
    useHybridAuth();
  const { user, isLoaded: clerkLoaded } = useUser();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [hasRedirected, setHasRedirected] = useState(false);
  const [donationsPage, setDonationsPage] = useState(1);
  const [appointmentsPage, setAppointmentsPage] = useState(1);
  const itemsPerPage = 5;

  // Redirect if not signed in or not a donor
  useEffect(() => {
    if (clerkLoaded && !loading) {
      if (!hasRedirected && (!isSignedIn || userRole !== "donor")) {
        setHasRedirected(true);
        navigate("/donor/login");
      }
    }
  }, [clerkLoaded, loading, isSignedIn, userRole, navigate, hasRedirected]);

  useEffect(() => {
    if (isSignedIn && userRole === "donor") {
      setHasRedirected(false);
    }
  }, [isSignedIn, userRole]);

  useEffect(() => {
    if (donorProfile) {
      loadDashboardData(donorProfile);
    }
  }, [donorProfile]);

  const loadDashboardData = async (profile: DonorProfile) => {
    try {
      setDashboardLoading(true);

      const [appointmentsResult, donationsResult, rewardsResult, drivesResult] =
        await Promise.all([
          appointmentService.getUpcomingByDonor(profile.id),
          donationService.getByDonor(profile.id),
          rewardService.getByDonor(profile.id),
          driveService.getUpcoming(5),
        ]);

      const appointments = appointmentsResult.data || [];
      const donations = donationsResult.data || [];
      const rewards = rewardsResult.data || [];
      const upcomingDrives = drivesResult.data || [];

      const lastDonationDate = profile.last_donation_date
        ? new Date(profile.last_donation_date)
        : null;
      const daysUntilNextDonation = lastDonationDate
        ? Math.max(
            0,
            56 -
              Math.floor(
                (Date.now() - lastDonationDate.getTime()) /
                  (1000 * 60 * 60 * 24),
              ),
          )
        : 0;

      setDashboardData({
        appointments,
        donations,
        rewards,
        upcomingDrives,
        stats: {
          totalDonations: donations.length,
          totalPoints: profile.points || 0,
          level: profile.level || 1,
          daysUntilNextDonation,
        },
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setDashboardLoading(false);
    }
  };

  const heroRef = useScrollReveal({ threshold: 0.1, delay: 0 });
  const timelineRef = useScrollReveal({ threshold: 0.1, delay: 100 });
  const rewardsRef = useScrollReveal({ threshold: 0.1, delay: 200 });

  if (!clerkLoaded || loading || !donorProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-background">
        <div className="text-center">
          <div className="w-12 h-12 bg-[hsl(0,80%,50%)] rounded-none flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Heart className="w-6 h-6 text-white fill-current" />
          </div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (dashboardLoading || !dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-background">
        <div className="text-center">
          <div className="w-12 h-12 bg-[hsl(0,80%,50%)] rounded-none flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Heart className="w-6 h-6 text-white fill-current" />
          </div>
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  const { stats, appointments, donations, rewards, upcomingDrives } =
    dashboardData;

  const lastDonationDate = donorProfile?.last_donation_date
    ? new Date(donorProfile.last_donation_date)
    : null;
  const daysSinceLastDonation = lastDonationDate
    ? Math.floor((Date.now() - lastDonationDate.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const paginatedDonations = donations.slice(
    (donationsPage - 1) * itemsPerPage,
    donationsPage * itemsPerPage,
  );
  const donationsTotalPages = Math.ceil(donations.length / itemsPerPage);

  const paginatedAppointments = appointments.slice(
    (appointmentsPage - 1) * itemsPerPage,
    appointmentsPage * itemsPerPage,
  );
  const appointmentsTotalPages = Math.ceil(appointments.length / itemsPerPage);

  const getCalendarUrl = (appointment: any) => {
    const startDateTime = parseAppointmentDateTime(
      appointment.appointment_date,
      appointment.appointment_time,
    );
    if (!startDateTime) return "#";

    // Assume 30 minute duration
    const endDateTime = new Date(startDateTime.getTime() + 30 * 60 * 1000);

    return generateGoogleCalendarUrl({
      title: `Blood Donation: ${appointment.drives?.name}`,
      description: `Blood donation appointment at ${appointment.drives?.name}. Thank you for saving lives!`,
      location: `${appointment.drives?.location}, ${appointment.drives?.address || ""}`,
      startDate: startDateTime,
      endDate: endDateTime,
    });
  };

  const handleViewCertificate = (donation: any) => {
    const donorName = donorProfile?.name || "Valued Donor";
    const certWindow = window.open("", "_blank", "width=900,height=650");
    if (!certWindow) return;
    
    const dateStr = donation.donation_date 
      ? new Date(donation.donation_date).toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric"
        })
      : "Date unknown";

    certWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Donation Certificate – ${donorName}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=Inter:wght@400;500;600&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Inter', sans-serif; background: #f5f0eb; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 32px; }
          .cert { background: #fff; width: 800px; padding: 60px; border: 3px solid #c41e1e; position: relative; box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
          .cert::before { content: ''; position: absolute; inset: 12px; border: 1px solid #c41e1e44; pointer-events: none; }
          .corner { position: absolute; width: 40px; height: 40px; border-color: #c41e1e; border-style: solid; }
          .tl { top: 20px; left: 20px; border-width: 3px 0 0 3px; }
          .tr { top: 20px; right: 20px; border-width: 3px 3px 0 0; }
          .bl { bottom: 20px; left: 20px; border-width: 0 0 3px 3px; }
          .br { bottom: 20px; right: 20px; border-width: 0 3px 3px 0; }
          .logo { text-align: center; margin-bottom: 8px; }
          .logo-icon { font-size: 40px; }
          .logo-name { font-size: 13px; font-weight: 600; letter-spacing: 0.25em; color: #c41e1e; text-transform: uppercase; }
          .divider { width: 120px; height: 2px; background: linear-gradient(90deg, transparent, #c41e1e, transparent); margin: 20px auto; }
          .headline { font-family: 'Playfair Display', serif; font-size: 13px; font-weight: 700; letter-spacing: 0.3em; text-transform: uppercase; color: #888; text-align: center; margin-bottom: 8px; }
          .main-title { font-family: 'Playfair Display', serif; font-size: 42px; color: #1a1a1a; text-align: center; line-height: 1.2; margin-bottom: 24px; }
          .presented { text-align: center; color: #666; font-size: 14px; margin-bottom: 12px; }
          .donor-name { font-family: 'Playfair Display', serif; font-size: 36px; font-style: italic; color: #c41e1e; text-align: center; margin-bottom: 24px; border-bottom: 1px solid #eee; padding-bottom: 24px; }
          .body-text { text-align: center; color: #555; font-size: 14px; line-height: 1.8; margin-bottom: 32px; max-width: 540px; margin-left: auto; margin-right: auto; }
          .details { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 28px 0; background: #fef2f2; border-radius: 8px; padding: 20px 28px; }
          .detail { }
          .detail-label { font-size: 10px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: #c41e1e; margin-bottom: 4px; }
          .detail-val { font-size: 14px; color: #222; font-weight: 500; }
          .sig-row { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 40px; padding-top: 20px; }
          .sig-block { text-align: center; }
          .sig-line { width: 140px; height: 1px; background: #333; margin-bottom: 8px; }
          .sig-name { font-size: 12px; font-weight: 600; }
          .sig-title { font-size: 11px; color: #888; }
          .seal { width: 80px; height: 80px; border: 2px solid #c41e1e; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-direction: column; }
          .seal-text { font-size: 9px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #c41e1e; text-align: center; }
          .print-btn { display: block; margin: 24px auto 0; padding: 10px 28px; background: #c41e1e; color: white; border: none; border-radius: 6px; font-size: 14px; cursor: pointer; font-family: Inter, sans-serif; }
          @media print { .print-btn { display: none; } body { background: white; } }
        </style>
      </head>
      <body>
        <div class="cert">
          <div class="corner tl"></div><div class="corner tr"></div>
          <div class="corner bl"></div><div class="corner br"></div>
          <div class="logo">
            <img src="/drop_of_hope_logo.png" alt="Logo" style="width: 50px; height: 50px; object-fit: contain; margin-bottom: 4px;">
            <div class="logo-name">Drop of Hope</div>
          </div>
          <div class="divider"></div>
          <div class="headline">Certificate of Appreciation</div>
          <div class="main-title">Blood Donation<br>Certificate</div>
          <div class="presented">This is to proudly certify that</div>
          <div class="donor-name">${donorName}</div>
          <p class="body-text">
            has selflessly and courageously donated blood, potentially saving up to <strong>3 lives</strong>.
            Your generosity is a testament to the power of humanity and compassion.
          </p>
          <div class="details">
            <div class="detail"><div class="detail-label">Donation Type</div><div class="detail-val">Whole Blood</div></div>
            <div class="detail"><div class="detail-label">Date</div><div class="detail-val">${dateStr}</div></div>
            <div class="detail"><div class="detail-label">Location</div><div class="detail-val">${donation.drives?.name || donation.hospitals?.name || "Blood Center"}</div></div>
            <div class="detail"><div class="detail-label">Amount</div><div class="detail-val">${donation.quantity_ml || 450}ml</div></div>
          </div>
          <div class="sig-row">
            <div class="sig-block">
              <div class="sig-line"></div>
              <div class="sig-name">Drop of Hope</div>
              <div class="sig-title">Program Director</div>
            </div>
            <div class="seal">
              <div class="seal-text">Official<br>Seal</div>
              <img src="/drop_of_hope_logo.png" style="width: 24px; height: 24px; margin-top: 4px; object-fit: contain;">
            </div>
            <div class="sig-block">
              <div class="sig-line"></div>
              <div class="sig-name">${donorName}</div>
              <div class="sig-title">Donor</div>
            </div>
          </div>
        </div>
        <button class="print-btn" onclick="window.print()">🖨️ Print Certificate</button>
      </body>
      </html>
    `);
    certWindow.document.close();
    certWindow.focus();
  };

  // Achievement logic synchronized with Profile.tsx
  const achievementList = [
    {
      id: "first_drop",
      name: "First Drop",
      description: "Completed your first blood donation",
      icon: <Droplets className="w-6 h-6 text-white" />,
      requirement: (s: any) => s.totalDonations >= 1,
      progress: (s: any) => Math.min(100, (s.totalDonations / 1) * 100),
      threshold: "1 donation"
    },
    {
      id: "bronze_lifesaver",
      name: "Bronze Lifesaver",
      description: "Completed 3 blood donations",
      icon: <Award className="w-6 h-6 text-white" />,
      requirement: (s: any) => s.totalDonations >= 3,
      progress: (s: any) => Math.min(100, (s.totalDonations / 3) * 100),
      threshold: "3 donations"
    },
    {
      id: "silver_lifesaver",
      name: "Silver Lifesaver",
      description: "Completed 5 blood donations",
      icon: <Award className="w-6 h-6 text-white" />,
      requirement: (s: any) => s.totalDonations >= 5,
      progress: (s: any) => Math.min(100, (s.totalDonations / 5) * 100),
      threshold: "5 donations"
    },
    {
      id: "gold_lifesaver",
      name: "Gold Lifesaver",
      description: "Completed 10 blood donations",
      icon: <Award className="w-6 h-6 text-white" />,
      requirement: (s: any) => s.totalDonations >= 10,
      progress: (s: any) => Math.min(100, (s.totalDonations / 10) * 100),
      threshold: "10 donations"
    },
    {
      id: "platinum_lifesaver",
      name: "Platinum Donor",
      description: "Completed 20 blood donations",
      icon: <Star className="w-6 h-6 text-white" />,
      requirement: (s: any) => s.totalDonations >= 20,
      progress: (s: any) => Math.min(100, (s.totalDonations / 20) * 100),
      threshold: "20 donations"
    },
    {
      id: "centurion",
      name: "Centurion Donor",
      description: "Completed 50 blood donations",
      icon: <Shield className="w-6 h-6 text-white" />,
      requirement: (s: any) => s.totalDonations >= 50,
      progress: (s: any) => Math.min(100, (s.totalDonations / 50) * 100),
      threshold: "50 donations"
    },
    {
      id: "point_master",
      name: "Point Master",
      description: "Earned over 1000 points",
      icon: <TrendingUp className="w-6 h-6 text-white" />,
      requirement: (s: any) => s.points >= 1000,
      progress: (s: any) => Math.min(100, (s.points / 1000) * 100),
      threshold: "1000 points"
    },
    {
      id: "elite_donor",
      name: "Elite Donor",
      description: "Reached donor level 5",
      icon: <Shield className="w-6 h-6 text-white" />,
      requirement: (s: any) => (s.level || 1) >= 5,
      progress: (s: any) => Math.min(100, ((s.level || 1) / 5) * 100),
      threshold: "Level 5"
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-background">
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative overflow-hidden py-12 md:py-16 px-4 bg-gradient-to-b from-red-50/40 via-white to-white dark:from-[hsl(0,80%,10%)]/20 dark:via-background dark:to-background border-b border-border"
      >
        {/* Abstract Grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none"></div>

        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="bg-white/95 dark:bg-card/95 backdrop-blur-md border border-border/80 rounded-2xl p-6 md:p-8 shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
              {/* Left - Profile & Eligibility Status */}
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-16 h-16 border-2 border-[hsl(0,80%,50%)]">
                    <AvatarImage
                      src={donorProfile.profile_pic_url}
                      alt={donorProfile.name}
                    />
                    <AvatarFallback className="bg-[hsl(0,80%,50%)]/10 text-[hsl(0,80%,50%)]">
                      <User className="w-8 h-8" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">{donorProfile.name}</h1>
                    <Badge
                      variant="outline"
                      className="border-2 border-[hsl(0,80%,50%)] text-[hsl(0,80%,50%)] bg-transparent font-semibold mt-1"
                    >
                      Level {stats.level} Donor
                    </Badge>
                  </div>
                </div>

                {/* Donation Status */}
                <div className="space-y-3">
                  <div className="border-l-4 border-[hsl(0,80%,50%)] pl-4">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                      Donation Status
                    </p>
                    <p className="text-2xl font-extrabold text-[hsl(0,80%,50%)] tracking-tight">
                      {stats.daysUntilNextDonation === 0
                        ? "READY TO DONATE"
                        : "IN PROGRESS"}
                    </p>
                    <p className="text-sm text-foreground mt-0.5">
                      {stats.daysUntilNextDonation === 0
                        ? "You can donate today!"
                        : `${stats.daysUntilNextDonation} days until eligible`}
                    </p>
                    {daysSinceLastDonation !== null && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        ({daysSinceLastDonation} days since last donation)
                      </p>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        Donation Cycle
                      </span>
                      <span className="text-[10px] font-extrabold text-[hsl(0,80%,50%)]">
                        {Math.floor(
                          ((56 - stats.daysUntilNextDonation) / 56) * 100,
                        )}
                        % Complete
                      </span>
                    </div>
                    <Progress
                      value={Math.floor(
                        ((56 - stats.daysUntilNextDonation) / 56) * 100,
                      )}
                      className="h-2 rounded-full"
                    />
                  </div>
                </div>
              </div>

              {/* Center - Key Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-6 lg:border-x lg:border-border lg:px-8">
                <div className="border-l-4 border-[hsl(0,80%,50%)] pl-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                    Total Donations
                  </p>
                  <p className="text-4xl font-extrabold text-[hsl(0,80%,50%)]">
                    {stats.totalDonations}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.totalDonations * 3} lives potentially saved
                  </p>
                </div>

                <div className="border-l-4 border-green-500 pl-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                    Points Earned
                  </p>
                  <p className="text-4xl font-extrabold text-green-500">
                    {stats.totalPoints.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Redeemable for rewards
                  </p>
                </div>
              </div>

              {/* Right - Quick Actions */}
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">
                  Quick Actions
                </p>
                <Button
                  size="lg"
                  className="w-full justify-start bg-[hsl(0,80%,50%)] hover:bg-[hsl(0,80%,50%)]/90 text-white rounded-none shadow-md shadow-red-500/10 hover:-translate-y-0.5 transition-transform"
                  asChild
                >
                  <Link to="/drives">
                    <MapPin className="w-4 h-4 mr-2" />
                    Find Blood Drives
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full justify-start rounded-none border-2 hover:bg-muted hover:-translate-y-0.5 transition-transform"
                  asChild
                >
                  <Link to="/appointments">
                    <Calendar className="w-4 h-4 mr-2" />
                    My Appointments
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full justify-start rounded-none border-2 hover:bg-muted hover:-translate-y-0.5 transition-transform"
                  asChild
                >
                  <Link to="/profile">
                    <User className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full justify-start rounded-none border-2 hover:bg-muted hover:-translate-y-0.5 transition-transform"
                  asChild
                >
                  <Link to="/rewards">
                    <Award className="w-4 h-4 mr-2" />
                    View Rewards
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section ref={timelineRef} className="py-8 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-6 md:px-8 border-b border-border">
        <div className="container mx-auto max-w-6xl">
          <h2 className="h2-brutal mb-12 select-none">DONATION HISTORY</h2>

          {donations.length > 0 ? (
            <div className="space-y-8">
              {paginatedDonations.map((donation, idx) => (
                <div key={donation.id} className="relative">
                  {/* Timeline Line */}
                  {idx < paginatedDonations.length - 1 && (
                    <div className="absolute left-6 top-12 w-0.5 h-16 bg-muted"></div>
                  )}

                  {/* Timeline Dot */}
                  <div className="absolute left-0 top-0 w-12 h-12 bg-white border-2 border-[hsl(0,80%,50%)] rounded-none flex items-center justify-center z-10">
                    <Droplets className="w-6 h-6 text-[hsl(0,80%,50%)]" />
                  </div>

                  {/* Timeline Content */}
                  <div className="ml-16 pt-2 pb-2">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-mono font-bold text-lg text-foreground">
                        {new Date(donation.donation_date).toLocaleDateString(
                          "en-US",
                          {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          },
                        )}
                      </span>
                      <Badge
                        className="bg-success/10 text-success border-success/20"
                      >
                        +{donation.points_earned || 100} PTS
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-[10px] text-[hsl(0,80%,50%)] hover:text-[hsl(0,80%,50%)] hover:bg-[hsl(0,80%,50%)]/5"
                        onClick={() => handleViewCertificate(donation)}
                      >
                        <Award className="w-3 h-3 mr-1" />
                        Certificate
                      </Button>
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      {donation.drives?.name || donation.hospitals?.name || "Blood Donation"}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {donation.drives?.location || "Hospital Site"}
                      </p>
                      <span className="text-muted-foreground text-[10px]">•</span>
                      <p className="text-xs text-muted-foreground">
                        {donation.quantity_ml || 450}ml donated
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {donationsTotalPages > 1 && (
                <div className="mt-8 pt-8 border-t">
                  <PaginationControls 
                    currentPage={donationsPage} 
                    totalPages={donationsTotalPages} 
                    onPageChange={setDonationsPage} 
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="py-16 text-center border-2 border-dashed border-muted">
              <Droplets className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-bold mb-1">NO DONATIONS YET</h3>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                Ready to save up to 3 lives with a single drop? Find a drive near you!
              </p>
              <Button size="lg" corners="crisp" asChild>
                <Link to="/drives">Find a Drive</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Upcoming Appointments */}
      {appointments.length > 0 && (
        <section className="py-8 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-6 md:px-8 bg-[hsl(0,0%,98%)] dark:bg-card border-b border-border">
          <div className="container mx-auto max-w-6xl">
            <h2 className="h2-brutal mb-8 select-none">
              UPCOMING APPOINTMENTS
            </h2>

            <div className="space-y-3">
              {paginatedAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="border-2 border-[hsl(0,80%,50%)] p-3 sm:p-4 md:p-5 rounded-none flex items-start justify-between"
                >
                  <div>
                    <p className="font-display font-bold text-lg">
                      {appointment.drives?.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(
                        appointment.appointment_date,
                      ).toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      })}{" "}
                      @ {appointment.appointment_time}
                    </p>
                    <p className="text-sm text-foreground flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" />
                      {appointment.drives?.location}
                    </p>
                    <div className="mt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 border-[hsl(0,80%,50%)] text-[hsl(0,80%,50%)] hover:bg-[hsl(0,80%,50%)] hover:text-white"
                        asChild
                      >
                        <a 
                          href={getCalendarUrl(appointment)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center"
                        >
                          <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                          Add to Calendar
                        </a>
                      </Button>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="border-2 border-[hsl(120,71%,43%)] text-[hsl(120,71%,43%)] bg-transparent"
                  >
                    {appointment.status}
                  </Badge>
                </div>
              ))}

              {appointmentsTotalPages > 1 && (
                <div className="mt-6 pt-6 border-t">
                  <PaginationControls 
                    currentPage={appointmentsPage} 
                    totalPages={appointmentsTotalPages} 
                    onPageChange={setAppointmentsPage} 
                  />
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Rewards Section */}
      <section ref={rewardsRef} className="py-8 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-6 md:px-8">
        <div className="container mx-auto max-w-6xl">
          <h2 className="h2-brutal mb-8 select-none">YOUR ACHIEVEMENTS</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievementList.map((achievement) => {
              const isEarned = achievement.requirement(stats);
              const progress = achievement.progress(stats);
              
              return (
                <div 
                  key={achievement.id}
                  className={`relative p-6 border-2 rounded-none transition-all duration-300 ${
                    isEarned 
                      ? "border-[hsl(0,80%,50%)] bg-[hsl(0,80%,50%)]/5" 
                      : "border-dashed border-muted bg-transparent opacity-80"
                  }`}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-12 h-12 rounded-none mb-4 flex items-center justify-center ${
                      isEarned ? "bg-[hsl(0,80%,50%)] shadow-lg" : "bg-muted"
                    }`}>
                      {React.cloneElement(achievement.icon as React.ReactElement, {
                        className: `w-6 h-6 ${isEarned ? "text-white" : "text-muted-foreground"}`
                      })}
                    </div>
                    <h3 className={`font-display font-bold text-lg mb-1 ${isEarned ? "text-[hsl(0,80%,50%)]" : "text-muted-foreground"}`}>
                      {achievement.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-4">
                      {achievement.description}
                    </p>
                    
                    {!isEarned && (
                      <div className="w-full space-y-1 mt-auto">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-muted-foreground font-mono">PROGRESS</span>
                          <span className="text-[hsl(0,80%,50%)] font-bold">{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-1 bg-muted rounded-none" />
                        <p className="text-[10px] text-muted-foreground mt-1 uppercase font-medium">Next: {achievement.threshold}</p>
                      </div>
                    )}
                    
                    {isEarned && (
                      <Badge className="bg-success text-white border-none rounded-none px-3 py-1 pointer-events-none">
                        UNLOCKED
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 text-center">
            <Button size="lg" corners="crisp" asChild>
              <Link to="/rewards">View All Rewards</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-8 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-6 md:px-8 bg-[hsl(0,80%,50%)] text-white border-t-2 border-[hsl(0,80%,30%)]">
        <div className="container mx-auto text-center">
          <h2 className="h2-brutal text-white mb-4 select-none">
            READY FOR YOUR NEXT DONATION?
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Your next donation can save up to 3 lives. Find a blood drive near
            you today.
          </p>
          <Button
            size="lg"
            corners="crisp"
            variant="outline"
            className="border-white text-white hover:bg-white hover:text-[hsl(0,80%,50%)]"
            asChild
          >
            <Link to="/drives">Find Drives</Link>
          </Button>
        </div>
      </section>

      <ChatbotWidget />
    </div>
  );
}
