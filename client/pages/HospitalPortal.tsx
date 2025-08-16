import React, { useState } from "react";
import { Link } from "react-router-dom";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
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
} from "lucide-react";
import { format, addDays } from "date-fns";

// Mock hospital data
const hospitalInfo = {
  name: "City General Hospital",
  id: "CGH-001",
  location: "456 Healthcare Ave, Medical District",
  contact: "Dr. Sarah Wilson",
  email: "bloodbank@citygeneral.org",
  phone: "+1 (555) 123-4567",
  verified: true,
};

// Mock blood inventory
const bloodInventory = [
  {
    type: "O+",
    units: 45,
    low: 20,
    critical: 10,
    expiring: 3,
    status: "adequate",
  },
  {
    type: "O-",
    units: 8,
    low: 15,
    critical: 8,
    expiring: 1,
    status: "critical",
  },
  {
    type: "A+",
    units: 22,
    low: 18,
    critical: 10,
    expiring: 2,
    status: "adequate",
  },
  { type: "A-", units: 12, low: 12, critical: 6, expiring: 0, status: "low" },
  {
    type: "B+",
    units: 18,
    low: 15,
    critical: 8,
    expiring: 1,
    status: "adequate",
  },
  {
    type: "B-",
    units: 5,
    low: 10,
    critical: 5,
    expiring: 0,
    status: "critical",
  },
  {
    type: "AB+",
    units: 14,
    low: 8,
    critical: 4,
    expiring: 1,
    status: "adequate",
  },
  {
    type: "AB-",
    units: 7,
    low: 6,
    critical: 3,
    expiring: 0,
    status: "adequate",
  },
];

// Mock blood requests
const bloodRequests = [
  {
    id: "REQ-001",
    patientId: "PT-12345",
    bloodType: "O-",
    units: 4,
    urgency: "emergency",
    requestedBy: "Dr. Johnson",
    department: "Emergency",
    status: "pending",
    requestDate: "2024-12-12T10:30:00",
    requiredBy: "2024-12-12T16:00:00",
    notes: "Motor vehicle accident, massive blood loss",
  },
  {
    id: "REQ-002",
    patientId: "PT-67890",
    bloodType: "A+",
    units: 2,
    urgency: "routine",
    requestedBy: "Dr. Smith",
    department: "Surgery",
    status: "approved",
    requestDate: "2024-12-11T14:20:00",
    requiredBy: "2024-12-13T08:00:00",
    notes: "Scheduled surgery preparation",
  },
  {
    id: "REQ-003",
    patientId: "PT-11111",
    bloodType: "B-",
    units: 3,
    urgency: "urgent",
    requestedBy: "Dr. Davis",
    department: "ICU",
    status: "fulfilled",
    requestDate: "2024-12-10T18:45:00",
    requiredBy: "2024-12-11T06:00:00",
    notes: "Post-operative complications",
  },
];

export default function HospitalPortal() {
  const [activeTab, setActiveTab] = useState("inventory");
  const [newRequest, setNewRequest] = useState({
    bloodType: "",
    units: "",
    urgency: "",
    department: "",
    requiredBy: "",
    notes: "",
  });

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

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would submit to your backend
    console.log("New blood request:", newRequest);
    // Reset form
    setNewRequest({
      bloodType: "",
      units: "",
      urgency: "",
      department: "",
      requiredBy: "",
      notes: "",
    });
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
              <Badge className="bg-blue-100 text-blue-800">Hospital</Badge>
            </Link>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" asChild>
                <Link to="/dashboard">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Exit Portal
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

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
                    {hospitalInfo.name}
                  </h1>
                  <p className="text-muted-foreground">
                    {hospitalInfo.location}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge
                      variant="outline"
                      className="border-success text-success"
                    >
                      {hospitalInfo.verified
                        ? "Verified Partner"
                        : "Pending Verification"}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      ID: {hospitalInfo.id}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">{hospitalInfo.contact}</p>
                <p className="text-sm text-muted-foreground">
                  {hospitalInfo.email}
                </p>
                <p className="text-sm text-muted-foreground">
                  {hospitalInfo.phone}
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
            <TabsTrigger value="requests">Blood Requests</TabsTrigger>
            <TabsTrigger value="new-request">New Request</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

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
                        <Button size="sm" variant="outline" className="flex-1">
                          Request
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
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
                  <Button className="bg-hope-red hover:bg-hope-red/90">
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
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              className="bg-hope-red hover:bg-hope-red/90"
                            >
                              Approve
                            </Button>
                          </>
                        )}
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* New Request Tab */}
          <TabsContent value="new-request" className="space-y-6 mt-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Submit New Blood Request</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRequestSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="bloodType">Blood Type *</Label>
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
                          {bloodInventory.map((item) => (
                            <SelectItem key={item.type} value={item.type}>
                              {item.type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="units">Units Required *</Label>
                      <Input
                        id="units"
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
                      <Label htmlFor="urgency">Urgency Level *</Label>
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
                          <SelectItem value="routine">Routine</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                          <SelectItem value="emergency">Emergency</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="department">Department *</Label>
                      <Input
                        id="department"
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

                    <div className="md:col-span-2">
                      <Label htmlFor="requiredBy">Required By *</Label>
                      <Input
                        id="requiredBy"
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
                      <Label htmlFor="notes">Additional Notes</Label>
                      <Textarea
                        id="notes"
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

                  <div className="flex justify-end space-x-3">
                    <Button type="button" variant="outline">
                      Save as Draft
                    </Button>
                    <Button
                      type="submit"
                      className="bg-hope-red hover:bg-hope-red/90"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Submit Request
                    </Button>
                  </div>
                </form>
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
    </div>
  );
}
