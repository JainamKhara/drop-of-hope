import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  inventoryService,
  bloodRequestService,
  appointmentService,
  driveService,
  notificationService,
} from "@/lib/db-services";
import {
  Heart,
  ArrowLeft,
  Plus,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Package,
  Calendar,
  Clock,
  Users,
  Hospital,
  Activity,
  RefreshCw,
  Download,
  Send,
  CheckCircle,
  XCircle,
  LogOut,
  Eye,
  Edit,
  Ban,
  Droplets,
  Printer,
} from "lucide-react";
import { format, addDays } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useHybridAuth } from "@/contexts/HybridAuthContext";
import { useToast } from "@/hooks/use-toast";

interface BloodInventoryItem {
  type: string;
  units: number;
  low: number;
  critical: number;
  expiring: number;
  status: string;
}

interface BloodRequestItem {
  id: string;
  patientId: string;
  bloodType: string;
  units: number;
  urgency: string;
  requestedBy: string;
  department: string;
  status: string;
  requestDate: string;
  requiredBy: string;
  notes: string;
}

export default function HospitalPortal() {
  const { hospitalProfile, supabaseSignOut, loading } = useHybridAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("inventory");
  const [dataLoading, setDataLoading] = useState(true);

  // Database state
  const [bloodInventory, setBloodInventory] = useState<BloodInventoryItem[]>(
    [],
  );
  const [bloodRequests, setBloodRequests] = useState<BloodRequestItem[]>([]);
  const [donorAppointments, setDonorAppointments] = useState<any[]>([]);
  const [hospitalDrives, setHospitalDrives] = useState<any[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Edit/View request dialogs
  const [editingRequest, setEditingRequest] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [viewingRequest, setViewingRequest] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Inventory detail dialog
  const [viewingInventory, setViewingInventory] = useState<any>(null);
  const [isInventoryDialogOpen, setIsInventoryDialogOpen] = useState(false);

  const [newRequest, setNewRequest] = useState({
    bloodType: "",
    units: "",
    urgency: "",
    patientName: "",
    department: "",
    requiredBy: "",
    notes: "",
  });

  // Notification state
  const [isNotificationDialogOpen, setIsNotificationDialogOpen] =
    useState(false);
  const [isSendingNotification, setIsSendingNotification] = useState(false);
  const [notificationForm, setNotificationForm] = useState({
    bloodType: "",
    unitsNeeded: "",
    urgency: "high",
    patientInfo: "",
  });

  // Redirect if not authenticated as hospital
  useEffect(() => {
    if (!loading && !hospitalProfile) {
      navigate("/hospital/login");
    }
  }, [hospitalProfile, loading, navigate]);

  // Load data from database
  useEffect(() => {
    if (hospitalProfile?.id) {
      loadHospitalData();
    }
  }, [hospitalProfile]);

  const loadHospitalData = async () => {
    if (!hospitalProfile?.id) return;

    try {
      setDataLoading(true);

      const [
        inventoryResult,
        requestsResult,
        appointmentsResult,
        drivesResult,
      ] = await Promise.allSettled([
        inventoryService.getByHospital(hospitalProfile.id),
        bloodRequestService.getByHospital(hospitalProfile.id),
        appointmentService.getByHospital(hospitalProfile.id),
        driveService.getAll(),
      ]);

      // Process inventory data
      const inventoryData =
        inventoryResult.status === "fulfilled"
          ? inventoryResult.value.data
          : null;
      if (inventoryData) {
        const processedInventory: BloodInventoryItem[] = inventoryData.map(
          (item: any) => ({
            type: item.blood_type,
            units: item.units_available || 0,
            low: 15,
            critical: 8,
            expiring: 0, // Would need expiry tracking
            status:
              item.units_available <= 8
                ? "critical"
                : item.units_available <= 15
                  ? "low"
                  : "adequate",
          }),
        );
        setBloodInventory(processedInventory);
      } else {
        // Default empty inventory for all blood types
        const defaultInventory = [
          "O+",
          "O-",
          "A+",
          "A-",
          "B+",
          "B-",
          "AB+",
          "AB-",
        ].map((type) => ({
          type,
          units: 0,
          low: 15,
          critical: 8,
          expiring: 0,
          status: "critical",
        }));
        setBloodInventory(defaultInventory);
      }

      // Process requests data
      const requestsData =
        requestsResult.status === "fulfilled"
          ? requestsResult.value.data
          : null;
      if (requestsData) {
        const processedRequests: BloodRequestItem[] = requestsData.map(
          (req: any) => ({
            id: req.id,
            patientId: req.patient_id || "N/A",
            bloodType: req.blood_type,
            units: req.units_requested,
            urgency: req.urgency || "routine",
            requestedBy: req.requested_by || "Unknown",
            department: req.department || "General",
            status: req.status,
            requestDate: req.created_at,
            requiredBy: req.required_by || req.created_at,
            notes: req.notes || "",
          }),
        );
        setBloodRequests(processedRequests);
      }

      // Process appointments data
      const appointmentsData =
        appointmentsResult.status === "fulfilled"
          ? appointmentsResult.value.data
          : null;
      if (appointmentsData) {
        setDonorAppointments(appointmentsData);
      }

      // Process drives data (filter by this hospital)
      const drivesData =
        drivesResult.status === "fulfilled" ? drivesResult.value.data : null;
      if (drivesData) {
        const myDrives = drivesData.filter(
          (d: any) => d.hospital_id === hospitalProfile.id,
        );
        setHospitalDrives(myDrives);
      }
    } catch (error) {
      console.error("Error loading hospital data:", error);
    } finally {
      setDataLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabaseSignOut();
    navigate("/hospital/login");
  };

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

  if (!hospitalProfile) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "low":
        return "bg-warning/10 text-warning border-warning/20";
      case "adequate":
        return "bg-success/10 text-success border-success/20";
      default:
        return "bg-muted/10 text-muted-foreground border-muted/20";
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "emergency":
        return "bg-destructive/10 text-destructive";
      case "urgent":
        return "bg-warning/10 text-warning";
      case "routine":
        return "bg-success/10 text-success";
      default:
        return "bg-muted/10 text-muted-foreground";
    }
  };

  const getRequestStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
      case "fulfilled":
        return <CheckCircle className="w-4 h-4 text-success" />;
      case "pending":
        return <Clock className="w-4 h-4 text-warning" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-destructive" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const calculateInventoryLevel = (item: any) => {
    if (item.units <= item.critical) return "critical";
    if (item.units <= item.low) return "low";
    return "adequate";
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hospitalProfile?.id) {
      toast({
        title: "Error",
        description: "Hospital profile not found. Please login again.",
        variant: "destructive",
      });
      return;
    }

    if (!newRequest.bloodType || !newRequest.units || !newRequest.urgency) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await bloodRequestService.create({
        hospital_id: hospitalProfile.id,
        blood_type: newRequest.bloodType as any,
        quantity_units: parseInt(newRequest.units) || 1,
        urgency: newRequest.urgency as any,
        status: "pending",
        needed_by: newRequest.requiredBy || new Date().toISOString(),
        reason:
          [
            newRequest.patientName && `Patient: ${newRequest.patientName}`,
            newRequest.notes,
          ]
            .filter(Boolean)
            .join(". ") || undefined,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Request Submitted",
        description:
          "Your blood request has been sent to the admin for approval.",
      });

      // Reset form
      setNewRequest({
        bloodType: "",
        units: "",
        urgency: "",
        patientName: "",
        department: "",
        requiredBy: "",
        notes: "",
      });

      // Reload data to show new request
      loadHospitalData();

      // Close the dialog
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error submitting blood request:", error);
      toast({
        title: "Submission Failed",
        description:
          "There was an error submitting your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle editing a blood request
  const handleEditRequest = (request: BloodRequestItem) => {
    setEditingRequest({
      id: request.id,
      bloodType: request.bloodType,
      units: String(request.units),
      urgency: request.urgency,
      patientName: request.patientId !== "N/A" ? request.patientId : "",
      department: request.department,
      requiredBy: request.requiredBy,
      notes: request.notes,
    });
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRequest?.id) return;
    setIsSubmitting(true);
    try {
      const { error } = await bloodRequestService.updateStatus(
        editingRequest.id,
        editingRequest.urgency === "cancelled" ? "rejected" : "pending",
      );
      if (error) throw error;
      toast({
        title: "Request Updated",
        description: "Blood request has been updated.",
      });
      setIsEditDialogOpen(false);
      setEditingRequest(null);
      loadHospitalData();
    } catch (error) {
      console.error("Error updating request:", error);
      toast({
        title: "Update Failed",
        description: "Could not update the request.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancelling a blood request
  const handleCancelRequest = async (requestId: string) => {
    try {
      const { error } = await bloodRequestService.updateStatus(
        requestId,
        "rejected",
      );
      if (error) throw error;
      toast({
        title: "Request Cancelled",
        description: "The blood request has been cancelled.",
      });
      loadHospitalData();
    } catch (error) {
      console.error("Error cancelling request:", error);
      toast({
        title: "Error",
        description: "Failed to cancel request.",
        variant: "destructive",
      });
    }
  };

  // Handle sending urgent blood need notification
  const handleSendUrgentNotification = async () => {
    if (!notificationForm.bloodType || !notificationForm.unitsNeeded) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSendingNotification(true);
      const result = await notificationService.sendUrgentBloodNeed(
        hospitalProfile.id,
        hospitalProfile.name,
        notificationForm.bloodType,
        parseInt(notificationForm.unitsNeeded),
        notificationForm.urgency as "critical" | "high" | "medium",
        notificationForm.patientInfo,
      );

      if (result.error) throw result.error;

      if (result.notified === 0) {
        if (result.found === 0) {
          toast({
            title: "No Donors Found",
            description: `No donors with ${notificationForm.bloodType} blood type found in the system.`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "No Eligible Donors",
            description: `Found ${result.found} donors with ${notificationForm.bloodType} but none have registered accounts.`,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Notifications Sent",
          description: `Successfully sent urgent notification to ${result.notified} donors with ${notificationForm.bloodType} blood type.`,
        });
      }

      setIsNotificationDialogOpen(false);
      setNotificationForm({
        bloodType: "",
        unitsNeeded: "",
        urgency: "high",
        patientInfo: "",
      });
    } catch (error) {
      console.error("Error sending notification:", error);
      toast({
        title: "Error",
        description: "Failed to send notifications. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSendingNotification(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-background">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-6 sm:py-8 md:py-12">
        {/* Hospital Info Header */}
        <Card
          variant="outline"
          className="border-2 border-[hsl(0,80%,50%)] rounded-none mb-8"
        >
          <CardContent className="p-3 sm:p-4 md:p-6 lg:p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-[hsl(0,80%,50%)] rounded-none flex items-center justify-center">
                  <Hospital className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="h2-brutal text-[hsl(0,80%,50%)] select-none">
                    {hospitalProfile.name}
                  </h1>
                  <p className="text-muted-foreground">
                    {hospitalProfile.address}, {hospitalProfile.city},{" "}
                    {hospitalProfile.state}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge
                      variant="outline"
                      className="border-2 border-[hsl(120,71%,43%)] text-[hsl(120,71%,43%)] bg-transparent"
                    >
                      {hospitalProfile.is_verified
                        ? "Verified Partner"
                        : "Pending Verification"}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      ID: {hospitalProfile.id.slice(0, 8)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">{hospitalProfile.contact_person}</p>
                <p className="text-sm text-muted-foreground">
                  {hospitalProfile.email}
                </p>
                <p className="text-sm text-muted-foreground">
                  {hospitalProfile.phone}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-8">
          <Card className="border-2 border-[hsl(0,80%,50%)] shadow-none rounded-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Total Units</p>
                  <p className="text-3xl font-bold text-[hsl(0,80%,50%)]">
                    {bloodInventory.reduce((sum, item) => sum + item.units, 0)}
                  </p>
                </div>
                <Package className="w-8 h-8 text-[hsl(0,80%,50%)]" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-[hsl(0,80%,50%)] shadow-none rounded-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">
                    Critical Types
                  </p>
                  <p className="text-3xl font-bold text-destructive">
                    {
                      bloodInventory.filter(
                        (item) => calculateInventoryLevel(item) === "critical",
                      ).length
                    }
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-[hsl(0,80%,50%)] shadow-none rounded-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">
                    Pending Requests
                  </p>
                  <p className="text-3xl font-bold text-warning">
                    {
                      bloodRequests.filter((req) => req.status === "pending")
                        .length
                    }
                  </p>
                </div>
                <Clock className="w-8 h-8 text-warning" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-[hsl(0,80%,50%)] shadow-none rounded-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Expiring Soon</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {bloodInventory.reduce(
                      (sum, item) => sum + item.expiring,
                      0,
                    )}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Low Stock Alert */}
        {bloodInventory.some((item) => item.status === "critical") && (
          <Alert className="mb-6 border-destructive/60 bg-destructive/10">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive font-medium">
              <strong>Critical Stock Alert:</strong>{" "}
              {bloodInventory
                .filter((item) => item.status === "critical")
                .map((item) => item.type)
                .join(", ")}{" "}
              blood{" "}
              {bloodInventory.filter((i) => i.status === "critical").length ===
              1
                ? "type is"
                : "types are"}{" "}
              critically low ({"<"}8 units). Please request replenishment
              immediately.
            </AlertDescription>
          </Alert>
        )}

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex w-full overflow-x-auto border-b-2 border-[hsl(0,80%,50%)] bg-transparent rounded-none p-0 h-auto min-h-12">
            <TabsTrigger value="inventory" className="text-xs sm:text-sm md:text-base px-3 sm:px-4 md:px-5 py-2 md:py-3 whitespace-nowrap border-r border-border">Blood Inventory</TabsTrigger>
            <TabsTrigger value="appointments" className="text-xs sm:text-sm md:text-base px-3 sm:px-4 md:px-5 py-2 md:py-3 whitespace-nowrap border-r border-border">Appointments</TabsTrigger>
            <TabsTrigger value="requests" className="text-xs sm:text-sm md:text-base px-3 sm:px-4 md:px-5 py-2 md:py-3 whitespace-nowrap border-r border-border">Requests</TabsTrigger>
            <TabsTrigger value="drives" className="text-xs sm:text-sm md:text-base px-3 sm:px-4 md:px-5 py-2 md:py-3 whitespace-nowrap border-r border-border">Drives</TabsTrigger>
            <TabsTrigger value="notifications" className="text-xs sm:text-sm md:text-base px-3 sm:px-4 md:px-5 py-2 md:py-3 whitespace-nowrap border-r border-border">Notifications</TabsTrigger>
            <TabsTrigger value="analytics" className="text-xs sm:text-sm md:text-base px-3 sm:px-4 md:px-5 py-2 md:py-3 whitespace-nowrap">Analytics</TabsTrigger>
          </TabsList>

          {/* Donor Appointments Tab */}
          <TabsContent value="appointments" className="space-y-6 mt-6">
            <Card className="border-2 border-[hsl(0,80%,50%)] shadow-none rounded-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Donor Appointment Requests</span>
                  <Badge className="ml-2">
                    {donorAppointments.length} total
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {donorAppointments.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No appointment requests yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {donorAppointments.map((appointment: any) => (
                      <div
                        key={appointment.id}
                        className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-sm border border-blue-200 dark:border-blue-800"
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
                              {appointment.donors?.phone && (
                                <span>📞 {appointment.donors.phone}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-1 sm:gap-2 pt-2 sm:border-l-2 sm:pl-3">
                          <Badge
                            className={
                              appointment.status === "scheduled"
                                ? "bg-warning/10 text-warning"
                                : appointment.status === "completed"
                                  ? "bg-success/10 text-success"
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
                                    await appointmentService.approve(
                                      appointment.id,
                                    );
                                  if (!error) {
                                    toast({
                                      title: "Appointment Confirmed",
                                      description:
                                        "The donor appointment has been confirmed.",
                                    });
                                    loadHospitalData();
                                  }
                                }}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Confirm
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={async () => {
                                  const { error } =
                                    await appointmentService.cancel(
                                      appointment.id,
                                    );
                                  if (!error) {
                                    toast({
                                      title: "Appointment Cancelled",
                                      description:
                                        "The appointment has been cancelled.",
                                      variant: "destructive",
                                    });
                                    loadHospitalData();
                                  }
                                }}
                              >
                                <Ban className="w-4 h-4 mr-1" />
                                Cancel
                              </Button>
                            </>
                          )}
                          {appointment.status === "confirmed" && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={async () => {
                                const { error } =
                                  await appointmentService.cancel(
                                    appointment.id,
                                  );
                                if (!error) {
                                  toast({
                                    title: "Appointment Cancelled",
                                    description:
                                      "The appointment has been cancelled.",
                                    variant: "destructive",
                                  });
                                  loadHospitalData();
                                }
                              }}
                            >
                              <Ban className="w-4 h-4 mr-1" />
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Blood Inventory Tab */}
          <TabsContent value="inventory" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {bloodInventory.map((item) => (
                <Card key={item.type} className="border-2 border-[hsl(0,80%,50%)] shadow-none rounded-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-2xl font-bold">
                        {item.type}
                      </CardTitle>
                      <Badge
                        className={getStatusColor(
                          calculateInventoryLevel(item),
                        )}
                      >
                        {calculateInventoryLevel(item)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-muted-foreground">
                            Current Stock
                          </span>
                          <span className="text-lg font-bold">
                            {item.units} units
                          </span>
                        </div>
                        <Progress
                          value={(item.units / (item.low * 2)) * 100}
                          className="h-2"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Low:</span>
                          <span className="ml-1 font-medium">{item.low}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Critical:
                          </span>
                          <span className="ml-1 font-medium">
                            {item.critical}
                          </span>
                        </div>
                      </div>

                      {item.expiring > 0 && (
                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription className="text-xs">
                            {item.expiring} unit{item.expiring > 1 ? "s" : ""}{" "}
                            expiring within 3 days
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            setNewRequest({
                              ...newRequest,
                              bloodType: item.type,
                            });
                            setIsDialogOpen(true);
                          }}
                        >
                          <Droplets className="w-3 h-3 mr-1" />
                          Request
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            setViewingInventory(item);
                            setIsInventoryDialogOpen(true);
                          }}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Blood Requests Tab */}
          <TabsContent value="requests" className="space-y-6 mt-6">
            <Card className="border-2 border-[hsl(0,80%,50%)] shadow-none rounded-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Blood Requests</CardTitle>
                  <Button
                    className="bg-[hsl(0,80%,50%)] text-white hover:bg-[hsl(0,80%,50%)]/90"
                    onClick={() => setIsDialogOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Request
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bloodRequests.map((request) => (
                    <div key={request.id} className="p-4 border rounded-sm">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">
                            Request #{request.id}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Patient: {request.patientId} • {request.department}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getUrgencyColor(request.urgency)}>
                            {request.urgency.toUpperCase()}
                          </Badge>
                          <Badge
                            className={`${
                              request.status === "fulfilled"
                                ? "bg-success/10 text-success"
                                : request.status === "approved"
                                  ? "bg-blue-100 text-blue-800"
                                  : request.status === "pending"
                                    ? "bg-warning/10 text-warning"
                                    : "bg-destructive/10 text-destructive"
                            }`}
                          >
                            {getRequestStatusIcon(request.status)}
                            <span className="ml-1 capitalize">
                              {request.status}
                            </span>
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Blood Type
                          </p>
                          <p className="font-semibold text-lg">
                            {request.bloodType}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Units Needed
                          </p>
                          <p className="font-semibold">{request.units} units</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Requested By
                          </p>
                          <p className="font-semibold">{request.requestedBy}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Required By
                          </p>
                          <p className="font-semibold">
                            {format(
                              new Date(request.requiredBy),
                              "MMM dd, HH:mm",
                            )}
                          </p>
                        </div>
                      </div>

                      {request.notes && (
                        <div className="mb-3">
                          <p className="text-sm text-muted-foreground">
                            Notes:
                          </p>
                          <p className="text-sm">{request.notes}</p>
                        </div>
                      )}

                      <div className="flex justify-end space-x-2">
                        {request.status === "pending" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditRequest(request)}
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleCancelRequest(request.id)}
                            >
                              <Ban className="w-3 h-3 mr-1" />
                              Cancel
                            </Button>
                          </>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setViewingRequest(request);
                            setIsViewDialogOpen(true);
                          }}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View Details
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const win = window.open(
                              "",
                              "_blank",
                              "width=700,height=450",
                            );
                            if (win) {
                              win.document
                                .write(`<html><head><title>Blood Request Slip</title></head><body style="font-family:sans-serif;padding:24px">
                                <h2 style="color:#e74c3c">Drop of Hope — Blood Request Slip</h2>
                                <hr/>
                                <p><strong>Request ID:</strong> ${request.id}</p>
                                <p><strong>Blood Type:</strong> ${request.bloodType}</p>
                                <p><strong>Units:</strong> ${request.units}</p>
                                <p><strong>Urgency:</strong> ${request.urgency.toUpperCase()}</p>
                                <p><strong>Department:</strong> ${request.department}</p>
                                <p><strong>Requested By:</strong> ${request.requestedBy}</p>
                                <p><strong>Status:</strong> ${request.status}</p>
                                <p><strong>Notes:</strong> ${request.notes || "—"}</p>
                              </body></html>`);
                              win.document.close();
                              win.print();
                            }
                          }}
                        >
                          <Printer className="w-3 h-3 mr-1" />
                          Print
                        </Button>
                      </div>

                      {/* Request Status Tracker */}
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs text-muted-foreground mb-2">
                          Status Tracker
                        </p>
                        <div className="flex items-center gap-1">
                          {[
                            "pending",
                            "approved",
                            "processing",
                            "fulfilled",
                          ].map((step, idx, arr) => {
                            const order = arr.indexOf(request.status);
                            const stepIdx = idx;
                            const isDone = stepIdx <= order;
                            const isActive = step === request.status;
                            return (
                              <React.Fragment key={step}>
                                <div
                                  className={`flex flex-col items-center flex-1`}
                                >
                                  <div
                                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                      isDone
                                        ? "bg-[hsl(0,80%,50%)] text-white"
                                        : "bg-muted text-muted-foreground"
                                    }`}
                                  >
                                    {stepIdx + 1}
                                  </div>
                                  <span
                                    className={`text-xs mt-1 capitalize ${
                                      isActive
                                        ? "text-[hsl(0,80%,50%)] font-semibold"
                                        : "text-muted-foreground"
                                    }`}
                                  >
                                    {step}
                                  </span>
                                </div>
                                {idx < arr.length - 1 && (
                                  <div
                                    className={`flex-1 h-0.5 mb-4 ${
                                      stepIdx < order
                                        ? "bg-[hsl(0,80%,50%)]"
                                        : "bg-muted"
                                    }`}
                                  />
                                )}
                              </React.Fragment>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Blood Drives Tab */}
          <TabsContent value="drives" className="space-y-6 mt-6">
            <Card className="border-2 border-[hsl(0,80%,50%)] shadow-none rounded-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Blood Drives</span>
                  <Badge className="ml-2">{hospitalDrives.length} total</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {hospitalDrives.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No blood drives assigned to your hospital yet.
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Contact the admin to schedule a drive at your facility.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {hospitalDrives.map((drive: any) => (
                      <div key={drive.id} className="p-4 border rounded-sm">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{drive.name}</h3>
                          <Badge
                            className={
                              drive.is_active
                                ? "bg-success/10 text-success"
                                : "bg-muted"
                            }
                          >
                            {drive.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {drive.start_date
                              ? format(
                                  new Date(drive.start_date),
                                  "MMM dd, yyyy",
                                )
                              : "TBD"}
                          </div>
                          <div className="flex items-center gap-1">
                            <Activity className="w-4 h-4" />
                            {drive.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {drive.registered_count ?? 0} / {drive.capacity}{" "}
                            registered
                          </div>
                        </div>
                        <div className="mt-3">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 rounded-full bg-[hsl(0,80%,50%)]"
                              style={{
                                width: `${Math.min(((drive.registered_count ?? 0) / drive.capacity) * 100, 100)}%`,
                              }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {Math.round(
                              ((drive.registered_count ?? 0) / drive.capacity) *
                                100,
                            )}
                            % capacity filled
                          </p>
                        </div>
                        {/* Drive Attendance Report */}
                        <div className="mt-3 flex justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const rows = [
                                [
                                  "Drive",
                                  "Date",
                                  "Location",
                                  "Registered",
                                  "Capacity",
                                  "Status",
                                ],
                                [
                                  drive.name,
                                  drive.start_date
                                    ? format(
                                        new Date(drive.start_date),
                                        "MMM dd, yyyy",
                                      )
                                    : "TBD",
                                  drive.location,
                                  drive.registered_count ?? 0,
                                  drive.capacity,
                                  drive.is_active ? "Active" : "Inactive",
                                ],
                              ];
                              const csv = rows
                                .map((r) => r.join(","))
                                .join("\n");
                              const blob = new Blob([csv], {
                                type: "text/csv",
                              });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement("a");
                              a.href = url;
                              a.download = `drive_attendance_${drive.id}.csv`;
                              a.click();
                              URL.revokeObjectURL(url);
                            }}
                            className="border-[hsl(0,80%,50%)]/20 text-[hsl(0,80%,50%)] hover:bg-[hsl(0,80%,50%)] hover:text-white"
                          >
                            Attendance Report
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6 mt-6">
            <Card className="border-2 border-[hsl(0,80%,50%)] shadow-none rounded-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-[hsl(0,80%,50%)]" />
                    <span>Send Urgent Blood Need Alerts</span>
                  </CardTitle>
                  <Button
                    className="bg-[hsl(0,80%,50%)] text-white hover:bg-[hsl(0,80%,50%)]/90"
                    onClick={() => setIsNotificationDialogOpen(true)}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Alert
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Notify registered donors with specific blood types about
                  urgent blood needs.
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Sending urgent notifications will alert all donors with
                      the selected blood type in your area. Use this feature
                      responsibly for genuine emergencies only.
                    </AlertDescription>
                  </Alert>

                  {/* Recent Urgent Requests */}
                  <div>
                    <h3 className="font-medium mb-3">High Priority Requests</h3>
                    <div className="space-y-3">
                      {bloodRequests
                        .filter(
                          (r) =>
                            r.urgency === "critical" || r.urgency === "high",
                        )
                        .slice(0, 5)
                        .map((request) => (
                          <div
                            key={request.id}
                            className="flex items-center justify-between p-3 border rounded-sm bg-[hsl(0,80%,50%)]/5"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 bg-[hsl(0,80%,50%)]/10 rounded-full flex items-center justify-center">
                                <Droplets className="w-5 h-5 text-[hsl(0,80%,50%)]" />
                              </div>
                              <div>
                                <p className="font-medium">
                                  {request.bloodType} Blood Needed
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {request.units} units required
                                </p>
                              </div>
                            </div>
                            <Badge
                              className={
                                request.urgency === "critical"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-orange-100 text-orange-800"
                              }
                            >
                              {request.urgency.toUpperCase()}
                            </Badge>
                          </div>
                        ))}
                      {bloodRequests.filter(
                        (r) => r.urgency === "critical" || r.urgency === "high",
                      ).length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No high priority requests at the moment.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notification History */}
            <Card className="border-2 border-[hsl(0,80%,50%)] shadow-none rounded-sm">
              <CardHeader>
                <CardTitle>Notification Guidelines</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-sm">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className="bg-green-100 text-green-800">
                          Best Practice
                        </Badge>
                      </div>
                      <h4 className="font-medium">When to Send Alerts</h4>
                      <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                        <li>• Critical shortages of rare blood types</li>
                        <li>• Emergency surgeries requiring rare blood</li>
                        <li>• Natural disasters or mass casualty events</li>
                        <li>• Scheduled procedures with limited time</li>
                      </ul>
                    </div>
                    <div className="p-4 border rounded-sm">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className="bg-red-100 text-red-800">Avoid</Badge>
                      </div>
                      <h4 className="font-medium">When NOT to Send</h4>
                      <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                        <li>• Routine stock replenishment</li>
                        <li>• Minor shortages that can wait</li>
                        <li>• Regular scheduled procedures</li>
                        <li>• Non-urgent inventory updates</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Blood Inventory by Type */}
              <Card className="border-2 border-[hsl(0,80%,50%)] shadow-none rounded-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Package className="w-5 h-5" />
                    <span>Blood Inventory by Type</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={bloodInventory.map((item) => ({
                        type: item.type,
                        Units: item.units,
                        Low: item.low,
                      }))}
                      margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="type" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="Units"
                        fill="#e53e3e"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar dataKey="Low" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Request Status Breakdown */}
              <Card className="border-2 border-[hsl(0,80%,50%)] shadow-none rounded-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="w-5 h-5" />
                    <span>Request Status Breakdown</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          {
                            name: "Pending",
                            value: bloodRequests.filter(
                              (r) => r.status === "pending",
                            ).length,
                          },
                          {
                            name: "Fulfilled",
                            value: bloodRequests.filter(
                              (r) => r.status === "fulfilled",
                            ).length,
                          },
                          {
                            name: "Cancelled",
                            value: bloodRequests.filter(
                              (r) => r.status === "cancelled",
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
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card className="border-2 border-[hsl(0,80%,50%)] shadow-none rounded-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Reports</CardTitle>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export Report
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-20 flex flex-col">
                    <Calendar className="w-6 h-6 mb-2" />
                    Monthly Report
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col">
                    <Package className="w-6 h-6 mb-2" />
                    Inventory Report
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col">
                    <Activity className="w-6 h-6 mb-2" />
                    Usage Analysis
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* New Request Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[hsl(0,80%,50%)]">
              Submit New Blood Request
            </DialogTitle>
            <DialogDescription>
              Submit a request for blood products. All fields marked with * are
              required.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRequestSubmit} className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dialog-bloodType">Blood Type *</Label>
                <Select
                  value={newRequest.bloodType}
                  onValueChange={(value) =>
                    setNewRequest({ ...newRequest, bloodType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select blood type" />
                  </SelectTrigger>
                  <SelectContent>
                    {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map(
                      (type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="dialog-units">Units Required *</Label>
                <Input
                  id="dialog-units"
                  type="number"
                  min="1"
                  value={newRequest.units}
                  onChange={(e) =>
                    setNewRequest({
                      ...newRequest,
                      units: e.target.value,
                    })
                  }
                  placeholder="Number of units"
                />
              </div>

              <div>
                <Label htmlFor="dialog-urgency">Urgency Level *</Label>
                <Select
                  value={newRequest.urgency}
                  onValueChange={(value) =>
                    setNewRequest({ ...newRequest, urgency: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select urgency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low (Routine)</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High (Urgent)</SelectItem>
                    <SelectItem value="critical">
                      Critical (Emergency)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="dialog-patientName">Patient Name</Label>
                <Input
                  id="dialog-patientName"
                  value={newRequest.patientName}
                  onChange={(e) =>
                    setNewRequest({
                      ...newRequest,
                      patientName: e.target.value,
                    })
                  }
                  placeholder="Patient name (if applicable)"
                />
              </div>

              <div>
                <Label htmlFor="dialog-department">Department</Label>
                <Input
                  id="dialog-department"
                  value={newRequest.department}
                  onChange={(e) =>
                    setNewRequest({
                      ...newRequest,
                      department: e.target.value,
                    })
                  }
                  placeholder="e.g., Emergency, Surgery, ICU"
                />
              </div>

              <div>
                <Label htmlFor="dialog-requiredBy">Required By</Label>
                <Input
                  id="dialog-requiredBy"
                  type="datetime-local"
                  value={newRequest.requiredBy}
                  onChange={(e) =>
                    setNewRequest({
                      ...newRequest,
                      requiredBy: e.target.value,
                    })
                  }
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="dialog-notes">Additional Notes</Label>
                <Textarea
                  id="dialog-notes"
                  value={newRequest.notes}
                  onChange={(e) =>
                    setNewRequest({
                      ...newRequest,
                      notes: e.target.value,
                    })
                  }
                  placeholder="Patient condition, special requirements, etc."
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[hsl(0,80%,50%)] text-white hover:bg-[hsl(0,80%,50%)]/90"
                disabled={
                  isSubmitting ||
                  !newRequest.bloodType ||
                  !newRequest.units ||
                  !newRequest.urgency
                }
              >
                {isSubmitting ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Request Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
            <DialogDescription>Blood request information</DialogDescription>
          </DialogHeader>
          {viewingRequest && (
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Blood Type</p>
                  <p className="font-semibold text-lg">
                    {viewingRequest.bloodType}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Units Needed</p>
                  <p className="font-semibold">{viewingRequest.units} units</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Urgency</p>
                  <Badge className={getUrgencyColor(viewingRequest.urgency)}>
                    {viewingRequest.urgency.toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge
                    className={
                      viewingRequest.status === "fulfilled"
                        ? "bg-success/10 text-success"
                        : viewingRequest.status === "approved"
                          ? "bg-blue-100 text-blue-800"
                          : viewingRequest.status === "pending"
                            ? "bg-warning/10 text-warning"
                            : "bg-destructive/10 text-destructive"
                    }
                  >
                    {viewingRequest.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Patient</p>
                  <p className="font-medium">
                    {viewingRequest.patientId || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Department</p>
                  <p className="font-medium">
                    {viewingRequest.department || "General"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Requested By</p>
                  <p className="font-medium">
                    {viewingRequest.requestedBy || "Unknown"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Required By</p>
                  <p className="font-medium">
                    {format(
                      new Date(viewingRequest.requiredBy),
                      "MMM dd, yyyy HH:mm",
                    )}
                  </p>
                </div>
              </div>
              {viewingRequest.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="text-sm mt-1 p-3 bg-muted rounded-sm">
                    {viewingRequest.notes}
                  </p>
                </div>
              )}
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => setIsViewDialogOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Request Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Blood Request</DialogTitle>
            <DialogDescription>
              Modify the blood request details
            </DialogDescription>
          </DialogHeader>
          {editingRequest && (
            <form onSubmit={handleEditSubmit} className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Blood Type</Label>
                  <Select
                    value={editingRequest.bloodType}
                    onValueChange={(v) =>
                      setEditingRequest({ ...editingRequest, bloodType: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map(
                        (t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Units Required</Label>
                  <Input
                    type="number"
                    min="1"
                    value={editingRequest.units}
                    onChange={(e) =>
                      setEditingRequest({
                        ...editingRequest,
                        units: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Urgency Level</Label>
                  <Select
                    value={editingRequest.urgency}
                    onValueChange={(v) =>
                      setEditingRequest({ ...editingRequest, urgency: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Patient Name</Label>
                  <Input
                    value={editingRequest.patientName}
                    onChange={(e) =>
                      setEditingRequest({
                        ...editingRequest,
                        patientName: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea
                  value={editingRequest.notes}
                  onChange={(e) =>
                    setEditingRequest({
                      ...editingRequest,
                      notes: e.target.value,
                    })
                  }
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[hsl(0,80%,50%)] text-white hover:bg-[hsl(0,80%,50%)]/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Inventory Details Dialog */}
      <Dialog
        open={isInventoryDialogOpen}
        onOpenChange={setIsInventoryDialogOpen}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Droplets className="w-5 h-5 text-[hsl(0,80%,50%)]" />
              {viewingInventory?.type} Blood Inventory
            </DialogTitle>
            <DialogDescription>Current inventory details</DialogDescription>
          </DialogHeader>
          {viewingInventory && (
            <div className="space-y-4 mt-2">
              <div className="p-4 bg-muted rounded-sm text-center">
                <p className="text-4xl font-bold text-[hsl(0,80%,50%)]">
                  {viewingInventory.units}
                </p>
                <p className="text-sm text-muted-foreground">units available</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-warning/10 rounded-sm">
                  <p className="text-sm text-muted-foreground">Low Threshold</p>
                  <p className="font-semibold text-warning">
                    {viewingInventory.low} units
                  </p>
                </div>
                <div className="p-3 bg-destructive/10 rounded-sm">
                  <p className="text-sm text-muted-foreground">
                    Critical Threshold
                  </p>
                  <p className="font-semibold text-destructive">
                    {viewingInventory.critical} units
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Stock Level
                </p>
                <Progress
                  value={
                    (viewingInventory.units / (viewingInventory.low * 2)) * 100
                  }
                  className="h-3"
                />
                <Badge
                  className={`mt-2 ${getStatusColor(calculateInventoryLevel(viewingInventory))}`}
                >
                  {calculateInventoryLevel(viewingInventory)}
                </Badge>
              </div>
              {viewingInventory.expiring > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {viewingInventory.expiring} unit
                    {viewingInventory.expiring > 1 ? "s" : ""} expiring within 3
                    days
                  </AlertDescription>
                </Alert>
              )}
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsInventoryDialogOpen(false)}
                >
                  Close
                </Button>
                <Button
                  className="bg-[hsl(0,80%,50%)] text-white hover:bg-[hsl(0,80%,50%)]/90"
                  onClick={() => {
                    setIsInventoryDialogOpen(false);
                    setNewRequest({
                      ...newRequest,
                      bloodType: viewingInventory.type,
                    });
                    setIsDialogOpen(true);
                  }}
                >
                  <Droplets className="w-4 h-4 mr-2" />
                  Request More
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Send Urgent Notification Dialog */}
      <Dialog
        open={isNotificationDialogOpen}
        onOpenChange={setIsNotificationDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[hsl(0,80%,50%)]" />
              Send Urgent Blood Alert
            </DialogTitle>
            <DialogDescription>
              Alert donors with specific blood types about urgent blood needs.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="notif-blood-type">Blood Type *</Label>
              <Select
                value={notificationForm.bloodType}
                onValueChange={(value) =>
                  setNotificationForm({ ...notificationForm, bloodType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select blood type" />
                </SelectTrigger>
                <SelectContent>
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
            <div className="space-y-2">
              <Label htmlFor="notif-units">Units Needed *</Label>
              <Input
                id="notif-units"
                type="number"
                min="1"
                placeholder="e.g. 5"
                value={notificationForm.unitsNeeded}
                onChange={(e) =>
                  setNotificationForm({
                    ...notificationForm,
                    unitsNeeded: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notif-urgency">Urgency Level</Label>
              <Select
                value={notificationForm.urgency}
                onValueChange={(value) =>
                  setNotificationForm({ ...notificationForm, urgency: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notif-patient">Patient Info (Optional)</Label>
              <Input
                id="notif-patient"
                placeholder="e.g. Emergency surgery patient"
                value={notificationForm.patientInfo}
                onChange={(e) =>
                  setNotificationForm({
                    ...notificationForm,
                    patientInfo: e.target.value,
                  })
                }
              />
            </div>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                This will send a push notification to all{" "}
                {notificationForm.bloodType || "selected"} donors in your area.
                This action cannot be undone.
              </AlertDescription>
            </Alert>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsNotificationDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-[hsl(0,80%,50%)] text-white hover:bg-[hsl(0,80%,50%)]/90"
                disabled={
                  isSendingNotification ||
                  !notificationForm.bloodType ||
                  !notificationForm.unitsNeeded
                }
                onClick={handleSendUrgentNotification}
              >
                {isSendingNotification ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Alert
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
