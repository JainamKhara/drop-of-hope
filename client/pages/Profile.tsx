import React, { useState } from "react";
import { Link } from "react-router-dom";
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
} from "lucide-react";
import { format } from "date-fns";

// Mock user profile data
const mockProfile = {
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@example.com",
  phone: "+1 (555) 123-4567",
  dateOfBirth: "1990-05-15",
  bloodType: "A+",
  gender: "male",
  weight: "180",
  height: "5'10\"",
  address: "123 Main St",
  city: "Downtown",
  state: "CA",
  zipCode: "12345",
  emergencyContactName: "Jane Doe",
  emergencyContactPhone: "+1 (555) 987-6543",
  emergencyContactRelation: "spouse",
  profilePicture: null,
  isEligible: true,
  lastDonation: "2024-11-20",
  totalDonations: 12,
  totalPoints: 1200,
  memberSince: "2022-01-15",
};

// Mock medical history
const mockMedicalHistory = {
  medications: [
    { name: "Multivitamin", dosage: "Daily", prescribedBy: "Dr. Smith" },
  ],
  conditions: [
    {
      condition: "Seasonal Allergies",
      status: "Controlled",
      diagnosedDate: "2020-03-15",
    },
  ],
  allergies: ["Pollen"],
  surgeries: [],
  previousDonations: [
    {
      date: "2024-11-20",
      location: "Red Cross Center",
      result: "Successful",
      points: 100,
    },
    {
      date: "2024-09-15",
      location: "City Hospital",
      result: "Successful",
      points: 100,
    },
    {
      date: "2024-07-10",
      location: "Community Center",
      result: "Successful",
      points: 100,
    },
  ],
  notes:
    "Regular donor with no complications. Always meets eligibility requirements.",
};

