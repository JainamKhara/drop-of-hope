import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useHybridAuth } from "@/contexts/HybridAuthContext";
import { db } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import ChatbotWidget from "@/components/ChatbotWidget";
import NotificationCenter from "@/components/NotificationCenter";
import {
  Heart,
  MapPin,
  Calendar,
  User,
  Award,
  Bell,
  Settings,
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
  const { donorProfile, loading, isSignedIn, clerkSignOut } = useHybridAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [loadingData, setLoadingData] = useState(true);

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  // Load dashboard data
  useEffect(() => {
    if (user && profile) {
      loadDashboardData();
    }
  }, [user, profile]);

  const loadDashboardData = async () => {
    if (!user) return;

    setLoadingData(true);
    try {
      const [appointmentsResult, donationsResult, rewardsResult, drivesResult] =
        await Promise.all([
          db.getUserAppointments(user.id),
          db.getUserDonations(user.id),
          db.getUserRewards(user.id),
          db.getDrives({ city: profile?.city }),
        ]);

      const appointments = appointmentsResult.data || [];
      const donations = donationsResult.data || [];
      const rewards = rewardsResult.data || [];
      const upcomingDrives = (drivesResult.data || []).slice(0, 3);

      // Calculate days until next donation (typically 56 days between whole blood donations)
      const lastDonationDate = profile?.last_donation_date
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
          totalPoints: profile?.points || 0,
          level: profile?.level || 1,
          daysUntilNextDonation,
        },
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  if (loading || loadingData) {
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

  if (!user || !profile) {
    return null;
  }

  const { stats, appointments, donations, rewards, upcomingDrives } =
    dashboardData || {
      stats: {
        totalDonations: 0,
        totalPoints: 0,
        level: 1,
        daysUntilNextDonation: 0,
      },
      appointments: [],
      donations: [],
      rewards: [],
      upcomingDrives: [],
    };

  return (
    <div className="min-h-screen bg-gradient-to-b from-hope-pink to-white dark:from-hope-coral dark:to-background">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md dark:bg-card/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-hope-red rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-white fill-current" />
              </div>
              <span className="text-xl font-bold text-hope-red">
                Drop of Hope
              </span>
            </Link>

            <div className="flex items-center space-x-4">
              <NotificationCenter />
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-hope-red/10 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-hope-red" />
                </div>
                <span className="text-sm font-medium">{profile.name}</span>
              </div>
              <SignOutButton className="hidden md:flex" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-hope-red mb-2">
            Welcome back, {profile.name}!
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
                {profile.blood_type || "Not Set"}
              </div>
              <p className="text-xs text-muted-foreground">
                {profile.blood_type
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
