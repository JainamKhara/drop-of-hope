import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useHybridAuth, DonorProfile } from "@/contexts/HybridAuthContext";
import { useUser } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ChatbotWidget from "@/components/ChatbotWidget";
import NotificationCenter from "@/components/NotificationCenter";
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
  Calendar as CalendarIcon,
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

  // Redirect if not signed in or not a donor (only after everything is loaded)
  useEffect(() => {
    // Wait for both Clerk and HybridAuth to be loaded
    if (clerkLoaded && !loading) {
      console.log("Auth states:", {
        clerkLoaded,
        loading,
        isSignedIn,
        userRole,
        hasRedirected,
      });
      // Only redirect if we haven't already redirected and user is not authenticated
      if (!hasRedirected && (!isSignedIn || userRole !== "donor")) {
        console.log("Redirecting to login page");
        setHasRedirected(true);
        navigate("/donor/login");
      }
    }
  }, [clerkLoaded, loading, isSignedIn, userRole, navigate, hasRedirected]);

  // Reset redirect flag when user becomes authenticated
  useEffect(() => {
    if (isSignedIn && userRole === "donor") {
      setHasRedirected(false);
    }
  }, [isSignedIn, userRole]);

  // Load dashboard data when donor profile is available
  useEffect(() => {
    if (donorProfile) {
      loadDashboardData(donorProfile);
    }
  }, [donorProfile]);

  const loadDashboardData = async (profile: DonorProfile) => {
    try {
      setDashboardLoading(true);

      // Fetch real data from database
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

      // Use last_donation_date from donor profile
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

  if (!clerkLoaded || loading || !donorProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-hope-red rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Heart className="w-6 h-6 text-white fill-current" />
          </div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (dashboardLoading || !dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-hope-red rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
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
    <div className="min-h-screen bg-gradient-to-b from-hope-pink to-white dark:from-hope-coral dark:to-background">
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-hope-red mb-2">
            Welcome back, {donorProfile.name}!
          </h1>
          <p className="text-muted-foreground">
            Thank you for being a life-saving hero. Here's your impact
            dashboard.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Donations
              </CardTitle>
              <Droplets className="h-4 w-4 text-hope-red" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-hope-red">
                {stats.totalDonations}
              </div>
              <p className="text-xs text-muted-foreground">
                Lives potentially saved: {stats.totalDonations * 3}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Points Earned
              </CardTitle>
              <Award className="h-4 w-4 text-hope-red" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-hope-red">
                {stats.totalPoints}
              </div>
              <p className="text-xs text-muted-foreground">
                Level {stats.level} donor
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Next Donation
              </CardTitle>
              <CalendarIcon className="h-4 w-4 text-hope-red" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-hope-red">
                {stats.daysUntilNextDonation === 0
                  ? "Ready!"
                  : `${stats.daysUntilNextDonation} days`}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.daysUntilNextDonation === 0
                  ? "You can donate now"
                  : "Until you can donate again"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Blood Type</CardTitle>
              <Heart className="h-4 w-4 text-hope-red" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-hope-red">
                {donorProfile.blood_type || "Not Set"}
              </div>
              <p className="text-xs text-muted-foreground">
                {donorProfile.blood_type
                  ? "Universal compatibility"
                  : "Please update your profile"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8 border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-hope-red">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button asChild className="bg-hope-red hover:bg-hope-red/90">
                <Link to="/drives">
                  <MapPin className="w-4 h-4 mr-2" />
                  Find Blood Drives
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/profile">
                  <User className="w-4 h-4 mr-2" />
                  Edit Profile
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/appointments">
                  <Calendar className="w-4 h-4 mr-2" />
                  My Appointments
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/profile">
                  <User className="w-4 h-4 mr-2" />
                  Update Profile
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/rewards">
                  <Award className="w-4 h-4 mr-2" />
                  View Rewards
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Appointments */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-hope-red flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Upcoming Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {appointments.length > 0 ? (
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-3 bg-hope-pink dark:bg-hope-coral rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          {appointment.drives?.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(
                            appointment.appointment_date,
                          ).toLocaleDateString()}{" "}
                          at {appointment.appointment_time}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {appointment.drives?.location}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-hope-red/10 text-hope-red"
                      >
                        {appointment.status}
                      </Badge>
                    </div>
                  ))}
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/appointments">View All Appointments</Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    No upcoming appointments
                  </p>
                  <Button asChild>
                    <Link to="/drives">Schedule an Appointment</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Donations */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-hope-red flex items-center">
                <Droplets className="w-5 h-5 mr-2" />
                Recent Donations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {donations.length > 0 ? (
                <div className="space-y-4">
                  {donations.map((donation) => (
                    <div
                      key={donation.id}
                      className="flex items-center justify-between p-3 bg-hope-pink dark:bg-hope-coral rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          {donation.drives?.name ||
                            donation.hospitals?.name ||
                            "Direct Donation"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(
                            donation.donation_date,
                          ).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {donation.quantity_ml}ml • {donation.blood_type}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-800"
                        >
                          +{donation.points_earned} points
                        </Badge>
                      </div>
                    </div>
                  ))}
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/profile">View Donation History</Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Droplets className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No donations yet</p>
                  <Button asChild>
                    <Link to="/drives">Find Your First Drive</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Rewards */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-hope-red flex items-center">
                <Award className="w-5 h-5 mr-2" />
                Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              {rewards.length > 0 ? (
                <div className="space-y-4">
                  {rewards.map((reward) => (
                    <div
                      key={reward.id}
                      className="flex items-center justify-between p-3 bg-hope-pink dark:bg-hope-coral rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">
                          {reward.badge_icon || "🏆"}
                        </div>
                        <div>
                          <p className="font-medium">{reward.badge_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {reward.badge_description}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-hope-red/10 text-hope-red"
                      >
                        {reward.points_threshold} pts
                      </Badge>
                    </div>
                  ))}
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/rewards">View All Achievements</Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Award className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    No achievements yet
                  </p>
                  <Button asChild>
                    <Link to="/drives">Start Donating to Earn Rewards</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Nearby Blood Drives */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-hope-red flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Nearby Blood Drives
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingDrives.length > 0 ? (
                <div className="space-y-4">
                  {upcomingDrives.map((drive) => (
                    <div
                      key={drive.id}
                      className="p-3 bg-hope-pink dark:bg-hope-coral rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium">{drive.name}</p>
                        <Badge variant="secondary">
                          {drive.registered_count}/{drive.capacity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {drive.location}, {drive.city}
                      </p>
                      <p className="text-sm text-muted-foreground mb-3">
                        {new Date(drive.start_date).toLocaleDateString()} •{" "}
                        {drive.start_time} - {drive.end_time}
                      </p>
                      <Button
                        asChild
                        size="sm"
                        className="w-full bg-hope-red hover:bg-hope-red/90"
                      >
                        <Link to={`/book-appointment/${drive.id}`}>
                          Book Appointment
                        </Link>
                      </Button>
                    </div>
                  ))}
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/drives">View All Drives</Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    No nearby drives found
                  </p>
                  <Button asChild>
                    <Link to="/drives">Explore All Drives</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Progress to Next Level */}
        {stats.level < 10 && (
          <Card className="mt-8 border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-hope-red flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Progress to Level {stats.level + 1}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Current Points: {stats.totalPoints}</span>
                  <span>Target: {(stats.level + 1) * 100} points</span>
                </div>
                <Progress value={stats.totalPoints % 100} className="w-full" />
                <p className="text-sm text-muted-foreground">
                  {(stats.level + 1) * 100 - stats.totalPoints} more points to
                  level up!
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Chatbot Widget */}
      <ChatbotWidget />
    </div>
  );
}