export default function Profile() {
  const [activeTab, setActiveTab] = useState("personal");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(mockProfile);
  const [medicalData, setMedicalData] = useState(mockMedicalHistory);

  const bloodTypes = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"];
  const states = ["CA", "NY", "TX", "FL", "IL", "PA", "OH", "GA", "NC", "MI"];

  const handleSave = () => {
    // Here you would save to database
    setIsEditing(false);
    // Show success message
  };

  const canDonate = () => {
    const lastDonationDate = new Date(mockProfile.lastDonation);
    const daysSinceLastDonation = Math.floor(
      (Date.now() - lastDonationDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    return daysSinceLastDonation >= 56; // 8 weeks minimum between donations
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
              <Button variant="outline" asChild>
                <Link to="/dashboard">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
              {isEditing ? (
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button
                    className="bg-hope-red hover:bg-hope-red/90"
                    onClick={handleSave}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              ) : (
                <Button
                  className="bg-hope-red hover:bg-hope-red/90"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header */}
          <Card className="border-0 shadow-lg mb-8">
            <CardContent className="p-8">
              <div className="flex items-start space-x-6">
                {/* Profile Picture */}
                <div className="relative">
                  {formData.profilePicture ? (
                    <img
                      src={formData.profilePicture}
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover border-4 border-hope-red"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-hope-red rounded-full flex items-center justify-center text-white text-4xl font-bold">
                      {formData.firstName[0]}
                      {formData.lastName[0]}
                    </div>
                  )}
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
                  <h1 className="text-3xl font-bold text-hope-red mb-2">
                    {formData.firstName} {formData.lastName}
                  </h1>
                  <p className="text-muted-foreground mb-4">
                    Blood Type: {formData.bloodType}
                  </p>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-hope-pink dark:bg-hope-coral rounded-lg">
                      <div className="text-2xl font-bold text-hope-red">
                        {formData.totalDonations}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total Donations
                      </div>
                    </div>
                    <div className="text-center p-3 bg-hope-pink dark:bg-hope-coral rounded-lg">
                      <div className="text-2xl font-bold text-hope-red">
                        {formData.totalPoints}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Points Earned
                      </div>
                    </div>
                    <div className="text-center p-3 bg-hope-pink dark:bg-hope-coral rounded-lg">
                      <div className="text-2xl font-bold text-hope-red">
                        {formData.totalDonations * 3}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Lives Saved
                      </div>
                    </div>
                    <div className="text-center p-3 bg-hope-pink dark:bg-hope-coral rounded-lg">
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
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="w-5 h-5" />
                      <span>Basic Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          disabled={!isEditing}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              firstName: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          disabled={!isEditing}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              lastName: e.target.value,
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
                        value={formData.email}
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
                        value={formData.phone}
                        disabled={!isEditing}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="dateOfBirth">Date of Birth</Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={formData.dateOfBirth}
                          disabled={!isEditing}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              dateOfBirth: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="bloodType">Blood Type</Label>
                        <Select
                          value={formData.bloodType}
                          onValueChange={(value) =>
                            setFormData({ ...formData, bloodType: value })
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

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="gender">Gender</Label>
                        <Select
                          value={formData.gender}
                          onValueChange={(value) =>
                            setFormData({ ...formData, gender: value })
                          }
                          disabled={!isEditing}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                            <SelectItem value="prefer-not-to-say">
                              Prefer not to say
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="weight">Weight (lbs)</Label>
                        <Input
                          id="weight"
                          value={formData.weight}
                          disabled={!isEditing}
                          onChange={(e) =>
                            setFormData({ ...formData, weight: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="height">Height</Label>
                        <Input
                          id="height"
                          value={formData.height}
                          disabled={!isEditing}
                          onChange={(e) =>
                            setFormData({ ...formData, height: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Address Information */}
                <Card className="border-0 shadow-lg">
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
                        value={formData.address}
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
                          value={formData.city}
                          disabled={!isEditing}
                          onChange={(e) =>
                            setFormData({ ...formData, city: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Select
                          value={formData.state}
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
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input
                        id="zipCode"
                        value={formData.zipCode}
                        disabled={!isEditing}
                        onChange={(e) =>
                          setFormData({ ...formData, zipCode: e.target.value })
                        }
                      />
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-semibold mb-3 flex items-center">
                        <Phone className="w-4 h-4 mr-2" />
                        Emergency Contact
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="emergencyContactName">Name</Label>
                          <Input
                            id="emergencyContactName"
                            value={formData.emergencyContactName}
                            disabled={!isEditing}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                emergencyContactName: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="emergencyContactPhone">Phone</Label>
                            <Input
                              id="emergencyContactPhone"
                              value={formData.emergencyContactPhone}
                              disabled={!isEditing}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  emergencyContactPhone: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="emergencyContactRelation">
                              Relation
                            </Label>
                            <Select
                              value={formData.emergencyContactRelation}
                              onValueChange={(value) =>
                                setFormData({
                                  ...formData,
                                  emergencyContactRelation: value,
                                })
                              }
                              disabled={!isEditing}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="spouse">Spouse</SelectItem>
                                <SelectItem value="parent">Parent</SelectItem>
                                <SelectItem value="sibling">Sibling</SelectItem>
                                <SelectItem value="child">Child</SelectItem>
                                <SelectItem value="friend">Friend</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
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
                <Card className="border-0 shadow-lg">
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
                            className="p-3 bg-hope-pink dark:bg-hope-coral rounded-lg"
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
                            className="p-3 bg-hope-pink dark:bg-hope-coral rounded-lg"
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
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Shield className="w-5 h-5" />
                      <span>Donation Eligibility</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-hope-pink dark:bg-hope-coral rounded-lg">
                      <div className="flex items-center space-x-3">
                        {formData.isEligible ? (
                          <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center">
                            <Heart className="w-4 h-4 text-white fill-current" />
                          </div>
                        ) : (
                          <div className="w-8 h-8 bg-warning rounded-full flex items-center justify-center">
                            <Shield className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-hope-red">
                            {formData.isEligible
                              ? "Eligible to Donate"
                              : "Currently Ineligible"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Last donation:{" "}
                            {format(
                              new Date(formData.lastDonation),
                              "MMM dd, yyyy",
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    {!canDonate() && (
                      <Alert>
                        <Calendar className="h-4 w-4" />
                        <AlertDescription>
                          You can donate again after{" "}
                          {format(
                            new Date(
                              new Date(formData.lastDonation).getTime() +
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
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Donation History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {medicalData.previousDonations.map((donation, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-hope-pink dark:bg-hope-coral rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-hope-red rounded-full flex items-center justify-center">
                            <Heart className="w-5 h-5 text-white fill-current" />
                          </div>
                          <div>
                            <p className="font-medium">{donation.location}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(
                                new Date(donation.date),
                                "EEEE, MMMM dd, yyyy",
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-success/10 text-success">
                            {donation.result}
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-1">
                            +{donation.points} points
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Achievements Tab */}
            <TabsContent value="achievements" className="space-y-6 mt-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="w-5 h-5" />
                    <span>Achievements & Badges</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Achievement cards would go here */}
                    <div className="text-center p-6 bg-hope-pink dark:bg-hope-coral rounded-lg">
                      <div className="w-16 h-16 bg-hope-red rounded-full mx-auto mb-4 flex items-center justify-center">
                        <Award className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="font-semibold text-hope-red">
                        Hero Badge
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        10+ donations completed
                      </p>
                    </div>

                    <div className="text-center p-6 bg-hope-pink dark:bg-hope-coral rounded-lg">
                      <div className="w-16 h-16 bg-hope-red rounded-full mx-auto mb-4 flex items-center justify-center">
                        <Heart className="w-8 h-8 text-white fill-current" />
                      </div>
                      <h3 className="font-semibold text-hope-red">
                        Life Saver
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Saved 30+ lives
                      </p>
                    </div>

                    <div className="text-center p-6 border-2 border-dashed border-muted rounded-lg">
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
