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
  notificationService,
} from "@/lib/db-services";
import { supabase } from "@/lib/supabase";
import { handleError } from "@/lib/error-handler";
import { useToast } from "@/hooks/use-toast";
import { PaginationControls } from "@/components/PaginationControls";
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
  CalendarDays,
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
  CheckCircle2 as CheckCircle,
  XCircle,
  Hospital,
  Building,
  UserCheck,
  Mail,
  Bell,
  Send,
  LogOut,
  RefreshCw,
  Eye,
  Edit,
  Droplets,
  Phone,
  Award,
} from "lucide-react";
import { format, subDays } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

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
  bloodTypeStats: Record<string, number>;
}

interface BroadcastForm {
  title: string;
  message: string;
  priority: "low" | "medium" | "high";
  bloodTypeFilter: string;
  actionUrl: string;
}

export default function AdminDashboard() {
  const { adminProfile, loading, supabaseSignOut } = useHybridAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterBloodType, setFilterBloodType] = useState("all");

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
    bloodTypeStats: {},
  });
  const [recentDonors, setRecentDonors] = useState<any[]>([]);
  const [leaderboardDonors, setLeaderboardDonors] = useState<any[]>([]);
  const [bloodDrives, setBloodDrives] = useState<any[]>([]);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [bloodRequests, setBloodRequests] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const { toast } = useToast();

  // Announcement state
  const [announcementMsg, setAnnouncementMsg] = useState("");
  const [announcementLink, setAnnouncementLink] = useState("");
  const [announcementSaving, setAnnouncementSaving] = useState(false);

  // Notification broadcast state
  const [isBroadcastDialogOpen, setIsBroadcastDialogOpen] = useState(false);
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState<BroadcastForm>({
    title: "",
    message: "",
    priority: "medium",
    bloodTypeFilter: "all",
    actionUrl: "",
  });

  // Pagination state
  const [donorsPage, setDonorsPage] = useState(1);
  const [leaderboardPage, setLeaderboardPage] = useState(1);
  const [drivesPage, setDrivesPage] = useState(1);
  const [hospitalsPage, setHospitalsPage] = useState(1);
  const [appointmentsPage, setAppointmentsPage] = useState(1);
  const [requestsPage, setRequestsPage] = useState(1);
  const itemsPerPage = 10;

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
        leaderboardResult,
        drivesResult,
        hospitalsResult,
        appointmentsResult,
        bloodRequestsResult,
      ] = await Promise.all([
        statsService.getAdminStats(),
        donorService.getRecent(10),
        donorService.getLeaderboard(20),
        driveService.getAdminAll(),
        hospitalService.getAll(),
        appointmentService.getAll(),
        bloodRequestService.getAll(),
      ]);

      // Update analytics - statsResult is the direct object, not wrapped in { data }
      if (statsResult) {
        setAnalyticsData({
          totalDonors: statsResult.totalDonors || 0,
          activeDonors: statsResult.activeDonors || 0,
          totalDonations: statsResult.totalDonations || 0,
          livesImpacted: statsResult.livesImpacted || 0,
          bloodDrives: statsResult.totalDrives || 0,
          activeDrives: statsResult.activeDrives || 0,
          partnerships: statsResult.partnerships || 0,
          monthlyGrowth: statsResult.monthlyGrowth || 0,
          donationsThisMonth: statsResult.donationsThisMonth || 0,
          upcomingAppointments: appointmentsResult.data?.length || 0,
          bloodTypeStats: statsResult.bloodTypeStats || {},
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
            status: donor.is_verified ? "active" : "pending",
            donations: donor.points || 0,
            email: donor.email || "",
            city: donor.city || "",
          })),
        );
      }

      // Update leaderboard — sorted by points desc
      if (leaderboardResult.data) {
        setLeaderboardDonors(
          leaderboardResult.data.map((donor: any) => ({
            id: donor.id,
            name: donor.name || "Unknown Donor",
            bloodType: donor.blood_type || "Unknown",
            lastDonation: donor.last_donation_date || new Date().toISOString(),
            status: donor.is_verified ? "active" : "pending",
            points: donor.points || 0,
            level: donor.level || 1,
            email: donor.email || "",
            city: donor.city || "",
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
      handleError(error, {
        title: "Dashboard Error",
        description: "Failed to load dashboard data. Please try refreshing the page.",
        operation: "loadDashboardData",
      });
    } finally {
      setDataLoading(false);
    }
  };

  // Pagination logic
  const paginatedDonors = recentDonors.slice((donorsPage - 1) * itemsPerPage, donorsPage * itemsPerPage);
  const donorsTotalPages = Math.ceil(recentDonors.length / itemsPerPage);

  const paginatedLeaderboard = leaderboardDonors.slice((leaderboardPage - 1) * itemsPerPage, leaderboardPage * itemsPerPage);
  const leaderboardTotalPages = Math.ceil(leaderboardDonors.length / itemsPerPage);

  const paginatedDrives = bloodDrives.slice((drivesPage - 1) * itemsPerPage, drivesPage * itemsPerPage);
  const drivesTotalPages = Math.ceil(bloodDrives.length / itemsPerPage);

  const paginatedHospitals = hospitals.slice((hospitalsPage - 1) * itemsPerPage, hospitalsPage * itemsPerPage);
  const hospitalsTotalPages = Math.ceil(hospitals.length / itemsPerPage);

  const paginatedAppointments = appointments.slice((appointmentsPage - 1) * itemsPerPage, appointmentsPage * itemsPerPage);
  const appointmentsTotalPages = Math.ceil(appointments.length / itemsPerPage);

  const paginatedRequests = bloodRequests.slice((requestsPage - 1) * itemsPerPage, requestsPage * itemsPerPage);
  const requestsTotalPages = Math.ceil(bloodRequests.length / itemsPerPage);

  // Filtered Donors Logic
  const filteredDonors = recentDonors.filter((donor) => {
    const matchesSearch =
      searchTerm === "" ||
      donor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donor.bloodType.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "eligible" && donor.status === "active") ||
      (filterStatus === "pending" && donor.status === "pending") ||
      (filterStatus === "ineligible" && donor.status === "inactive");

    const matchesBloodType =
      filterBloodType === "all" || donor.bloodType === filterBloodType;

    return matchesSearch && matchesStatus && matchesBloodType;
  });

  const paginatedDonorsList = filteredDonors.slice((donorsPage - 1) * itemsPerPage, donorsPage * itemsPerPage);
  const donorsListTotalPages = Math.ceil(filteredDonors.length / itemsPerPage);

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
          <div className="w-8 h-8 bg-[hsl(0,80%,50%)] rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
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
    <div className="min-h-screen bg-white dark:bg-background">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8 border-b-2 border-[hsl(0,80%,50%)] pb-6">
          <div>
            <h1 className="h2-brutal text-[hsl(0,80%,50%)] mb-2 select-none">
              ADMIN DASHBOARD
            </h1>
            <p className="text-sm md:text-base lg:text-lg text-muted-foreground">
              Manage blood donations, drives, and community partnerships
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button corners="crisp" onClick={() => setIsDriveDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Blood Drive
            </Button>
            <Button
              variant="outline"
              corners="crisp"
              onClick={() => {
                const now = new Date().toISOString().split("T")[0];

                // Section 1: Platform Summary
                const summary = [
                  ["DROP OF HOPE — PLATFORM REPORT", now],
                  [],
                  ["PLATFORM SUMMARY"],
                  ["Metric", "Value"],
                  ["Total Donors", analyticsData.totalDonors],
                  ["Active Donors", analyticsData.activeDonors],
                  ["Total Donations", analyticsData.totalDonations],
                  ["Lives Impacted", analyticsData.livesImpacted],
                  ["Total Blood Drives", analyticsData.bloodDrives],
                  ["Active Blood Drives", analyticsData.activeDrives],
                  ["Hospital Partnerships", analyticsData.partnerships],
                  ["Donations This Month", analyticsData.donationsThisMonth],
                  ["Pending Appointments", analyticsData.upcomingAppointments],
                  [
                    "Open Blood Requests",
                    bloodRequests.filter((r: any) => r.status === "pending")
                      .length,
                  ],
                ];

                // Section 2: Top Donors
                const donorSection = [
                  [],
                  ["TOP DONORS LEADERBOARD"],
                  [
                    "Rank",
                    "Name",
                    "Blood Type",
                    "City",
                    "Email",
                    "Points",
                    "Level",
                    "Status",
                    "Last Donation",
                  ],
                  ...leaderboardDonors.map((d, i) => [
                    i + 1,
                    d.name,
                    d.bloodType,
                    d.city || "",
                    d.email || "",
                    d.points,
                    d.level,
                    d.status,
                    d.lastDonation ? d.lastDonation.split("T")[0] : "",
                  ]),
                ];

                // Section 3: Blood Drives
                const drivesSection = [
                  [],
                  ["BLOOD DRIVES"],
                  [
                    "Name",
                    "Location",
                    "Date",
                    "Capacity",
                    "Registered",
                    "Status",
                  ],
                  ...bloodDrives.map((d) => [
                    d.name,
                    d.location,
                    d.date || "",
                    d.capacity,
                    d.registered ?? 0,
                    d.status,
                  ]),
                ];

                // Section 4: Blood Requests
                const requestsSection = [
                  [],
                  ["BLOOD REQUESTS"],
                  [
                    "Hospital",
                    "Blood Type",
                    "Units Requested",
                    "Urgency",
                    "Status",
                    "Created",
                  ],
                  ...bloodRequests.map((r: any) => [
                    r.hospitals?.name || "Unknown",
                    r.blood_type,
                    r.units_requested,
                    r.urgency,
                    r.status,
                    r.created_at ? r.created_at.split("T")[0] : "",
                  ]),
                ];

                const allRows = [
                  ...summary,
                  ...donorSection,
                  ...drivesSection,
                  ...requestsSection,
                ];
                const csv = allRows.map((r) => r.join(",")).join("\n");
                const blob = new Blob([csv], { type: "text/csv" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `drop_of_hope_full_report_${now}.csv`;
                a.click();
                URL.revokeObjectURL(url);
                toast({
                  title: "Report Exported",
                  description: "Full platform report downloaded successfully.",
                });
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card
            variant="outline"
            className="border-2 border-[hsl(0,80%,50%)] rounded-none"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm uppercase tracking-wider font-medium">
                    Total Donors
                  </p>
                  <p className="text-3xl font-bold text-[hsl(0,80%,50%)]">
                    {analyticsData.totalDonors.toLocaleString()}
                  </p>
                  <p className="text-sm text-[hsl(120,71%,43%)]">
                    +{analyticsData.monthlyGrowth}% this month
                  </p>
                </div>
                <div className="w-12 h-12 bg-[hsl(0,80%,50%)] rounded-none flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            variant="outline"
            className="border-2 border-[hsl(0,80%,50%)] rounded-none"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm uppercase tracking-wider font-medium">
                    Total Donations
                  </p>
                  <p className="text-3xl font-bold text-[hsl(0,80%,50%)]">
                    {analyticsData.totalDonations.toLocaleString()}
                  </p>
                  <p className="text-sm text-[hsl(120,71%,43%)]">
                    {analyticsData.donationsThisMonth} this month
                  </p>
                </div>
                <div className="w-12 h-12 bg-[hsl(0,80%,50%)] rounded-none flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white fill-current" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            variant="outline"
            className="border-2 border-[hsl(0,80%,50%)] rounded-none"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm uppercase tracking-wider font-medium">
                    Active Drives
                  </p>
                  <p className="text-3xl font-bold text-[hsl(0,80%,50%)]">
                    {analyticsData.activeDrives}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {analyticsData.upcomingAppointments} appointments
                  </p>
                </div>
                <div className="w-12 h-12 bg-[hsl(0,80%,50%)] rounded-none flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            variant="outline"
            className="border-2 border-[hsl(0,80%,50%)] rounded-none"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm uppercase tracking-wider font-medium">
                    Lives Impacted
                  </p>
                  <p className="text-3xl font-bold text-[hsl(0,80%,50%)]">
                    {analyticsData.livesImpacted.toLocaleString()}
                  </p>
                  <p className="text-sm text-[hsl(120,71%,43%)]">
                    +{analyticsData.donationsThisMonth * 3} this month
                  </p>
                </div>
                <div className="w-12 h-12 bg-[hsl(0,80%,50%)] rounded-none flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex w-full overflow-x-auto border-b-2 border-[hsl(0,80%,50%)] bg-transparent rounded-none p-0 h-auto min-h-12">
            <TabsTrigger
              value="overview"
              className="rounded-none border-r border-border px-3 sm:px-4 md:px-5 py-2 md:py-3 text-xs sm:text-sm md:text-base whitespace-nowrap"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="appointments"
              className="rounded-none border-r border-border px-3 sm:px-4 md:px-5 py-2 md:py-3 text-xs sm:text-sm md:text-base whitespace-nowrap"
            >
              Appointments
            </TabsTrigger>
            <TabsTrigger
              value="blood-requests"
              className="rounded-none border-r border-border px-3 sm:px-4 md:px-5 py-2 md:py-3 text-xs sm:text-sm md:text-base whitespace-nowrap"
            >
              Requests
            </TabsTrigger>
            <TabsTrigger
              value="donors"
              className="rounded-none border-r border-border px-3 sm:px-4 md:px-5 py-2 md:py-3 text-xs sm:text-sm md:text-base whitespace-nowrap"
            >
              Donors
            </TabsTrigger>
            <TabsTrigger
              value="drives"
              className="rounded-none border-r border-border px-3 sm:px-4 md:px-5 py-2 md:py-3 text-xs sm:text-sm md:text-base whitespace-nowrap"
            >
              Drives
            </TabsTrigger>
            <TabsTrigger
              value="hospitals"
              className="rounded-none border-r border-border px-3 sm:px-4 md:px-5 py-2 md:py-3 text-xs sm:text-sm md:text-base whitespace-nowrap"
            >
              Hospitals
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="rounded-none px-3 sm:px-4 md:px-5 py-2 md:py-3 text-xs sm:text-sm md:text-base whitespace-nowrap"
            >
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity — real data from appointments */}
              <Card className="border-2 border-[hsl(0,80%,50%)] shadow-none rounded-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="w-5 h-5" />
                    <span>Recent Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {appointments.slice(0, 5).map((apt: any) => (
                      <div
                        key={apt.id}
                        className="flex items-center space-x-3 p-3 bg-[hsl(0,0%,98%)] dark:bg-card rounded-sm"
                      >
                        <div className="w-2 h-2 bg-[hsl(0,80%,50%)] rounded-full flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {apt.donors?.name || "Donor"} booked{" "}
                            {apt.drives?.name || "a drive"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {apt.appointment_date
                              ? format(
                                  new Date(apt.appointment_date),
                                  "MMM d, yyyy",
                                )
                              : "Upcoming"}{" "}
                            · {apt.status}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className="text-xs flex-shrink-0"
                        >
                          {apt.donors?.blood_type || "?"}
                        </Badge>
                      </div>
                    ))}
                    {bloodRequests.slice(0, 3).map((req: any) => (
                      <div
                        key={req.id}
                        className="flex items-center space-x-3 p-3 bg-warning/10 rounded-sm"
                      >
                        <div className="w-2 h-2 bg-warning rounded-full flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            Blood request · {req.blood_type} ·{" "}
                            {req.quantity_units} units
                          </p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {req.urgency} priority · {req.status}
                          </p>
                        </div>
                      </div>
                    ))}
                    {appointments.length === 0 &&
                      bloodRequests.length === 0 && (
                        <p className="text-muted-foreground text-sm text-center py-4">
                          No recent activity
                        </p>
                      )}
                  </div>
                </CardContent>
              </Card>

              {/* Urgent Requests */}
              <Card className="border-2 border-[hsl(0,80%,50%)] shadow-none rounded-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5" />
                    <span>Urgent Blood Requests</span>
                    <Badge className="ml-2 bg-destructive/10 text-destructive">
                      {
                        bloodRequests.filter(
                          (r: any) =>
                            r.urgency === "critical" || r.urgency === "high",
                        ).length
                      }
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {bloodRequests
                      .filter(
                        (r: any) =>
                          r.urgency === "critical" || r.urgency === "high",
                      )
                      .slice(0, 5)
                      .map((req: any) => (
                        <Alert key={req.id} className="border-destructive/30">
                          <AlertTriangle className="h-4 w-4 text-destructive" />
                          <AlertDescription>
                            <strong>{req.blood_type}</strong> —{" "}
                            {req.quantity_units} units needed.{" "}
                            <span className="capitalize text-muted-foreground">
                              {req.urgency} priority · {req.status}
                            </span>
                          </AlertDescription>
                        </Alert>
                      ))}
                    {bloodRequests.filter(
                      (r: any) =>
                        r.urgency === "critical" || r.urgency === "high",
                    ).length === 0 && (
                      <p className="text-muted-foreground text-sm text-center py-4">
                        No urgent requests right now
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Donors Leaderboard */}
            <Card className="border-2 border-[hsl(0,80%,50%)] shadow-none rounded-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  <span>Top Donors Leaderboard</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {paginatedLeaderboard.map((donor, index) => {
                    const rank = (leaderboardPage - 1) * itemsPerPage + index + 1;
                    return (
                      <div
                        key={donor.id}
                        className="flex items-center gap-4 p-3 rounded-sm hover:bg-muted/50 transition-colors"
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                            rank === 1
                              ? "bg-amber-400 text-white"
                              : rank === 2
                                ? "bg-slate-400 text-white"
                                : rank === 3
                                  ? "bg-orange-400 text-white"
                                  : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {rank}
                        </div>
                        <div className="w-10 h-10 bg-[hsl(0,80%,50%)] rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                          {donor.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{donor.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {donor.bloodType} · {donor.status}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-bold text-[hsl(0,80%,50%)]">
                            {donor.points}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            pts · Lv{donor.level}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <PaginationControls 
                    currentPage={leaderboardPage} 
                    totalPages={leaderboardTotalPages} 
                    onPageChange={setLeaderboardPage} 
                  />
                  {leaderboardDonors.length === 0 && (
                    <p className="text-muted-foreground text-center py-8">
                      No donor data yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
            {/* Announcement Management */}
            <Card className="border-2 border-[hsl(0,80%,50%)] shadow-none rounded-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="w-5 h-5 text-[hsl(0,80%,50%)]" />
                  <span>Announcement Banner</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="ann-msg">Message</Label>
                    <Input
                      id="ann-msg"
                      placeholder="e.g. Urgent blood drive this Saturday at City Hospital!"
                      value={announcementMsg}
                      onChange={(e) => setAnnouncementMsg(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ann-link">Link (optional)</Label>
                    <Input
                      id="ann-link"
                      placeholder="e.g. /drives"
                      value={announcementLink}
                      onChange={(e) => setAnnouncementLink(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <Button
                    disabled={!announcementMsg.trim() || announcementSaving}
                    onClick={async () => {
                      setAnnouncementSaving(true);
                      await supabase
                        .from("announcements")
                        .update({ is_active: false })
                        .eq("is_active", true);
                      await supabase.from("announcements").insert([
                        {
                          message: announcementMsg.trim(),
                          link: announcementLink.trim() || null,
                          is_active: true,
                        },
                      ]);
                      setAnnouncementSaving(false);
                      setAnnouncementMsg("");
                      setAnnouncementLink("");
                      toast({
                        title: "Announcement Published",
                        description: "Banner is now live on the homepage.",
                      });
                    }}
                    className="bg-[hsl(0,80%,50%)] hover:bg-[hsl(0,80%,50%)]/90 text-white"
                  >
                    {announcementSaving ? "Publishing..." : "Publish Banner"}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Publishing a new banner will automatically deactivate any
                    currently active announcement.
                  </p>
                </div>
              </CardContent>
            </Card>
            {/* Broadcast Notifications */}
            <Card className="border-2 border-[hsl(0,80%,50%)] shadow-none rounded-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Send className="w-5 h-5 text-[hsl(0,80%,50%)]" />
                    <span>Broadcast Notifications</span>
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsBroadcastDialogOpen(true)}
                    className="border-[hsl(0,80%,50%)]/20 text-[hsl(0,80%,50%)] hover:bg-[hsl(0,80%,50%)] hover:text-white"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Notification
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Send push notifications to all donors or filter by blood type.
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-sm bg-[hsl(0,80%,50%)]/5">
                    <p className="text-2xl font-bold text-[hsl(0,80%,50%)]">
                      {analyticsData.totalDonors}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Total Donors
                    </p>
                  </div>
                  <div className="p-4 border rounded-sm bg-orange-50">
                    <p className="text-2xl font-bold text-orange-600">
                      {
                        bloodRequests.filter((r: any) => r.status === "pending")
                          .length
                      }
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Pending Requests
                    </p>
                  </div>
                  <div className="p-4 border rounded-sm bg-blue-50">
                    <p className="text-2xl font-bold text-blue-600">
                      {analyticsData.upcomingAppointments}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Upcoming Appointments
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appointments Management Tab */}
          <TabsContent value="appointments" className="space-y-6 mt-6">
            <Card className="border-2 border-[hsl(0,80%,50%)] shadow-none rounded-sm">
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
                    {paginatedAppointments.map((appointment: any) => (
                      <div
                        key={appointment.id}
                        className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-[hsl(0,0%,98%)] dark:bg-card rounded-sm"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-[hsl(0,80%,50%)] rounded-full flex items-center justify-center text-white font-semibold">
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
                    <PaginationControls 
                      currentPage={appointmentsPage} 
                      totalPages={appointmentsTotalPages} 
                      onPageChange={setAppointmentsPage} 
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Blood Requests Tab */}
          <TabsContent value="blood-requests" className="space-y-6 mt-6">
            <Card className="border-2 border-[hsl(0,80%,50%)] shadow-none rounded-sm">
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
                    {paginatedRequests.map((request: any) => (
                      <div
                        key={request.id}
                        className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-orange-50 dark:bg-orange-900/20 rounded-sm border border-orange-200 dark:border-orange-800"
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
                    <PaginationControls 
                      currentPage={requestsPage} 
                      totalPages={requestsTotalPages} 
                      onPageChange={setRequestsPage} 
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Donors Management Tab */}
          <TabsContent value="donors" className="space-y-6 mt-6">
            {/* Search and Filter */}
            <Card className="border-2 border-[hsl(0,80%,50%)] shadow-none rounded-sm">
              <CardContent className="p-6">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search donors by name, email, or blood type..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="eligible">Eligible</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="ineligible">Ineligible</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={filterBloodType}
                    onValueChange={setFilterBloodType}
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="Blood Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Blood Types</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                    </SelectContent>
                  </Select>
                  {(filterBloodType !== "all" ||
                    filterStatus !== "all" ||
                    searchTerm) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSearchTerm("");
                        setFilterStatus("all");
                        setFilterBloodType("all");
                      }}
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Donors List */}
            <Card className="border-2 border-[hsl(0,80%,50%)] shadow-none rounded-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Donors</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const header =
                      "Name,Blood Type,Email,City,Donations,Status\n";
                    const rows = recentDonors
                      .map((d) =>
                        [
                          d.name,
                          d.bloodType,
                          d.email || "",
                          d.city || "",
                          d.donations,
                          d.status,
                        ].join(","),
                      )
                      .join("\n");
                    const blob = new Blob([header + rows], {
                      type: "text/csv",
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `donors_${new Date().toISOString().split("T")[0]}.csv`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="border-[hsl(0,80%,50%)]/20 text-[hsl(0,80%,50%)] hover:bg-[hsl(0,80%,50%)] hover:text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {paginatedDonorsList.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        No donors found matching your filters
                      </p>
                    </div>
                  ) : (
                    <>
                      {paginatedDonorsList.map((donor) => (
                        <div
                          key={donor.id}
                          className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-[hsl(0,0%,98%)] dark:bg-card rounded-sm"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-[hsl(0,80%,50%)] rounded-full flex items-center justify-center text-white font-semibold">
                              {donor.name
                                .split(" ")
                                .map((n: string) => n[0])
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
                      <PaginationControls 
                        currentPage={donorsPage} 
                        totalPages={donorsListTotalPages} 
                        onPageChange={setDonorsPage} 
                      />
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Blood Drives Tab */}
          <TabsContent value="drives" className="space-y-6 mt-6">
            {/* Blood Drive Calendar */}
            {(() => {
              const now = new Date();
              const year = now.getFullYear();
              const month = now.getMonth();
              const monthName = now.toLocaleString("default", {
                month: "long",
                year: "numeric",
              });
              const firstDay = new Date(year, month, 1).getDay();
              const daysInMonth = new Date(year, month + 1, 0).getDate();

              // Build set of days that have drives
              const driveDays = new Set<number>();
              bloodDrives.forEach((drive: any) => {
                if (drive.start_date) {
                  const d = new Date(drive.start_date);
                  if (d.getFullYear() === year && d.getMonth() === month) {
                    driveDays.add(d.getDate());
                  }
                }
              });

              const cells: (number | null)[] = [
                ...Array(firstDay).fill(null),
                ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
              ];
              // Pad to complete week rows
              while (cells.length % 7 !== 0) cells.push(null);

              return (
                <Card className="border-2 border-[hsl(0,80%,50%)] shadow-none rounded-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CalendarDays className="w-5 h-5 text-[hsl(0,80%,50%)]" />
                      <span>Blood Drive Calendar — {monthName}</span>
                      <Badge className="ml-2">
                        {driveDays.size} drive days
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground mb-2">
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                        (d) => (
                          <div key={d} className="font-semibold py-1">
                            {d}
                          </div>
                        ),
                      )}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {cells.map((day, idx) => {
                        const hasDrive = day !== null && driveDays.has(day);
                        const isToday = day === now.getDate();
                        return (
                          <div
                            key={idx}
                            className={`relative flex flex-col items-center justify-center h-10 rounded-sm text-sm transition-colors ${
                              day === null
                                ? ""
                                : hasDrive
                                  ? "bg-[hsl(0,80%,50%)]/10 border border-[hsl(0,80%,50%)]/30 font-semibold text-[hsl(0,80%,50%)] cursor-pointer hover:bg-[hsl(0,80%,50%)]/20"
                                  : isToday
                                    ? "bg-muted font-bold ring-1 ring-hope-red"
                                    : "hover:bg-muted/50"
                            }`}
                            title={
                              hasDrive
                                ? bloodDrives
                                    .filter((dr: any) => {
                                      if (!dr.start_date) return false;
                                      const d = new Date(dr.start_date);
                                      return (
                                        d.getFullYear() === year &&
                                        d.getMonth() === month &&
                                        d.getDate() === day
                                      );
                                    })
                                    .map((dr: any) => dr.name)
                                    .join(", ")
                                : undefined
                            }
                          >
                            {day}
                            {hasDrive && (
                              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[hsl(0,80%,50%)] rounded-full" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      Red days have scheduled blood drives. Hover a day to see
                      drive names.
                    </p>
                  </CardContent>
                </Card>
              );
            })()}

            <Card className="border-2 border-[hsl(0,80%,50%)] shadow-none rounded-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Blood Drives Management</CardTitle>
                  <Button
                    className="bg-[hsl(0,80%,50%)] hover:bg-[hsl(0,80%,50%)]/90 text-white"
                    onClick={() => setIsDriveDialogOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Drive
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {paginatedDrives.map((drive: any) => (
                    <div key={drive.id} className="p-4 border rounded-sm">
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
                          <Calendar className="w-4 h-4 text-[hsl(0,80%,50%)]" />
                          <span className="text-sm">
                            {format(new Date(drive.date), "MMM dd, yyyy")}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-[hsl(0,80%,50%)]" />
                          <span className="text-sm">{drive.location}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-[hsl(0,80%,50%)]" />
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
                                  : "bg-[hsl(0,80%,50%)]"
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
                  <PaginationControls 
                    currentPage={drivesPage} 
                    totalPages={drivesTotalPages} 
                    onPageChange={setDrivesPage} 
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Hospitals Tab */}
          <TabsContent value="hospitals" className="space-y-6 mt-6">
            <Card className="border-2 border-[hsl(0,80%,50%)] shadow-none rounded-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Hospital className="w-5 h-5" />
                    <span>Hospital Partnerships</span>
                  </CardTitle>
                  <Button
                    className="bg-[hsl(0,80%,50%)] hover:bg-[hsl(0,80%,50%)]/90 text-white"
                    onClick={() => setIsHospitalDialogOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Hospital
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {paginatedHospitals.map((hospital: any) => (
                    <div
                      key={hospital.id}
                      className="p-3 sm:p-4 border rounded-sm space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-base sm:text-lg truncate">
                            {hospital.name}
                          </h3>
                          <p className="text-xs sm:text-sm text-muted-foreground truncate">
                            {hospital.contact} • {hospital.email}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                          <Badge className={getUrgencyColor(hospital.urgency)}>
                            <span className="text-xs">
                              {hospital.urgency.toUpperCase()}
                            </span>
                          </Badge>
                          <Badge className={getStatusColor(hospital.status)}>
                            {getStatusIcon(hospital.status)}
                            <span className="ml-1 capitalize text-xs">
                              {hospital.status}
                            </span>
                          </Badge>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-2 border-t">
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-medium">
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
                        <div className="flex flex-wrap gap-1 sm:gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                          >
                            <Mail className="w-3 h-3 mr-1" />
                            Contact
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => {
                              setViewingHospital(hospital);
                              setIsHospitalDetailsOpen(true);
                            }}
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <PaginationControls 
                    currentPage={hospitalsPage} 
                    totalPages={hospitalsTotalPages} 
                    onPageChange={setHospitalsPage} 
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Donors by Blood Type */}
              <Card className="border-2 border-[hsl(0,80%,50%)] shadow-none rounded-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5" />
                    <span>Donors by Blood Type</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"]
                        .map((type) => ({
                          type,
                          count: analyticsData.bloodTypeStats[type] || 0,
                        }))
                        .concat(
                          Object.entries(analyticsData.bloodTypeStats)
                            .filter(
                              ([type]) =>
                                ![
                                  "O+",
                                  "O-",
                                  "A+",
                                  "A-",
                                  "B+",
                                  "B-",
                                  "AB+",
                                  "AB-",
                                ].includes(type),
                            )
                            .map(([type, count]) => ({ type, count })),
                        )}
                      margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.2)" />
                      <XAxis dataKey="type" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#111', 
                          border: '1px solid hsl(0, 80%, 50%)', 
                          borderRadius: '2px',
                          color: '#fff'
                        }}
                        itemStyle={{ color: '#fff' }}
                        labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                      />
                      <Bar
                        dataKey="count"
                        name="Donors"
                        fill="#e53e3e"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Blood Request Status Breakdown */}
              <Card className="border-2 border-[hsl(0,80%,50%)] shadow-none rounded-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="w-5 h-5" />
                    <span>Blood Request Status</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={[
                          {
                            name: "Pending",
                            value: bloodRequests.filter(
                              (r: any) => r.status === "pending",
                            ).length,
                          },
                          {
                            name: "Fulfilled",
                            value: bloodRequests.filter(
                              (r: any) => r.status === "fulfilled",
                            ).length,
                          },
                          {
                            name: "Cancelled",
                            value: bloodRequests.filter(
                              (r: any) => r.status === "cancelled",
                            ).length,
                          },
                        ].filter((d) => d.value > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        labelLine={false}
                      >
                        <Cell fill="#f59e0b" />
                        <Cell fill="#22c55e" />
                        <Cell fill="#ef4444" />
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#111', 
                          border: '1px solid hsl(0, 80%, 50%)', 
                          borderRadius: '2px',
                          color: '#fff'
                        }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Drive Capacity Overview */}
              <Card className="border-2 border-[hsl(0,80%,50%)] shadow-none rounded-sm col-span-full">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5" />
                    <span>Drive Capacity vs Registrations</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={bloodDrives
                        .filter((d: any) => d.status === "active")
                        .slice(0, 8)
                        .map((d: any) => ({
                          name:
                            d.name.length > 18
                              ? d.name.slice(0, 16) + "…"
                              : d.name,
                          Capacity: d.capacity,
                          Registered: d.registered,
                        }))}
                      margin={{ top: 5, right: 10, left: -20, bottom: 40 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.2)" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11 }}
                        angle={-30}
                        textAnchor="end"
                      />
                      <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#111', 
                          border: '1px solid hsl(0, 80%, 50%)', 
                          borderRadius: '2px',
                          color: '#fff'
                        }}
                        itemStyle={{ color: '#fff' }}
                        labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                      />
                      <Legend />
                      <Bar
                        dataKey="Capacity"
                        fill="#e2e8f0"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="Registered"
                        fill="#e53e3e"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
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
              className="bg-[hsl(0,80%,50%)] text-white hover:bg-[hsl(0,80%,50%)]/90 w-full mt-2"
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
              className="bg-[hsl(0,80%,50%)] text-white hover:bg-[hsl(0,80%,50%)]/90 w-full mt-2"
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
              <UserCheck className="w-5 h-5 text-[hsl(0,80%,50%)]" />
              Donor Profile
            </DialogTitle>
            <DialogDescription>
              Donor information and donation history
            </DialogDescription>
          </DialogHeader>
          {viewingDonor && (
            <div className="space-y-4 mt-2">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-[hsl(0,80%,50%)] rounded-full flex items-center justify-center text-white font-bold text-xl">
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
                <div className="p-3 bg-muted rounded-sm">
                  <p className="text-sm text-muted-foreground">Blood Type</p>
                  <p className="font-bold text-xl text-[hsl(0,80%,50%)]">
                    {viewingDonor.bloodType}
                  </p>
                </div>
                <div className="p-3 bg-muted rounded-sm">
                  <p className="text-sm text-muted-foreground">
                    Total Donations
                  </p>
                  <p className="font-bold text-xl">{viewingDonor.donations}</p>
                </div>
                <div className="p-3 bg-muted rounded-sm col-span-2">
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
                className="bg-[hsl(0,80%,50%)] text-white hover:bg-[hsl(0,80%,50%)]/90 w-full mt-2"
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
              <Hospital className="w-5 h-5 text-[hsl(0,80%,50%)]" />
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
                <div className="p-3 bg-muted rounded-sm">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Phone className="w-3 h-3" /> Contact
                  </p>
                  <p className="font-medium">{viewingHospital.contact}</p>
                </div>
                <div className="p-3 bg-muted rounded-sm">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Mail className="w-3 h-3" /> Email
                  </p>
                  <p className="font-medium text-sm break-all">
                    {viewingHospital.email}
                  </p>
                </div>
                <div className="p-3 bg-muted rounded-sm col-span-2">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Droplets className="w-3 h-3" /> Current Need
                  </p>
                  <p className="font-bold text-xl text-[hsl(0,80%,50%)]">
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

      {/* Broadcast Notification Dialog */}
      <Dialog
        open={isBroadcastDialogOpen}
        onOpenChange={setIsBroadcastDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-[hsl(0,80%,50%)]" />
              Broadcast Notification
            </DialogTitle>
            <DialogDescription>
              Send a notification to all donors or filter by blood type.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="broadcast-title">Title *</Label>
              <Input
                id="broadcast-title"
                placeholder="e.g. Urgent: Blood Donation Drive"
                value={broadcastForm.title}
                onChange={(e) =>
                  setBroadcastForm({ ...broadcastForm, title: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="broadcast-message">Message *</Label>
              <Textarea
                id="broadcast-message"
                placeholder="Enter notification message..."
                value={broadcastForm.message}
                onChange={(e) =>
                  setBroadcastForm({
                    ...broadcastForm,
                    message: e.target.value,
                  })
                }
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="broadcast-priority">Priority</Label>
                <Select
                  value={broadcastForm.priority}
                  onValueChange={(value) =>
                    setBroadcastForm({ ...broadcastForm, priority: value as "low" | "medium" | "high" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="broadcast-blood-type">Blood Type Filter</Label>
                <Select
                  value={broadcastForm.bloodTypeFilter || "all"}
                  onValueChange={(value) =>
                    setBroadcastForm({
                      ...broadcastForm,
                      bloodTypeFilter: value === "all" ? "" : value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All blood types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Blood Types</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="broadcast-url">Action URL (optional)</Label>
              <Input
                id="broadcast-url"
                placeholder="e.g. /drives"
                value={broadcastForm.actionUrl}
                onChange={(e) =>
                  setBroadcastForm({
                    ...broadcastForm,
                    actionUrl: e.target.value,
                  })
                }
              />
            </div>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                This will send a notification to{" "}
                {broadcastForm.bloodTypeFilter
                  ? `all donors with ${broadcastForm.bloodTypeFilter} blood type`
                  : "all registered donors"}
                . This action cannot be undone.
              </AlertDescription>
            </Alert>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsBroadcastDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-[hsl(0,80%,50%)] hover:bg-[hsl(0,80%,50%)]/90 text-white"
                disabled={
                  isSendingBroadcast ||
                  !broadcastForm.title ||
                  !broadcastForm.message
                }
                onClick={async () => {
                  setIsSendingBroadcast(true);
                  try {
                    const result =
                      await notificationService.broadcastToAllDonors(
                        broadcastForm.title,
                        broadcastForm.message,
                        broadcastForm.priority as "low" | "medium" | "high",
                        broadcastForm.actionUrl || undefined,
                        broadcastForm.bloodTypeFilter || undefined,
                      );

                    if (result.error) throw result.error;

                    if (result.notified === 0) {
                      toast({
                        title: "No Recipients",
                        description:
                          "No eligible donors found to send notification to.",
                        variant: "destructive",
                      });
                    } else {
                      toast({
                        title: "Notification Sent",
                        description: `Successfully sent to ${result.notified} donors.`,
                      });
                    }

                    setIsBroadcastDialogOpen(false);
                    setBroadcastForm({
                      title: "",
                      message: "",
                      priority: "medium",
                      bloodTypeFilter: "",
                      actionUrl: "",
                    });
                  } catch (error) {
                    console.error("Error sending broadcast:", error);
                    toast({
                      title: "Error",
                      description: "Failed to send notification.",
                      variant: "destructive",
                    });
                  } finally {
                    setIsSendingBroadcast(false);
                  }
                }}
              >
                {isSendingBroadcast ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Notification
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Sub-component for announcement management inside Admin Dashboard
export function AnnouncementManager() {
  const [message, setMessage] = React.useState("");
  const [link, setLink] = React.useState("");
  const [announcements, setAnnouncements] = React.useState<any[]>([]);
  const [saving, setSaving] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5)
      .then(({ data }) => setAnnouncements(data || []));
  }, []);

  const handleCreate = async () => {
    if (!message.trim()) return;
    setSaving(true);
    // Deactivate all others first
    await supabase
      .from("announcements")
      .update({ is_active: false })
      .eq("is_active", true);
    const { data, error } = await supabase
      .from("announcements")
      .insert([
        { message: message.trim(), link: link.trim() || null, is_active: true },
      ])
      .select()
      .single();
    setSaving(false);
    if (!error && data) {
      setAnnouncements((prev) => [data, ...prev]);
      setMessage("");
      setLink("");
      toast({
        title: "Announcement Published",
        description: "The banner is now live on the homepage.",
      });
    }
  };

  const handleToggle = async (id: string, current: boolean) => {
    await supabase
      .from("announcements")
      .update({ is_active: !current })
      .eq("id", id);
    setAnnouncements((prev) =>
      prev.map((a) => (a.id === id ? { ...a, is_active: !current } : a)),
    );
  };

  return null; // Rendered inline in AdminDashboard overview, see above
}
