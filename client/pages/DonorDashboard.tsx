import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, useUser, SignOutButton } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Heart, MapPin, Calendar, User, Award, Bell, Settings, LogOut } from 'lucide-react';

export default function DonorDashboard() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate('/login');
    }
  }, [isSignedIn, isLoaded, navigate]);

  // Show loading while checking authentication
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-hope-red rounded-full animate-pulse mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not signed in (will redirect)
  if (!isSignedIn) {
    return null;
  }

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
              <span className="text-xl font-bold text-hope-red">Drop of Hope</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Bell className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="w-5 h-5" />
              </Button>
              <SignOutButton>
                <Button variant="outline" size="sm">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </SignOutButton>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Welcome Section */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl text-hope-red">Welcome back, John!</CardTitle>
                    <p className="text-muted-foreground">Ready to save more lives?</p>
                  </div>
                  <Badge className="bg-hope-red">A+ Donor</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-hope-pink dark:bg-hope-coral rounded-lg">
                    <div className="text-2xl font-bold text-hope-red">12</div>
                    <div className="text-sm text-muted-foreground">Total Donations</div>
                  </div>
                  <div className="text-center p-4 bg-hope-pink dark:bg-hope-coral rounded-lg">
                    <div className="text-2xl font-bold text-hope-red">1,200</div>
                    <div className="text-sm text-muted-foreground">Points Earned</div>
                  </div>
                  <div className="text-center p-4 bg-hope-pink dark:bg-hope-coral rounded-lg">
                    <div className="text-2xl font-bold text-hope-red">36</div>
                    <div className="text-sm text-muted-foreground">Lives Saved</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button className="h-auto p-6 bg-hope-red hover:bg-hope-red/90" asChild>
                    <Link to="/find-drives" className="flex flex-col items-center space-y-2">
                      <MapPin className="w-8 h-8" />
                      <span className="text-lg">Find Blood Drives</span>
                      <span className="text-sm opacity-90">3 drives near you</span>
                    </Link>
                  </Button>
                  <Button variant="outline" className="h-auto p-6 border-hope-red text-hope-red hover:bg-hope-red hover:text-white" asChild>
                    <Link to="/appointments" className="flex flex-col items-center space-y-2">
                      <Calendar className="w-8 h-8" />
                      <span className="text-lg">My Appointments</span>
                      <span className="text-sm opacity-70">Next: Dec 15</span>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-4 bg-hope-pink dark:bg-hope-coral rounded-lg">
                    <div className="w-10 h-10 bg-hope-red rounded-full flex items-center justify-center">
                      <Heart className="w-5 h-5 text-white fill-current" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">Donation Completed</div>
                      <div className="text-sm text-muted-foreground">Red Cross Center - Nov 28, 2024</div>
                    </div>
                    <Badge variant="secondary">+100 points</Badge>
                  </div>
                  <div className="flex items-center space-x-4 p-4 bg-hope-pink dark:bg-hope-coral rounded-lg">
                    <div className="w-10 h-10 bg-success rounded-full flex items-center justify-center">
                      <Award className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">Badge Earned</div>
                      <div className="text-sm text-muted-foreground">Frequent Donor Badge - Nov 20, 2024</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Card */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Profile</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="w-20 h-20 bg-hope-red rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                    JD
                  </div>
                  <h3 className="font-semibold">John Doe</h3>
                  <p className="text-sm text-muted-foreground">Blood Type: A+</p>
                  <p className="text-sm text-muted-foreground">Member since 2022</p>
                </div>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/profile">Edit Profile</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Progress to Next Level */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="w-5 h-5" />
                  <span>Progress</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Gold Level</span>
                    <span>1200/1500 pts</span>
                  </div>
                  <Progress value={80} className="h-2" />
                </div>
                <p className="text-sm text-muted-foreground">
                  300 more points to reach Platinum level!
                </p>
              </CardContent>
            </Card>

            {/* Upcoming Appointments */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Next Appointment</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="font-medium">City Hospital Blood Drive</div>
                  <div className="text-sm text-muted-foreground">December 15, 2024</div>
                  <div className="text-sm text-muted-foreground">10:00 AM - 12:00 PM</div>
                  <Button variant="outline" size="sm" className="w-full mt-3">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
