import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useHybridAuth } from "@/contexts/HybridAuthContext";
import {
  statsService,
  donorService,
  driveService,
  hospitalService,
  appointmentService,
  bloodRequestService,
} from "@/lib/db-services";
import { useToast } from "@/hooks/use-toast";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  LogOut,
  RefreshCw,
  Eye,
  Edit,
  Droplets,
  Phone,
} from "lucide-react";
import { format, subDays } from "date-fns";

interface AnalyticsData {
  totalDonors: number;
  activeDonors: number;
  totalDonations: number;
  livesImpacted: number;
  bloodDrives: number;
  activeDrives: number;
  partnerships: number;
  monthlyGrowth: number;
  donationsThisMonth: number;
  upcomingAppointments: number;
}

export default function AdminDashboard() {
  const { adminProfile, loading, supabaseSignOut } = useHybridAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Database state
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalDonors: 0,
    activeDonors: 0,
    totalDonations: 0,
    livesImpacted: 0,
    bloodDrives: 0,
    activeDrives: 0,
    partnerships: 0,
    monthlyGrowth: 12.5,
    donationsThisMonth: 0,
    upcomingAppointments: 0,
  });
  const [recentDonors, setRecentDonors] = useState<any[]>([]);
  const [bloodDrives, setBloodDrives] = useState<any[]>([]);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [bloodRequests, setBloodRequests] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const { toast } = useToast();

  // Dialog states
  const [isDriveDialogOpen, setIsDriveDialogOpen] = useState(false);
  const [isHospitalDialogOpen, setIsHospitalDialogOpen] = useState(false);

  // New Drive form state
  const [newDrive, setNewDrive] = useState({
    name: "",
    description: "",
    location: "",
    address: "",
    city: "",
    state: "",
    start_date: "",
    end_date: "",
    start_time: "09:00",
    end_time: "17:00",
    capacity: 50,
    hospital_id: "",
  });

  // New Hospital form state
  const [newHospital, setNewHospital] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    phone: "",
    email: "",
    contact_person: "",
    license_number: "",
  });

  // Donor view dialog
  const [viewingDonor, setViewingDonor] = useState<any>(null);
  const [isDonorDialogOpen, setIsDonorDialogOpen] = useState(false);

  // Drive edit dialog
  const [editingDrive, setEditingDrive] = useState<any>(null);
  const [isEditDriveDialogOpen, setIsEditDriveDialogOpen] = useState(false);

  // Hospital details dialog
  const [viewingHospital, setViewingHospital] = useState<any>(null);
  const [isHospitalDetailsOpen, setIsHospitalDetailsOpen] = useState(false);

  // Redirect if not authenticated as admin
  useEffect(() => {
    if (!loading && !adminProfile) {
      navigate("/admin/login");
    }
  }, [adminProfile, loading, navigate]);

  // Load data from database
  useEffect(() => {
    if (adminProfile) {
      loadDashboardData();
    }
  }, [adminProfile]);

  const loadDashboardData = async () => {
    try {
      setDataLoading(true);

      // Fetch all data in parallel
      const [
        statsResult,
        donorsResult,
        drivesResult,
        hospitalsResult,
        appointmentsResult,
        bloodRequestsResult,
      ] = await Promise.all([
        statsService.getAdminStats(),
        donorService.getRecent(10),
        driveService.getAdminAll(),
        hospitalService.getAll(),
        appointmentService.getAll(),
        bloodRequestService.getAll(),
      ]);

      // Update analytics - statsResult is the direct object, not wrapped in { data }
      if (statsResult) {
        setAnalyticsData({
          totalDonors: statsResult.totalDonors || 0,
          activeDonors: Math.floor((statsResult.totalDonors || 0) * 0.75),
          totalDonations: statsResult.totalDonations || 0,
          livesImpacted: statsResult.livesImpacted || 0,
          bloodDrives: statsResult.totalDrives || 0,
          activeDrives: statsResult.activeDrives || 0,
          partnerships: statsResult.partnerships || 0,
          monthlyGrowth: 12.5,
          donationsThisMonth: Math.floor(
            (statsResult.totalDonations || 0) * 0.1,
          ),
          upcomingAppointments: appointmentsResult.data?.length || 0,
        });
      }

      // Update donors list
      if (donorsResult.data) {
        setRecentDonors(
          donorsResult.data.map((donor: any) => ({
            id: donor.id,
            name: donor.name || "Unknown Donor",
            bloodType: donor.blood_type || "Unknown",
            lastDonation: donor.last_donation_date || new Date().toISOString(),
            status: donor.eligibility_status || "eligible",
            donations: donor.total_donations || 0,
          })),
        );
      }

      // Update drives list
      if (drivesResult.data) {
        setBloodDrives(
          drivesResult.data.map((drive: any) => {
            // Compute real registered count from appointments
            const registeredCount = appointmentsResult.data
              ? appointmentsResult.data.filter(
                  (apt: any) =>
                    apt.drive_id === drive.id &&
                    apt.status !== "cancelled" &&
                    apt.status !== "no_show",
                ).length
              : drive.registered_count || 0;

            return {
              id: drive.id,
              name: drive.name,
              organizer: drive.profiles?.name || "Unknown",
              date: drive.start_date,
              location: drive.location,
              capacity: drive.capacity,
              registered: registeredCount,
              status: drive.is_active ? "active" : "inactive",
            };
          }),
        );
      }

      // Update hospitals list
      if (hospitalsResult.data) {
        setHospitals(
          hospitalsResult.data.map((hospital: any) => ({
            id: hospital.id,
            name: hospital.name,
            contact: hospital.contact_name || "Contact",
            email: hospital.email || "N/A",
            status: hospital.is_verified ? "active" : "pending",
            currentNeed: "O-",
            urgency: "medium",
          })),
        );
      }

      // Update appointments list
      if (appointmentsResult.data) {
        setAppointments(appointmentsResult.data);
      }

      // Update blood requests list
      if (bloodRequestsResult.data) {
        setBloodRequests(bloodRequestsResult.data);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setDataLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabaseSignOut();
    navigate("/admin/login");
  };

  // Create Drive handler
  const handleCreateDrive = async () => {
    if (
      !newDrive.name ||
      !newDrive.location ||
      !newDrive.start_date ||
      !newDrive.end_date
    ) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    try {
      const drivePayload: any = {
        name: newDrive.name,
        description: newDrive.description || "",
        location: newDrive.location,
        address: newDrive.address || newDrive.location,
        city: newDrive.city || "",
        state: newDrive.state || "",
        start_date: newDrive.start_date,
        end_date: newDrive.end_date,
        start_time: newDrive.start_time,
        end_time: newDrive.end_time,
        capacity: Number(newDrive.capacity) || 50,
      };
      if (newDrive.hospital_id) {
        drivePayload.hospital_id = newDrive.hospital_id;
      }
      const { error } = await driveService.create(drivePayload);
      if (error) {
        console.error("Error creating drive:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to create drive.",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Drive Created!",
        description: `"${newDrive.name}" has been created successfully.`,
      });
      setNewDrive({
        name: "",
        description: "",
        location: "",
        address: "",
        city: "",
        state: "",
        start_date: "",
        end_date: "",
        start_time: "09:00",
        end_time: "17:00",
        capacity: 50,
        hospital_id: "",
      });
      setIsDriveDialogOpen(false);
      loadDashboardData();
    } catch (err) {
      console.error("Error creating drive:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  // Add Hospital handler
  const handleAddHospital = async () => {
    if (
      !newHospital.name ||
      !newHospital.address ||
      !newHospital.city ||
      !newHospital.state ||
      !newHospital.phone ||
      !newHospital.email ||
      !newHospital.contact_person
    ) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    try {
      const { error } = await hospitalService.create({
        name: newHospital.name,
        address: newHospital.address,
        city: newHospital.city,
        state: newHospital.state,
        phone: newHospital.phone,
        email: newHospital.email,
        contact_person: newHospital.contact_person,
        license_number: newHospital.license_number || undefined,
      });
      if (error) {
        console.error("Error adding hospital:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to add hospital.",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Hospital Added!",
        description: `"${newHospital.name}" has been added successfully.`,
      });
      setNewHospital({
        name: "",
        address: "",
        city: "",
        state: "",
        phone: "",
        email: "",
        contact_person: "",
        license_number: "",
      });
      setIsHospitalDialogOpen(false);
      loadDashboardData();
    } catch (err) {
      console.error("Error adding hospital:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  // Edit Drive handler
  const handleEditDrive = async () => {
    if (!editingDrive?.id) return;
    try {
      const { error } = await driveService.update(editingDrive.id, {
        name: editingDrive.name,
        location: editingDrive.location,
        capacity: Number(editingDrive.capacity),
      });
      if (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to update drive.",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Drive Updated!",
        description: `"${editingDrive.name}" has been updated.`,
      });
      setIsEditDriveDialogOpen(false);
      setEditingDrive(null);
      loadDashboardData();
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-hope-red rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Heart className="w-5 h-5 text-white fill-current" />
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if not admin
  if (!adminProfile) {
    return null;
  }

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
            <Button
              className="bg-hope-red hover:bg-hope-red/90"
              onClick={() => setIsDriveDialogOpen(true)}
            >
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
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="blood-requests">Blood Requests</TabsTrigger>
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

          {/* Appointments Management Tab */}
          <TabsContent value="appointments" className="space-y-6 mt-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Appointment Requests</span>
                  <Badge className="ml-2">{appointments.length} total</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {appointments.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No appointments found
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {appointments.map((appointment: any) => (
                      <div
                        key={appointment.id}
                        className="flex items-center justify-between p-4 bg-hope-pink dark:bg-hope-coral rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-hope-red rounded-full flex items-center justify-center text-white font-semibold">
                            {appointment.donors?.name
                              ?.substring(0, 2)
                              .toUpperCase() || "DN"}
                          </div>
                          <div>
                            <h4 className="font-semibold">
                              {appointment.donors?.name || "Unknown Donor"}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {appointment.drives?.name || "Unknown Drive"}
                            </p>
                            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {format(
                                  new Date(appointment.appointment_date),
                                  "MMM d, yyyy",
                                )}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {appointment.appointment_time}
                              </span>
                              {appointment.donors?.blood_type && (
                                <Badge variant="outline" className="text-xs">
                                  {appointment.donors.blood_type}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            className={
                              appointment.status === "scheduled"
                                ? "bg-warning/10 text-warning"
                                : appointment.status === "confirmed"
                                  ? "bg-success/10 text-success"
                                  : appointment.status === "completed"
                                    ? "bg-blue-500/10 text-blue-600"
                                    : appointment.status === "cancelled"
                                      ? "bg-destructive/10 text-destructive"
                                      : "bg-muted"
                            }
                          >
                            {appointment.status}
                          </Badge>
                          {appointment.status === "scheduled" && (
                            <>
                              <Button
                                size="sm"
                                className="bg-success hover:bg-success/90"
                                onClick={async () => {
                                  const { error } =
                                    await appointmentService.updateStatus(
                                      appointment.id,
                                      "completed",
                                    );
                                  if (!error) {
                                    toast({
                                      title: "Appointment Completed",
                                      description:
                                        "The appointment has been marked as completed.",
                                    });
                                    loadDashboardData();
                                  }
                                }}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Complete
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={async () => {
                                  const { error } =
                                    await appointmentService.reject(
                                      appointment.id,
                                    );
                                  if (!error) {
                                    toast({
                                      title: "Appointment Cancelled",
                                      description:
                                        "The appointment has been cancelled.",
                                      variant: "destructive",
                                    });
                                    loadDashboardData();
                                  }
                                }}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Cancel
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Blood Requests Tab */}
          <TabsContent value="blood-requests" className="space-y-6 mt-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>Blood Requests from Hospitals</span>
                  <Badge className="ml-2">{bloodRequests.length} total</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {bloodRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No blood requests yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bloodRequests.map((request: any) => (
                      <div
                        key={request.id}
                        className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                            {request.blood_type}
                          </div>
                          <div>
                            <h4 className="font-semibold">
                              {request.hospitals?.name || "Unknown Hospital"}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {request.hospitals?.city},{" "}
                              {request.hospitals?.state}
                            </p>
                            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                              <span className="font-medium">
                                Units Requested: {request.units_requested}
                              </span>
                              <Badge
                                className={
                                  request.urgency === "emergency"
                                    ? "bg-destructive/10 text-destructive"
                                    : request.urgency === "urgent"
                                      ? "bg-warning/10 text-warning"
                                      : "bg-success/10 text-success"
                                }
                              >
                                {request.urgency}
                              </Badge>
                              {request.hospitals?.phone && (
                                <span>📞 {request.hospitals.phone}</span>
                              )}
                            </div>
                            {request.notes && (
                              <p className="text-xs text-muted-foreground mt-1 italic">
                                "{request.notes}"
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            className={
                              request.status === "pending"
                                ? "bg-warning/10 text-warning"
                                : request.status === "fulfilled"
                                  ? "bg-success/10 text-success"
                                  : request.status === "cancelled"
                                    ? "bg-destructive/10 text-destructive"
                                    : "bg-muted"
                            }
                          >
                            {request.status}
                          </Badge>
                          {request.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                className="bg-success hover:bg-success/90"
                                onClick={async () => {
                                  const { error } =
                                    await bloodRequestService.approve(
                                      request.id,
                                    );
                                  if (!error) {
                                    toast({
                                      title: "Request Approved",
                                      description:
                                        "The blood request has been approved.",
                                    });
                                    loadDashboardData();
                                  }
                                }}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={async () => {
                                  const { error } =
                                    await bloodRequestService.reject(
                                      request.id,
                                    );
                                  if (!error) {
                                    toast({
                                      title: "Request Rejected",
                                      description:
                                        "The blood request has been rejected.",
                                      variant: "destructive",
                                    });
                                    loadDashboardData();
                                  }
                                }}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setViewingDonor(donor);
                            setIsDonorDialogOpen(true);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
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
                  <Button
                    className="bg-hope-red hover:bg-hope-red/90"
                    onClick={() => setIsDriveDialogOpen(true)}
                  >
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
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingDrive({
                                id: drive.id,
                                name: drive.name,
                                location: drive.location,
                                capacity: drive.capacity,
                                organizer: drive.organizer,
                                status: drive.status,
                              });
                              setIsEditDriveDialogOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4 mr-1" />
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
                  <Button
                    className="bg-hope-red hover:bg-hope-red/90"
                    onClick={() => setIsHospitalDialogOpen(true)}
                  >
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
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setViewingHospital(hospital);
                              setIsHospitalDetailsOpen(true);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-1" />
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

      {/* Create Drive Dialog */}
      <Dialog open={isDriveDialogOpen} onOpenChange={setIsDriveDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Blood Drive</DialogTitle>
            <DialogDescription>
              Fill in the details below to schedule a new blood drive.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="drive-name">Drive Name *</Label>
              <Input
                id="drive-name"
                placeholder="e.g. Downtown Community Blood Drive"
                value={newDrive.name}
                onChange={(e) =>
                  setNewDrive({ ...newDrive, name: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="drive-description">Description</Label>
              <Textarea
                id="drive-description"
                placeholder="Brief description of the blood drive..."
                value={newDrive.description}
                onChange={(e) =>
                  setNewDrive({ ...newDrive, description: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="drive-location">Location / Venue *</Label>
              <Input
                id="drive-location"
                placeholder="e.g. City Community Center"
                value={newDrive.location}
                onChange={(e) =>
                  setNewDrive({ ...newDrive, location: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="drive-address">Full Address</Label>
              <Input
                id="drive-address"
                placeholder="e.g. 123 Main St"
                value={newDrive.address}
                onChange={(e) =>
                  setNewDrive({ ...newDrive, address: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="drive-city">City</Label>
                <Input
                  id="drive-city"
                  placeholder="City"
                  value={newDrive.city}
                  onChange={(e) =>
                    setNewDrive({ ...newDrive, city: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="drive-state">State</Label>
                <Input
                  id="drive-state"
                  placeholder="State"
                  value={newDrive.state}
                  onChange={(e) =>
                    setNewDrive({ ...newDrive, state: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="drive-start-date">Start Date *</Label>
                <Input
                  id="drive-start-date"
                  type="date"
                  value={newDrive.start_date}
                  onChange={(e) =>
                    setNewDrive({ ...newDrive, start_date: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="drive-end-date">End Date *</Label>
                <Input
                  id="drive-end-date"
                  type="date"
                  value={newDrive.end_date}
                  onChange={(e) =>
                    setNewDrive({ ...newDrive, end_date: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="drive-start-time">Start Time</Label>
                <Input
                  id="drive-start-time"
                  type="time"
                  value={newDrive.start_time}
                  onChange={(e) =>
                    setNewDrive({ ...newDrive, start_time: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="drive-end-time">End Time</Label>
                <Input
                  id="drive-end-time"
                  type="time"
                  value={newDrive.end_time}
                  onChange={(e) =>
                    setNewDrive({ ...newDrive, end_time: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="drive-capacity">Capacity (slots)</Label>
                <Input
                  id="drive-capacity"
                  type="number"
                  min={1}
                  value={newDrive.capacity}
                  onChange={(e) =>
                    setNewDrive({
                      ...newDrive,
                      capacity: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="drive-hospital">Assign to Hospital</Label>
                <Select
                  value={newDrive.hospital_id}
                  onValueChange={(value) =>
                    setNewDrive({ ...newDrive, hospital_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Optional" />
                  </SelectTrigger>
                  <SelectContent>
                    {hospitals.map((h) => (
                      <SelectItem key={h.id} value={h.id}>
                        {h.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              className="bg-hope-red hover:bg-hope-red/90 w-full mt-2"
              onClick={handleCreateDrive}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Drive
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Hospital Dialog */}
      <Dialog
        open={isHospitalDialogOpen}
        onOpenChange={setIsHospitalDialogOpen}
      >
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Hospital</DialogTitle>
            <DialogDescription>
              Enter the hospital details to register a new hospital partnership.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="hospital-name">Hospital Name *</Label>
              <Input
                id="hospital-name"
                placeholder="e.g. City General Hospital"
                value={newHospital.name}
                onChange={(e) =>
                  setNewHospital({ ...newHospital, name: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="hospital-address">Address *</Label>
              <Input
                id="hospital-address"
                placeholder="Full street address"
                value={newHospital.address}
                onChange={(e) =>
                  setNewHospital({ ...newHospital, address: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="hospital-city">City *</Label>
                <Input
                  id="hospital-city"
                  placeholder="City"
                  value={newHospital.city}
                  onChange={(e) =>
                    setNewHospital({ ...newHospital, city: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="hospital-state">State *</Label>
                <Input
                  id="hospital-state"
                  placeholder="State"
                  value={newHospital.state}
                  onChange={(e) =>
                    setNewHospital({ ...newHospital, state: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="hospital-phone">Phone *</Label>
                <Input
                  id="hospital-phone"
                  placeholder="+91 98765 43210"
                  value={newHospital.phone}
                  onChange={(e) =>
                    setNewHospital({ ...newHospital, phone: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="hospital-email">Email *</Label>
                <Input
                  id="hospital-email"
                  type="email"
                  placeholder="hospital@example.com"
                  value={newHospital.email}
                  onChange={(e) =>
                    setNewHospital({ ...newHospital, email: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="hospital-contact">Contact Person *</Label>
                <Input
                  id="hospital-contact"
                  placeholder="Dr. Name"
                  value={newHospital.contact_person}
                  onChange={(e) =>
                    setNewHospital({
                      ...newHospital,
                      contact_person: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="hospital-license">License Number</Label>
                <Input
                  id="hospital-license"
                  placeholder="Optional"
                  value={newHospital.license_number}
                  onChange={(e) =>
                    setNewHospital({
                      ...newHospital,
                      license_number: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <Button
              className="bg-hope-red hover:bg-hope-red/90 w-full mt-2"
              onClick={handleAddHospital}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Hospital
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Donor Dialog */}
      <Dialog open={isDonorDialogOpen} onOpenChange={setIsDonorDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-hope-red" />
              Donor Profile
            </DialogTitle>
            <DialogDescription>
              Donor information and donation history
            </DialogDescription>
          </DialogHeader>
          {viewingDonor && (
            <div className="space-y-4 mt-2">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-hope-red rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {viewingDonor.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{viewingDonor.name}</h3>
                  <Badge className={getStatusColor(viewingDonor.status)}>
                    {getStatusIcon(viewingDonor.status)}
                    <span className="ml-1 capitalize">
                      {viewingDonor.status}
                    </span>
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Blood Type</p>
                  <p className="font-bold text-xl text-hope-red">
                    {viewingDonor.bloodType}
                  </p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Total Donations
                  </p>
                  <p className="font-bold text-xl">{viewingDonor.donations}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg col-span-2">
                  <p className="text-sm text-muted-foreground">Last Donation</p>
                  <p className="font-medium">
                    {format(
                      new Date(viewingDonor.lastDonation),
                      "MMMM dd, yyyy",
                    )}
                  </p>
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => setIsDonorDialogOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Drive Dialog */}
      <Dialog
        open={isEditDriveDialogOpen}
        onOpenChange={setIsEditDriveDialogOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Blood Drive</DialogTitle>
            <DialogDescription>Update drive details</DialogDescription>
          </DialogHeader>
          {editingDrive && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-drive-name">Drive Name</Label>
                <Input
                  id="edit-drive-name"
                  value={editingDrive.name}
                  onChange={(e) =>
                    setEditingDrive({ ...editingDrive, name: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-drive-location">Location</Label>
                <Input
                  id="edit-drive-location"
                  value={editingDrive.location}
                  onChange={(e) =>
                    setEditingDrive({
                      ...editingDrive,
                      location: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-drive-capacity">Capacity</Label>
                <Input
                  id="edit-drive-capacity"
                  type="number"
                  min={1}
                  value={editingDrive.capacity}
                  onChange={(e) =>
                    setEditingDrive({
                      ...editingDrive,
                      capacity: Number(e.target.value),
                    })
                  }
                />
              </div>
              <Button
                className="bg-hope-red hover:bg-hope-red/90 w-full mt-2"
                onClick={handleEditDrive}
              >
                Save Changes
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Hospital Details Dialog */}
      <Dialog
        open={isHospitalDetailsOpen}
        onOpenChange={setIsHospitalDetailsOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Hospital className="w-5 h-5 text-hope-red" />
              Hospital Details
            </DialogTitle>
            <DialogDescription>
              Hospital partnership information
            </DialogDescription>
          </DialogHeader>
          {viewingHospital && (
            <div className="space-y-4 mt-2">
              <div>
                <h3 className="font-semibold text-lg">
                  {viewingHospital.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={getStatusColor(viewingHospital.status)}>
                    {getStatusIcon(viewingHospital.status)}
                    <span className="ml-1 capitalize">
                      {viewingHospital.status}
                    </span>
                  </Badge>
                  <Badge className={getUrgencyColor(viewingHospital.urgency)}>
                    {viewingHospital.urgency.toUpperCase()} URGENCY
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Phone className="w-3 h-3" /> Contact
                  </p>
                  <p className="font-medium">{viewingHospital.contact}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Mail className="w-3 h-3" /> Email
                  </p>
                  <p className="font-medium text-sm break-all">
                    {viewingHospital.email}
                  </p>
                </div>
                <div className="p-3 bg-muted rounded-lg col-span-2">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Droplets className="w-3 h-3" /> Current Need
                  </p>
                  <p className="font-bold text-xl text-hope-red">
                    {viewingHospital.currentNeed}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {viewingHospital.urgency === "high"
                      ? "Immediate attention required"
                      : viewingHospital.urgency === "medium"
                        ? "Monitor closely"
                        : "Routine monitoring"}
                  </p>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsHospitalDetailsOpen(false)}
                >
                  Close
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    if (
                      viewingHospital.email &&
                      viewingHospital.email !== "N/A"
                    ) {
                      window.open(`mailto:${viewingHospital.email}`);
                    }
                  }}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Contact
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
