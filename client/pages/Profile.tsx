import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useHybridAuth, DonorProfile } from "@/contexts/HybridAuthContext";
import { useUser } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Heart,
  ArrowLeft,
  User,
  Camera,
  Save,
  Shield,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Award,
  Activity,
  Download,
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { donationService } from "@/lib/db-services";

export default function Profile() {
  const { user } = useUser();
  const { donorProfile, updateDonorProfile } = useHybridAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("personal");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<DonorProfile>>({
    name: "",
    email: "",
    phone: "",
    blood_type: "",
    date_of_birth: "",
    address: "",
    city: "",
    state: "",
    postal_code: "",
    profile_pic_url: "",
    points: 0,
    level: 1,
    is_verified: false,
  });
  const [medicalData, setMedicalData] = useState({
    medications: [] as Array<{
      name: string;
      dosage: string;
      prescribedBy: string;
    }>,
    conditions: [] as Array<{
      condition: string;
      status: string;
      diagnosedDate: string;
    }>,
    allergies: [] as Array<string>,
    surgeries: [] as Array<string>,
    previousDonations: [] as Array<any>,
    notes: "",
  });
  const [donations, setDonations] = useState<any[]>([]);
  const [donationsLoading, setDonationsLoading] = useState(false);

  const bloodTypes = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"];
  const states = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
  ];

  useEffect(() => {
    if (!user) {
      navigate("/donor/login");
      return;
    }
    if (donorProfile) {
      setFormData(donorProfile);
      // Fetch real donations from DB
      if (donorProfile.id) {
        setDonationsLoading(true);
        donationService.getByDonor(donorProfile.id).then(({ data }) => {
          setDonations(data || []);
          setDonationsLoading(false);
        });
      }
    } else {
      // If no profile, set basic info from Clerk user with default values
      setFormData({
        name: user.fullName || "",
        email: user.primaryEmailAddress?.emailAddress || "",
        profile_pic_url: user.imageUrl || "",
        phone: "",
        blood_type: "",
        date_of_birth: "",
        address: "",
        city: "",
        state: "",
        postal_code: "",
        points: 0,
        level: 1,
        is_verified: false,
      });
    }
  }, [user, donorProfile, navigate]);

  const handleSave = async () => {
    if (!user) return;

    try {
      const result = await updateDonorProfile(formData);
      if (result.error) {
        toast({
          title: "Update Failed",
          description: "Failed to update profile. Please try again.",
          variant: "destructive",
        });
      } else {
        setIsEditing(false);
        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      console.error(error);
    }
  };

  const canDonate = () => {
    if (!formData.last_donation_date) return true;

    const lastDonationDate = new Date(formData.last_donation_date);
    const daysSinceLastDonation = Math.floor(
      (Date.now() - lastDonationDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    return daysSinceLastDonation >= 56; // 8 weeks
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[hsl(0,0%,6%)]">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header */}
          <Card className="border-2 border-[hsl(0,80%,50%)] rounded-sm mb-8">
            <CardContent className="p-8">
              <div className="flex items-start space-x-6">
                {/* Profile Picture */}
                <div className="relative">
                  <Avatar className="w-32 h-32">
                    <AvatarImage
                      src={user?.imageUrl || formData?.profile_pic_url}
                      alt={user?.fullName || formData?.name || "User"}
                    />
                    <AvatarFallback className="bg-[hsl(0,80%,50%)] text-white text-4xl font-bold">
                      {formData?.name
                        ? formData.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                        : user?.fullName
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("") || "U"}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button
                      size="sm"
                      className="absolute bottom-0 right-0 rounded-full w-10 h-10 p-0"
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {/* Profile Info */}
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-[hsl(0,80%,50%)] mb-2">
                    {formData?.name || user?.fullName || "User"}
                  </h1>
                  <p className="text-muted-foreground mb-4">
                    Blood Type: {formData?.blood_type || "Not Set"}
                  </p>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-[hsl(0,0%,98%)] dark:bg-[hsl(14,100%,50%)] rounded-sm">
                      <div className="text-2xl font-bold text-[hsl(0,80%,50%)]">
                        {formData?.level || 1}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Donor Level
                      </div>
                    </div>
                    <div className="text-center p-3 bg-[hsl(0,0%,98%)] dark:bg-[hsl(14,100%,50%)] rounded-sm">
                      <div className="text-2xl font-bold text-[hsl(0,80%,50%)]">
                        {formData?.points || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Points Earned
                      </div>
                    </div>
                    <div className="text-center p-3 bg-[hsl(0,0%,98%)] dark:bg-[hsl(14,100%,50%)] rounded-sm">
                      <div className="text-2xl font-bold text-[hsl(0,80%,50%)]">
                        {(formData?.level || 1) * 3}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Lives Saved
                      </div>
                    </div>
                    <div className="text-center p-3 bg-[hsl(0,0%,98%)] dark:bg-[hsl(14,100%,50%)] rounded-sm">
                      <Badge
                        className={
                          canDonate()
                            ? "bg-success text-white"
                            : "bg-warning text-white"
                        }
                      >
                        {canDonate() ? "Eligible" : "Not Yet Eligible"}
                      </Badge>
                      <div className="text-sm text-muted-foreground mt-1">
                        Donation Status
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="personal">Personal Info</TabsTrigger>
              <TabsTrigger value="medical">Medical History</TabsTrigger>
              <TabsTrigger value="donations">Donation History</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
            </TabsList>

            {/* Personal Information Tab */}
            <TabsContent value="personal" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Information */}
                <Card className="border-2 border-[hsl(0,80%,50%)] rounded-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="w-5 h-5" />
                      <span>Basic Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={formData?.name || ""}
                          disabled={!isEditing}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              name: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          value={formData?.email || ""}
                          disabled={!isEditing}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              email: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData?.email || ""}
                        disabled={!isEditing}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={formData?.phone || ""}
                        disabled={!isEditing}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="date_of_birth">Date of Birth</Label>
                        <Input
                          id="date_of_birth"
                          type="date"
                          value={formData?.date_of_birth || ""}
                          disabled={!isEditing}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              date_of_birth: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="blood_type">Blood Type</Label>
                        <Select
                          value={formData?.blood_type || ""}
                          onValueChange={(value) =>
                            setFormData({ ...formData, blood_type: value })
                          }
                          disabled={!isEditing}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {bloodTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Additional fields removed - not in DonorProfile interface */}
                  </CardContent>
                </Card>

                {/* Address Information */}
                <Card className="border-2 border-[hsl(0,80%,50%)] rounded-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MapPin className="w-5 h-5" />
                      <span>Address</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="address">Street Address</Label>
                      <Input
                        id="address"
                        value={formData?.address || ""}
                        disabled={!isEditing}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={formData?.city || ""}
                          disabled={!isEditing}
                          onChange={(e) =>
                            setFormData({ ...formData, city: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Select
                          value={formData?.state || ""}
                          onValueChange={(value) =>
                            setFormData({ ...formData, state: value })
                          }
                          disabled={!isEditing}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {states.map((state) => (
                              <SelectItem key={state} value={state}>
                                {state}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="postal_code">ZIP Code</Label>
                      <Input
                        id="postal_code"
                        value={formData?.postal_code || ""}
                        disabled={!isEditing}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            postal_code: e.target.value,
                          })
                        }
                      />
                    </div>

                    {/* Emergency Contact */}
                    <div className="pt-2 border-t border-border">
                      <Label className="text-base font-medium">
                        Emergency Contact
                      </Label>
                      <div className="grid grid-cols-2 gap-4 mt-3">
                        <div>
                          <Label htmlFor="ec_name" className="text-sm">
                            Contact Name
                          </Label>
                          <Input
                            id="ec_name"
                            placeholder="e.g. Jane Doe"
                            value={
                              (formData as any)?.emergency_contact_name || ""
                            }
                            disabled={!isEditing}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                emergency_contact_name: e.target.value,
                              } as any)
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="ec_phone" className="text-sm">
                            Contact Phone
                          </Label>
                          <Input
                            id="ec_phone"
                            placeholder="e.g. +91 98765 43210"
                            value={
                              (formData as any)?.emergency_contact_phone || ""
                            }
                            disabled={!isEditing}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                emergency_contact_phone: e.target.value,
                              } as any)
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Medical History Tab */}
            <TabsContent value="medical" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Current Health Status */}
                <Card className="border-2 border-[hsl(0,80%,50%)] rounded-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Activity className="w-5 h-5" />
                      <span>Current Health Status</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Alert>
                      <Shield className="h-4 w-4" />
                      <AlertDescription>
                        Your medical information is confidential and only used
                        to ensure safe donation eligibility.
                      </AlertDescription>
                    </Alert>

                    <div>
                      <Label className="text-base font-medium">
                        Current Medications
                      </Label>
                      <div className="mt-2 space-y-2">
                        {medicalData.medications.map((med, index) => (
                          <div
                            key={index}
                            className="p-3 bg-[hsl(0,0%,98%)] dark:bg-[hsl(14,100%,50%)] rounded-sm"
                          >
                            <p className="font-medium">{med.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {med.dosage} • Prescribed by {med.prescribedBy}
                            </p>
                          </div>
                        ))}
                        {medicalData.medications.length === 0 && (
                          <p className="text-muted-foreground">
                            No current medications
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label className="text-base font-medium">
                        Known Allergies
                      </Label>
                      <div className="mt-2">
                        {medicalData.allergies.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {medicalData.allergies.map((allergy, index) => (
                              <Badge key={index} variant="outline">
                                {allergy}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground">
                            No known allergies
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label className="text-base font-medium">
                        Medical Conditions
                      </Label>
                      <div className="mt-2 space-y-2">
                        {medicalData.conditions.map((condition, index) => (
                          <div
                            key={index}
                            className="p-3 bg-[hsl(0,0%,98%)] dark:bg-[hsl(14,100%,50%)] rounded-sm"
                          >
                            <p className="font-medium">{condition.condition}</p>
                            <p className="text-sm text-muted-foreground">
                              Status: {condition.status} • Diagnosed:{" "}
                              {format(
                                new Date(condition.diagnosedDate),
                                "MMM yyyy",
                              )}
                            </p>
                          </div>
                        ))}
                        {medicalData.conditions.length === 0 && (
                          <p className="text-muted-foreground">
                            No medical conditions reported
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Donation Eligibility */}
                <Card className="border-2 border-[hsl(0,80%,50%)] rounded-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Shield className="w-5 h-5" />
                      <span>Donation Eligibility</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-[hsl(0,0%,98%)] dark:bg-[hsl(14,100%,50%)] rounded-sm">
                      <div className="flex items-center space-x-3">
                        {canDonate() ? (
                          <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center">
                            <Heart className="w-4 h-4 text-white fill-current" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 bg-warning rounded-full flex items-center justify-center">
                            <Shield className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-[hsl(0,80%,50%)]">
                            {canDonate()
                              ? "Eligible to Donate"
                              : "Currently Ineligible"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Last donation:{" "}
                            {formData?.last_donation_date
                              ? format(
                                  new Date(formData.last_donation_date),
                                  "MMM dd, yyyy",
                                )
                              : "Never"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {!canDonate() && formData?.last_donation_date && (
                      <Alert>
                        <Calendar className="h-4 w-4" />
                        <AlertDescription>
                          You can donate again after{" "}
                          {format(
                            new Date(
                              new Date(formData.last_donation_date).getTime() +
                                56 * 24 * 60 * 60 * 1000,
                            ),
                            "MMM dd, yyyy",
                          )}
                          . The minimum wait time between donations is 8 weeks.
                        </AlertDescription>
                      </Alert>
                    )}

                    <div>
                      <Label className="text-base font-medium">
                        Additional Notes
                      </Label>
                      <Textarea
                        value={medicalData.notes}
                        disabled={!isEditing}
                        className="mt-2"
                        rows={4}
                        onChange={(e) =>
                          setMedicalData({
                            ...medicalData,
                            notes: e.target.value,
                          })
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Donation History Tab */}
            <TabsContent value="donations" className="space-y-6 mt-6">
              <Card className="border-2 border-[hsl(0,80%,50%)] rounded-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Donation History</CardTitle>
                    {donations.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const rows = [
                            [
                              "#",
                              "Date",
                              "Location",
                              "Blood Type",
                              "Status",
                              "Points",
                              "Quantity (ml)",
                            ],
                            ...donations.map((d, i) => [
                              i + 1,
                              d.donation_date
                                ? d.donation_date.split("T")[0]
                                : "",
                              d.drives?.name || d.hospitals?.name || "",
                              d.blood_type || "",
                              d.status || "",
                              d.points_earned || 0,
                              d.quantity_ml || "",
                            ]),
                          ];
                          const csv = rows.map((r) => r.join(",")).join("\n");
                          const blob = new Blob([csv], { type: "text/csv" });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = "donation_history.csv";
                          a.click();
                          URL.revokeObjectURL(url);
                        }}
                        className="border-[hsl(0,80%,50%)]/20 text-[hsl(0,80%,50%)] hover:bg-[hsl(0,80%,50%)] hover:text-white"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Export CSV
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {donationsLoading && (
                      <p className="text-muted-foreground text-center py-8">
                        Loading donation history...
                      </p>
                    )}
                    {!donationsLoading && donations.length === 0 && (
                      <div className="text-center py-12">
                        <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                        <p className="font-medium">No donations yet</p>
                        <p className="text-sm text-muted-foreground">
                          Your completed donations will appear here.
                        </p>
                      </div>
                    )}
                    {donations.map((donation, index) => (
                      <div
                        key={donation.id || index}
                        className="flex items-center justify-between p-4 bg-[hsl(0,0%,98%)] dark:bg-[hsl(14,100%,50%)] rounded-sm"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-[hsl(0,80%,50%)] rounded-full flex items-center justify-center flex-shrink-0">
                            <Heart className="w-5 h-5 text-white fill-current" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {donation.drives?.name ||
                                donation.hospitals?.name ||
                                "Donation"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {donation.donation_date
                                ? format(
                                    new Date(donation.donation_date),
                                    "EEEE, MMMM dd, yyyy",
                                  )
                                : "Date unknown"}
                            </p>
                            {donation.blood_type && (
                              <p className="text-xs text-muted-foreground">
                                Blood Type: {donation.blood_type}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge
                            className={`${
                              donation.status === "completed"
                                ? "bg-success/10 text-success"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {donation.status || "completed"}
                          </Badge>
                          {donation.points_earned != null && (
                            <p className="text-sm text-muted-foreground mt-1">
                              +{donation.points_earned} pts
                            </p>
                          )}
                          {donation.quantity_ml && (
                            <p className="text-xs text-muted-foreground">
                              {donation.quantity_ml} ml
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Achievements Tab */}
            <TabsContent value="achievements" className="space-y-6 mt-6">
              <Card className="border-2 border-[hsl(0,80%,50%)] rounded-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="w-5 h-5" />
                    <span>Achievements & Badges</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Achievement cards would go here */}
                    <div className="text-center p-6 bg-[hsl(0,0%,98%)] dark:bg-[hsl(14,100%,50%)] rounded-sm">
                      <div className="w-16 h-16 bg-[hsl(0,80%,50%)] rounded-full mx-auto mb-4 flex items-center justify-center">
                        <Award className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="font-semibold text-[hsl(0,80%,50%)]">
                        Hero Badge
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        10+ donations completed
                      </p>
                    </div>

                    <div className="text-center p-6 bg-[hsl(0,0%,98%)] dark:bg-[hsl(14,100%,50%)] rounded-sm">
                      <div className="w-16 h-16 bg-[hsl(0,80%,50%)] rounded-full mx-auto mb-4 flex items-center justify-center">
                        <Heart className="w-8 h-8 text-white fill-current" />
                      </div>
                      <h3 className="font-semibold text-[hsl(0,80%,50%)]">
                        Life Saver
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Saved 30+ lives
                      </p>
                    </div>

                    <div className="text-center p-6 border-2 border-dashed border-muted rounded-sm">
                      <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
                        <Award className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <h3 className="font-semibold text-muted-foreground">
                        Champion
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        5 more donations needed
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
