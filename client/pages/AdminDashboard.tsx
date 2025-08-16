import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Heart,
  ArrowLeft,
  Users,
  Calendar,
  MapPin,
  TrendingUp,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Download,
  Settings,
  Shield,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  Clock,
  CheckCircle,
  XCircle,
  Hospital,
  Building,
  UserCheck,
  Mail,
  Bell,
} from "lucide-react";
import { format, subDays } from "date-fns";

// Mock analytics data
const analyticsData = {
  totalDonors: 5243,
  activeDonors: 3891,
  totalDonations: 12847,
  livesImpacted: 38541,
  bloodDrives: 234,
  activeDrives: 12,
  partnerships: 68,
  monthlyGrowth: 12.5,
  donationsThisMonth: 1245,
  upcomingAppointments: 156,
};

// Mock recent donors
const recentDonors = [
  {
    id: 1,
    name: "John Smith",
    bloodType: "O+",
    lastDonation: "2024-12-10",
    status: "eligible",
    donations: 8,
  },
  {
    id: 2,
    name: "Sarah Johnson",
    bloodType: "A-",
    lastDonation: "2024-12-08",
    status: "eligible",
    donations: 15,
  },
  {
    id: 3,
    name: "Mike Chen",
    bloodType: "B+",
    lastDonation: "2024-12-05",
    status: "pending",
    donations: 3,
  },
  {
    id: 4,
    name: "Emily Davis",
    bloodType: "AB+",
    lastDonation: "2024-12-03",
    status: "ineligible",
    donations: 22,
  },
  {
    id: 5,
    name: "Robert Wilson",
    bloodType: "O-",
    lastDonation: "2024-12-01",
    status: "eligible",
    donations: 11,
  },
];

// Mock blood drives
const bloodDrives = [
  {
    id: 1,
    name: "Holiday Blood Drive",
    organizer: "Red Cross Downtown",
    date: "2024-12-15",
    location: "Community Center",
    capacity: 100,
    registered: 78,
    status: "active",
  },
  {
    id: 2,
    name: "University Drive",
    organizer: "State University",
    date: "2024-12-18",
    location: "Student Union",
    capacity: 60,
    registered: 45,
    status: "active",
  },
  {
    id: 3,
    name: "Hospital Emergency Drive",
    organizer: "City General Hospital",
    date: "2024-12-20",
    location: "Hospital Main Lobby",
    capacity: 80,
    registered: 92,
    status: "overbooked",
  },
];

