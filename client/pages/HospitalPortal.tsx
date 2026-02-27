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
} from "lucide-react";
import { format, addDays } from "date-fns";
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

      const [inventoryResult, requestsResult, appointmentsResult] =
        await Promise.allSettled([
          inventoryService.getByHospital(hospitalProfile.id),
          bloodRequestService.getByHospital(hospitalProfile.id),
          appointmentService.getByHospital(hospitalProfile.id),
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
          <div className="w-8 h-8 bg-hope-red rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-hope-pink to-white dark:from-hope-coral dark:to-background">
      <div className="container mx-auto px-4 py-8">
        {/* Hospital Info Header */}
        <Card className="border-0 shadow-lg mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Hospital className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-hope-red">
                    {hospitalProfile.name}
                  </h1>
                  <p className="text-muted-foreground">
                    {hospitalProfile.address}, {hospitalProfile.city},{" "}
                    {hospitalProfile.state}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge
                      variant="outline"
                      className="border-success text-success"
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Total Units</p>
                  <p className="text-3xl font-bold text-hope-red">
                    {bloodInventory.reduce((sum, item) => sum + item.units, 0)}
                  </p>
                </div>
                <Package className="w-8 h-8 text-hope-red" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
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

          <Card className="border-0 shadow-lg">
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

          <Card className="border-0 shadow-lg">
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

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="inventory">Blood Inventory</TabsTrigger>
            <TabsTrigger value="appointments">Donor Appointments</TabsTrigger>
            <TabsTrigger value="requests">Blood Requests</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Donor Appointments Tab */}
          <TabsContent value="appointments" className="space-y-6 mt-6">
            <Card className="border-0 shadow-lg">
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
                        className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
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
                              {appointment.donors?.phone && (
                                <span>📞 {appointment.donors.phone}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
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
                <Card key={item.type} className="border-0 shadow-lg">
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
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Blood Requests</CardTitle>
                  <Button
                    className="bg-hope-red hover:bg-hope-red/90"
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
                    <div key={request.id} className="p-4 border rounded-lg">
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
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Usage Trends</CardTitle>
                </CardHeader>
                <CardContent className="h-64 flex items-center justify-center">
                  <div className="text-center">
                    <Activity className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Chart: Blood usage trends over time
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Department Usage</CardTitle>
                </CardHeader>
                <CardContent className="h-64 flex items-center justify-center">
                  <div className="text-center">
                    <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Chart: Blood usage by department
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-0 shadow-lg">
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
            <DialogTitle className="text-xl font-bold text-hope-red">
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
                className="bg-hope-red hover:bg-hope-red/90"
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
                  <p className="text-sm mt-1 p-3 bg-muted rounded-lg">
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
                  className="bg-hope-red hover:bg-hope-red/90"
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
              <Droplets className="w-5 h-5 text-hope-red" />
              {viewingInventory?.type} Blood Inventory
            </DialogTitle>
            <DialogDescription>Current inventory details</DialogDescription>
          </DialogHeader>
          {viewingInventory && (
            <div className="space-y-4 mt-2">
              <div className="p-4 bg-muted rounded-lg text-center">
                <p className="text-4xl font-bold text-hope-red">
                  {viewingInventory.units}
                </p>
                <p className="text-sm text-muted-foreground">units available</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-warning/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">Low Threshold</p>
                  <p className="font-semibold text-warning">
                    {viewingInventory.low} units
                  </p>
                </div>
                <div className="p-3 bg-destructive/10 rounded-lg">
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
                  className="bg-hope-red hover:bg-hope-red/90"
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
    </div>
  );
}
