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
import { useScrollReveal } from "@/hooks/useScrollReveal";
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
        appointments: appointments.slice(0, 3),
        donations: donations.slice(0, 5),
        rewards: rewards.slice(0, 5),
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

  return (
    <div className="min-h-screen bg-white dark:bg-background">
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="border-b-2 border-[hsl(0,80%,50%)] py-8 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-6 md:px-8"
      >
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 items-center">
            {/* Left - Profile & Eligibility Status */}
            <div>
              <div className="flex items-center space-x-4 mb-6">
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
                  <h1 className="h2-brutal select-none">{donorProfile.name}</h1>
                  <Badge
                    variant="outline"
                    className="border-2 border-[hsl(0,80%,50%)] text-[hsl(0,80%,50%)] bg-transparent"
                  >
                    Level {stats.level} Donor
                  </Badge>
                </div>
              </div>

              {/* Donation Status */}
              <div className="space-y-4">
                <div className="border-l-4 border-[hsl(0,80%,50%)] pl-4">
                  <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">
                    Donation Status
                  </p>
                  <p className="h2-brutal text-[hsl(0,80%,50%)] select-none">
                    {stats.daysUntilNextDonation === 0
                      ? "READY"
                      : "IN PROGRESS"}
                  </p>
                  <p className="text-sm text-foreground mt-1">
                    {stats.daysUntilNextDonation === 0
                      ? "You can donate today!"
                      : `${stats.daysUntilNextDonation} days until eligible`}
                  </p>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      DONATION CYCLE
                    </span>
                    <span className="text-xs font-bold text-[hsl(0,80%,50%)]">
                      {Math.floor(
                        ((56 - stats.daysUntilNextDonation) / 56) * 100,
                      )}
                      %
                    </span>
                  </div>
                  <Progress
                    value={Math.floor(
                      ((56 - stats.daysUntilNextDonation) / 56) * 100,
                    )}
                    className="h-2"
                  />
                </div>
              </div>
            </div>

            {/* Center - Key Stats */}
            <div className="space-y-4">
              <div className="border-l-4 border-[hsl(0,80%,50%)] pl-4">
                <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">
                  Total Donations
                </p>
                <p className="stat-hero text-[hsl(0,80%,50%)]">
                  {stats.totalDonations}
                </p>
                <p className="text-sm text-foreground">
                  {stats.totalDonations * 3} lives potentially saved
                </p>
              </div>

              <div className="border-l-4 border-[hsl(120,71%,43%)] pl-4">
                <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">
                  Points Earned
                </p>
                <p className="text-4xl font-bold text-[hsl(120,71%,43%)]">
                  {stats.totalPoints.toLocaleString()}
                </p>
                <p className="text-sm text-foreground">
                  Redeemable for rewards
                </p>
              </div>
            </div>

            {/* Right - Quick Actions */}
            <div className="space-y-3">
              <Button
                size="lg"
                corners="crisp"
                className="w-full justify-start"
                asChild
              >
                <Link to="/drives">
                  <MapPin className="w-4 h-4 mr-2" />
                  Find Drives
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                corners="crisp"
                className="w-full justify-start"
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
                corners="crisp"
                className="w-full justify-start"
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
                corners="crisp"
                className="w-full justify-start"
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
      </section>

      {/* Timeline Section */}
      <section ref={timelineRef} className="py-8 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-6 md:px-8 border-b border-border">
        <div className="container mx-auto max-w-2xl">
          <h2 className="h2-brutal mb-12 select-none">DONATION HISTORY</h2>

          {donations.length > 0 ? (
            <div className="space-y-6">
              {donations.map((donation, idx) => (
                <div key={donation.id} className="relative">
                  {/* Timeline Line */}
                  {idx < donations.length - 1 && (
                    <div className="absolute left-6 top-12 w-1 h-12 bg-[hsl(0,80%,50%)]/20"></div>
                  )}

                  {/* Timeline Dot */}
                  <div className="absolute left-0 top-0 w-12 h-12 bg-[hsl(0,80%,50%)] rounded-none flex items-center justify-center">
                    <Droplets className="w-6 h-6 text-white" />
                  </div>

                  {/* Timeline Content */}
                  <div className="ml-16 pt-2 pb-2">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-mono font-bold text-lg text-foreground">
                        {new Date(donation.donation_date).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          },
                        )}
                      </span>
                      <Badge
                        variant="outline"
                        className="border-2 border-[hsl(120,71%,43%)] text-[hsl(120,71%,43%)] bg-transparent"
                      >
                        +100 pts
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {donation.blood_bank_name || "Blood Drive"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Droplets className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                No donations yet. Ready to save lives?
              </p>
              <Button corners="crisp" asChild>
                <Link to="/drives">Find a Drive</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Upcoming Appointments */}
      {appointments.length > 0 && (
        <section className="py-8 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-6 md:px-8 bg-[hsl(0,0%,98%)] dark:bg-card border-b border-border">
          <div className="container mx-auto max-w-2xl">
            <h2 className="h2-brutal mb-8 select-none">
              UPCOMING APPOINTMENTS
            </h2>

            <div className="space-y-3">
              {appointments.map((appointment) => (
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
                  </div>
                  <Badge
                    variant="outline"
                    className="border-2 border-[hsl(120,71%,43%)] text-[hsl(120,71%,43%)] bg-transparent"
                  >
                    {appointment.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Rewards Section */}
      <section ref={rewardsRef} className="py-8 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-6 md:px-8">
        <div className="container mx-auto max-w-4xl">
          <h2 className="h2-brutal mb-8 select-none">YOUR ACHIEVEMENTS</h2>

          {rewards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
              {rewards.map((reward) => (
                <Card
                  key={reward.id}
                  variant="outline"
                  className="border-2 border-[hsl(0,80%,50%)] rounded-none"
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-[hsl(0,80%,50%)] rounded-none flex items-center justify-center mx-auto mb-4">
                      <Star className="w-6 h-6 text-white fill-current" />
                    </div>
                    <h3 className="font-display font-bold text-lg mb-2">
                      {reward.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {reward.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Award className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                Earn achievements by donating and building your impact
              </p>
            </div>
          )}

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