// Mock hospital partnerships
const hospitals = [
  {
    id: 1,
    name: "City General Hospital",
    contact: "Dr. Sarah Wilson",
    email: "swilson@citygeneral.org",
    status: "active",
    currentNeed: "O-",
    urgency: "high",
  },
  {
    id: 2,
    name: "Children's Medical Center",
    contact: "Dr. Michael Rodriguez",
    email: "mrodriguez@childmed.org",
    status: "active",
    currentNeed: "A+",
    urgency: "medium",
  },
  {
    id: 3,
    name: "Regional Medical Center",
    contact: "Dr. Lisa Chang",
    email: "lchang@regional.org",
    status: "pending",
    currentNeed: "B-",
    urgency: "low",
  },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
      case "eligible":
        return <CheckCircle className="w-4 h-4 text-success" />;
      case "pending":
        return <Clock className="w-4 h-4 text-warning" />;
      case "inactive":
      case "ineligible":
        return <XCircle className="w-4 h-4 text-destructive" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "eligible":
        return "bg-success/10 text-success border-success/20";
      case "pending":
        return "bg-warning/10 text-warning border-warning/20";
      case "inactive":
      case "ineligible":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "overbooked":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-muted/10 text-muted-foreground border-muted/20";
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "bg-destructive/10 text-destructive";
      case "medium":
        return "bg-warning/10 text-warning";
      case "low":
        return "bg-success/10 text-success";
      default:
        return "bg-muted/10 text-muted-foreground";
    }
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
              <Badge className="bg-hope-red/10 text-hope-red">Admin</Badge>
            </Link>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" asChild>
                <Link to="/dashboard">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Exit Admin
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-hope-red mb-2">
              Admin Dashboard
            </h1>
            <p className="text-xl text-muted-foreground">
              Manage blood donations, drives, and community partnerships
            </p>
          </div>
          <div className="flex space-x-3">
            <Button className="bg-hope-red hover:bg-hope-red/90">
              <Plus className="w-4 h-4 mr-2" />
              Create Blood Drive
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Total Donors</p>
                  <p className="text-3xl font-bold text-hope-red">
                    {analyticsData.totalDonors.toLocaleString()}
                  </p>
                  <p className="text-sm text-success">
                    +{analyticsData.monthlyGrowth}% this month
                  </p>
                </div>
                <div className="w-12 h-12 bg-hope-red/10 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-hope-red" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">
                    Total Donations
                  </p>
                  <p className="text-3xl font-bold text-hope-red">
                    {analyticsData.totalDonations.toLocaleString()}
                  </p>
                  <p className="text-sm text-success">
                    {analyticsData.donationsThisMonth} this month
                  </p>
                </div>
                <div className="w-12 h-12 bg-hope-red/10 rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6 text-hope-red fill-current" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Active Drives</p>
                  <p className="text-3xl font-bold text-hope-red">
                    {analyticsData.activeDrives}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {analyticsData.upcomingAppointments} appointments
                  </p>
                </div>
                <div className="w-12 h-12 bg-hope-red/10 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-hope-red" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">
                    Lives Impacted
                  </p>
                  <p className="text-3xl font-bold text-hope-red">
                    {analyticsData.livesImpacted.toLocaleString()}
                  </p>
                  <p className="text-sm text-success">+3,672 this month</p>
                </div>
                <div className="w-12 h-12 bg-hope-red/10 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-hope-red" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="donors">Donors</TabsTrigger>
            <TabsTrigger value="drives">Blood Drives</TabsTrigger>
            <TabsTrigger value="hospitals">Hospitals</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="w-5 h-5" />
                    <span>Recent Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 bg-hope-pink dark:bg-hope-coral rounded-lg">
                      <div className="w-2 h-2 bg-hope-red rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          New donor registration: Sarah Kim
                        </p>
                        <p className="text-xs text-muted-foreground">
                          5 minutes ago
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-hope-pink dark:bg-hope-coral rounded-lg">
                      <div className="w-2 h-2 bg-success rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          Blood drive completed: Downtown Center
                        </p>
                        <p className="text-xs text-muted-foreground">
                          2 hours ago
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-hope-pink dark:bg-hope-coral rounded-lg">
                      <div className="w-2 h-2 bg-warning rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          Urgent blood request: City Hospital
                        </p>
                        <p className="text-xs text-muted-foreground">
                          4 hours ago
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Urgent Requests */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5" />
                    <span>Urgent Requests</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {hospitals
                      .filter((h) => h.urgency === "high")
                      .map((hospital) => (
                        <Alert key={hospital.id}>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            <strong>{hospital.name}</strong> urgently needs{" "}
                            {hospital.currentNeed} blood type. Contact:{" "}
                            {hospital.contact}
                          </AlertDescription>
                        </Alert>
                      ))}
                    {hospitals
                      .filter((h) => h.urgency === "medium")
                      .map((hospital) => (
                        <div
                          key={hospital.id}
                          className="p-3 bg-warning/10 border border-warning/20 rounded-lg"
                        >
                          <p className="text-sm font-medium">{hospital.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Needs {hospital.currentNeed} • Contact:{" "}
                            {hospital.contact}
                          </p>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Donors Management Tab */}
          <TabsContent value="donors" className="space-y-6 mt-6">
            {/* Search and Filter */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search donors by name, email, or blood type..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="eligible">Eligible</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="ineligible">Ineligible</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    <Filter className="w-4 h-4 mr-2" />
                    More Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Donors List */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Recent Donors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentDonors.map((donor) => (
                    <div
                      key={donor.id}
                      className="flex items-center justify-between p-4 bg-hope-pink dark:bg-hope-coral rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-hope-red rounded-full flex items-center justify-center text-white font-semibold">
                          {donor.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div>
                          <p className="font-medium">{donor.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {donor.bloodType} • {donor.donations} donations •
                            Last:{" "}
                            {format(new Date(donor.lastDonation), "MMM dd")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className={getStatusColor(donor.status)}>
                          {getStatusIcon(donor.status)}
                          <span className="ml-1 capitalize">
                            {donor.status}
                          </span>
                        </Badge>
                        <Button variant="outline" size="sm">
                          <UserCheck className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Blood Drives Tab */}
          <TabsContent value="drives" className="space-y-6 mt-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Blood Drives Management</CardTitle>
                  <Button className="bg-hope-red hover:bg-hope-red/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Drive
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bloodDrives.map((drive) => (
                    <div key={drive.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {drive.name}
                          </h3>
                          <p className="text-muted-foreground">
                            {drive.organizer}
                          </p>
                        </div>
                        <Badge className={getStatusColor(drive.status)}>
                          {getStatusIcon(drive.status)}
                          <span className="ml-1 capitalize">
                            {drive.status}
                          </span>
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-hope-red" />
                          <span className="text-sm">
                            {format(new Date(drive.date), "MMM dd, yyyy")}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-hope-red" />
                          <span className="text-sm">{drive.location}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-hope-red" />
                          <span className="text-sm">
                            {drive.registered}/{drive.capacity} registered
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex-1 mr-4">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                drive.registered > drive.capacity
                                  ? "bg-orange-500"
                                  : "bg-hope-red"
                              }`}
                              style={{
                                width: `${Math.min((drive.registered / drive.capacity) * 100, 100)}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                          <Button variant="outline" size="sm">
                            <Mail className="w-4 h-4 mr-2" />
                            Notify
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Hospitals Tab */}
          <TabsContent value="hospitals" className="space-y-6 mt-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Hospital className="w-5 h-5" />
                    <span>Hospital Partnerships</span>
                  </CardTitle>
                  <Button className="bg-hope-red hover:bg-hope-red/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Hospital
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {hospitals.map((hospital) => (
                    <div key={hospital.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {hospital.name}
                          </h3>
                          <p className="text-muted-foreground">
                            {hospital.contact} • {hospital.email}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getUrgencyColor(hospital.urgency)}>
                            {hospital.urgency.toUpperCase()} URGENCY
                          </Badge>
                          <Badge className={getStatusColor(hospital.status)}>
                            {getStatusIcon(hospital.status)}
                            <span className="ml-1 capitalize">
                              {hospital.status}
                            </span>
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">
                            Current Need: {hospital.currentNeed}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {hospital.urgency === "high"
                              ? "Immediate attention required"
                              : hospital.urgency === "medium"
                                ? "Monitor closely"
                                : "Routine monitoring"}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Mail className="w-4 h-4 mr-2" />
                            Contact
                          </Button>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chart placeholders */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5" />
                    <span>Donation Trends</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-64 flex items-center justify-center">
                  <div className="text-center">
                    <LineChart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Chart: Monthly donation trends over time
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PieChart className="w-5 h-5" />
                    <span>Blood Type Distribution</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-64 flex items-center justify-center">
                  <div className="text-center">
                    <PieChart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Chart: Blood type distribution among donors
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5" />
                    <span>Growth Metrics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-64 flex items-center justify-center">
                  <div className="text-center">
                    <TrendingUp className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Chart: Platform growth and engagement metrics
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>Geographic Distribution</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-64 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Map: Donor distribution by geographic region
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
