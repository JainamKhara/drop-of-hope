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
import { PaginationControls } from "@/components/PaginationControls";
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
  Droplets,
  Star,
  TrendingUp,
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { donationService, redemptionService } from "@/lib/db-services";
import { ArrowUpDown, History } from "lucide-react";

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
  const [pointsHistory, setPointsHistory] = useState<any[]>([]);
  const [pointsLoading, setPointsLoading] = useState(false);
 
  const [donationsPage, setDonationsPage] = useState(1);
  const [pointsPage, setPointsPage] = useState(1);
  const itemsPerPage = 5;

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

  // Achievement definitions
  const achievementList = [
    {
      id: "first_drop",
      name: "First Drop",
      description: "Completed your first blood donation",
      icon: <Droplets className="w-8 h-8 text-white" />,
      requirement: (stats: any) => stats.totalDonations >= 1,
      progress: (stats: any) => Math.min(100, (stats.totalDonations / 1) * 100),
      threshold: "1 donation"
    },
    {
      id: "bronze_lifesaver",
      name: "Bronze Lifesaver",
      description: "Completed 3 blood donations",
      icon: <Award className="w-8 h-8 text-white" />,
      requirement: (stats: any) => stats.totalDonations >= 3,
      progress: (stats: any) => Math.min(100, (stats.totalDonations / 3) * 100),
      threshold: "3 donations"
    },
    {
      id: "silver_lifesaver",
      name: "Silver Lifesaver",
      description: "Completed 5 blood donations",
      icon: <Award className="w-8 h-8 text-white" />,
      requirement: (stats: any) => stats.totalDonations >= 5,
      progress: (stats: any) => Math.min(100, (stats.totalDonations / 5) * 100),
      threshold: "5 donations"
    },
    {
      id: "gold_lifesaver",
      name: "Gold Lifesaver",
      description: "Completed 10 blood donations",
      icon: <Award className="w-8 h-8 text-white" />,
      requirement: (stats: any) => stats.totalDonations >= 10,
      progress: (stats: any) => Math.min(100, (stats.totalDonations / 10) * 100),
      threshold: "10 donations"
    },
    {
      id: "platinum_lifesaver",
      name: "Platinum Donor",
      description: "Completed 20 blood donations",
      icon: <Star className="w-8 h-8 text-white" />,
      requirement: (stats: any) => stats.totalDonations >= 20,
      progress: (stats: any) => Math.min(100, (stats.totalDonations / 20) * 100),
      threshold: "20 donations"
    },
    {
      id: "centurion",
      name: "Centurion Donor",
      description: "Completed 50 blood donations",
      icon: <Shield className="w-8 h-8 text-white" />,
      requirement: (stats: any) => stats.totalDonations >= 50,
      progress: (stats: any) => Math.min(100, (stats.totalDonations / 50) * 100),
      threshold: "50 donations"
    },
    {
      id: "point_master",
      name: "Point Master",
      description: "Earned over 1000 points",
      icon: <TrendingUp className="w-8 h-8 text-white" />,
      requirement: (stats: any) => stats.points >= 1000,
      progress: (stats: any) => Math.min(100, (stats.points / 1000) * 100),
      threshold: "1000 points"
    },
    {
      id: "elite_donor",
      name: "Elite Donor",
      description: "Reached donor level 5",
      icon: <Shield className="w-8 h-8 text-white" />,
      requirement: (stats: any) => (stats.level || 1) >= 5,
      progress: (stats: any) => Math.min(100, ((stats.level || 1) / 5) * 100),
      threshold: "Level 5"
    }
  ];

  const [stats, setStats] = useState({
    totalDonations: 0,
    points: 0,
    level: 1,
    livesSaved: 0
  });
 
  const donationsTotalPages = Math.ceil(donations.length / itemsPerPage);
  const paginatedDonations = donations.slice(
    (donationsPage - 1) * itemsPerPage,
    donationsPage * itemsPerPage,
  );
 
  const pointsTotalPages = Math.ceil(pointsHistory.length / itemsPerPage);
  const paginatedPoints = pointsHistory.slice(
    (pointsPage - 1) * itemsPerPage,
    pointsPage * itemsPerPage,
  );

  const handleViewCertificate = (donation: any) => {
    const donorName = donorProfile?.name || "Valued Donor";
    const certWindow = window.open("", "_blank", "width=900,height=650");
    if (!certWindow) return;
    
    const dateStr = donation.donation_date 
      ? new Date(donation.donation_date).toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric"
        })
      : "Date unknown";

    certWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Donation Certificate – ${donorName}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,400&family=Inter:wght@400;500;600&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Inter', sans-serif; background: #f5f0eb; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 32px; }
          .cert { background: #fff; width: 800px; padding: 60px; border: 3px solid #c41e1e; position: relative; box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
          .cert::before { content: ''; position: absolute; inset: 12px; border: 1px solid #c41e1e44; pointer-events: none; }
          .corner { position: absolute; width: 40px; height: 40px; border-color: #c41e1e; border-style: solid; }
          .tl { top: 20px; left: 20px; border-width: 3px 0 0 3px; }
          .tr { top: 20px; right: 20px; border-width: 3px 3px 0 0; }
          .bl { bottom: 20px; left: 20px; border-width: 0 0 3px 3px; }
          .br { bottom: 20px; right: 20px; border-width: 0 3px 3px 0; }
          .logo { text-align: center; margin-bottom: 8px; }
          .logo-icon { font-size: 40px; }
          .logo-name { font-size: 13px; font-weight: 600; letter-spacing: 0.25em; color: #c41e1e; text-transform: uppercase; }
          .divider { width: 120px; height: 2px; background: linear-gradient(90deg, transparent, #c41e1e, transparent); margin: 20px auto; }
          .headline { font-family: 'Playfair Display', serif; font-size: 13px; font-weight: 700; letter-spacing: 0.3em; text-transform: uppercase; color: #888; text-align: center; margin-bottom: 8px; }
          .main-title { font-family: 'Playfair Display', serif; font-size: 42px; color: #1a1a1a; text-align: center; line-height: 1.2; margin-bottom: 24px; }
          .presented { text-align: center; color: #666; font-size: 14px; margin-bottom: 12px; }
          .donor-name { font-family: 'Playfair Display', serif; font-size: 36px; font-style: italic; color: #c41e1e; text-align: center; margin-bottom: 24px; border-bottom: 1px solid #eee; padding-bottom: 24px; }
          .body-text { text-align: center; color: #555; font-size: 14px; line-height: 1.8; margin-bottom: 32px; max-width: 540px; margin-left: auto; margin-right: auto; }
          .details { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 28px 0; background: #fef2f2; border-radius: 8px; padding: 20px 28px; }
          .detail { }
          .detail-label { font-size: 10px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: #c41e1e; margin-bottom: 4px; }
          .detail-val { font-size: 14px; color: #222; font-weight: 500; }
          .sig-row { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 40px; padding-top: 20px; }
          .sig-block { text-align: center; }
          .sig-line { width: 140px; height: 1px; background: #333; margin-bottom: 8px; }
          .sig-name { font-size: 12px; font-weight: 600; }
          .sig-title { font-size: 11px; color: #888; }
          .seal { width: 80px; height: 80px; border: 2px solid #c41e1e; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-direction: column; }
          .seal-text { font-size: 9px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #c41e1e; text-align: center; }
          .print-btn { display: block; margin: 24px auto 0; padding: 10px 28px; background: #c41e1e; color: white; border: none; border-radius: 6px; font-size: 14px; cursor: pointer; font-family: Inter, sans-serif; }
          @media print { .print-btn { display: none; } body { background: white; } }
        </style>
      </head>
      <body>
        <div class="cert">
          <div class="corner tl"></div><div class="corner tr"></div>
          <div class="corner bl"></div><div class="corner br"></div>
          <div class="logo">
            <img src="/drop_of_hope_logo.png" alt="Logo" style="width: 50px; height: 50px; object-fit: contain; margin-bottom: 4px;">
            <div class="logo-name">Drop of Hope</div>
          </div>
          <div class="divider"></div>
          <div class="headline">Certificate of Appreciation</div>
          <div class="main-title">Blood Donation<br>Certificate</div>
          <div class="presented">This is to proudly certify that</div>
          <div class="donor-name">${donorName}</div>
          <p class="body-text">
            has selflessly and courageously donated blood, potentially saving up to <strong>3 lives</strong>.
            Your generosity is a testament to the power of humanity and compassion.
          </p>
          <div class="details">
            <div class="detail"><div class="detail-label">Donation Type</div><div class="detail-val">Whole Blood</div></div>
            <div class="detail"><div class="detail-label">Date</div><div class="detail-val">${dateStr}</div></div>
            <div class="detail"><div class="detail-label">Location</div><div class="detail-val">${donation.drives?.name || donation.hospitals?.name || "Blood Center"}</div></div>
            <div class="detail"><div class="detail-label">Amount</div><div class="detail-val">${donation.quantity_ml || 450}ml</div></div>
          </div>
          <div class="sig-row">
            <div class="sig-block">
              <div class="sig-line"></div>
              <div class="sig-name">Drop of Hope</div>
              <div class="sig-title">Program Director</div>
            </div>
            <div class="seal">
              <div class="seal-text">Official<br>Seal</div>
              <img src="/drop_of_hope_logo.png" style="width: 24px; height: 24px; margin-top: 4px; object-fit: contain;">
            </div>
            <div class="sig-block">
              <div class="sig-line"></div>
              <div class="sig-name">${donorName}</div>
              <div class="sig-title">Donor</div>
            </div>
          </div>
        </div>
        <button class="print-btn" onclick="window.print()">🖨️ Print Certificate</button>
      </body>
      </html>
    `);
    certWindow.document.close();
    certWindow.focus();
  };

  useEffect(() => {
    if (!user) {
      navigate("/donor/login");
      return;
    }
    if (donorProfile) {
      setFormData(donorProfile);
      if (donorProfile.medical_history) {
        try {
          const medHistory = typeof donorProfile.medical_history === 'string' 
            ? JSON.parse(donorProfile.medical_history) 
            : donorProfile.medical_history;
          setMedicalData(medHistory);
        } catch (e) {
          console.error("Failed to parse medical history", e);
        }
      }
      // Fetch real donations from DB
      if (donorProfile.id) {
        setDonationsLoading(true);
        donationService.getByDonor(donorProfile.id).then(({ data }) => {
          const completedDonations = (data || []).filter((d: any) => d.status === "completed");
          setDonations(data || []);
          setStats({
            totalDonations: completedDonations.length,
            points: donorProfile.points || 0,
            level: donorProfile.level || 1,
            livesSaved: completedDonations.length * 3
          });
          setDonationsLoading(false);
        });

        // Fetch points history
        setPointsLoading(true);
        Promise.all([
          donationService.getByDonor(donorProfile.id),
          redemptionService.getByDonor(donorProfile.id)
        ]).then(([donationsRes, redemptionsRes]) => {
          const earned = (donationsRes.data || [])
            .filter((d: any) => d.status === "completed")
            .map((d: any) => ({
              id: `earned-${d.id}`,
              type: "earned",
              title: "Blood Donation",
              description: d.drives?.name || d.hospitals?.name || "Donation",
              points: d.points_earned || 100,
              date: d.donation_date
            }));
          
          const spent = (redemptionsRes.data || []).map((r: any) => ({
            id: `spent-${r.id}`,
            type: "spent",
            title: "Reward Redemption",
            description: r.item_name,
            points: -(r.points_spent || 0),
            date: r.created_at
          }));

          const combined = [...earned, ...spent].sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          
          setPointsHistory(combined);
          setPointsLoading(false);
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
      const result = await updateDonorProfile({
        ...formData,
        medical_history: medicalData
      });
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
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
                    <h1 className="text-3xl font-bold text-[hsl(0,80%,50%)]">
                      {formData?.name || user?.fullName || "User"}
                    </h1>
                    {isEditing ? (
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={handleSave}
                          className="bg-green-600 hover:bg-green-700 text-white rounded-none"
                        >
                          Save Changes
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setIsEditing(false);
                            if (donorProfile) setFormData(donorProfile);
                          }}
                          className="rounded-none border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => setIsEditing(true)}
                        className="bg-[hsl(0,80%,50%)] hover:bg-[hsl(0,80%,50%)]/90 text-white rounded-none"
                      >
                        Edit Profile
                      </Button>
                    )}
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Blood Type: {formData?.blood_type || "Not Set"}
                  </p>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-[hsl(0,0%,98%)] dark:bg-[hsl(0,0%,12%)] border dark:border-[hsl(0,80%,50%)]/30 rounded-sm">
                      <div className="text-2xl font-bold text-[hsl(0,80%,50%)]">
                        {formData?.level || 1}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Donor Level
                      </div>
                    </div>
                    <div className="text-center p-3 bg-[hsl(0,0%,98%)] dark:bg-[hsl(0,0%,12%)] border dark:border-[hsl(0,80%,50%)]/30 rounded-sm">
                      <div className="text-2xl font-bold text-[hsl(0,80%,50%)]">
                        {formData?.points || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Points Earned
                      </div>
                    </div>
                    <div className="text-center p-3 bg-[hsl(0,0%,98%)] dark:bg-[hsl(0,0%,12%)] border dark:border-[hsl(0,80%,50%)]/30 rounded-sm">
                      <div className="text-2xl font-bold text-[hsl(0,80%,50%)]">
                        {donations.length * 3}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Lives Saved
                      </div>
                    </div>
                    <div className="text-center p-3 bg-[hsl(0,0%,98%)] dark:bg-[hsl(0,0%,12%)] border dark:border-[hsl(0,80%,50%)]/30 rounded-sm">
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
              <TabsTrigger value="points">Points History</TabsTrigger>
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
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
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
                        <div>
                          <Label htmlFor="ec_relation" className="text-sm">
                            Contact Relation
                          </Label>
                          <Input
                            id="ec_relation"
                            placeholder="e.g. Spouse, Parent, Friend"
                            value={
                              (formData as any)?.emergency_contact_relation || ""
                            }
                            disabled={!isEditing}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                emergency_contact_relation: e.target.value,
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
                    {paginatedDonations.map((donation, index) => (
                      <div
                        key={donation.id || index}
                        className="flex items-center justify-between p-5 bg-[hsl(0,0%,98%)] dark:bg-[hsl(0,0%,10%)] border border-border rounded-sm hover:border-[hsl(0,80%,50%)]/50 transition-colors"
                      >
                        <div className="flex items-center space-x-5">
                          <div className="w-12 h-12 bg-[hsl(0,80%,50%)]/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <Heart className="w-6 h-6 text-[hsl(0,80%,50%)] fill-[hsl(0,80%,50%)]/20" />
                          </div>
                          <div>
                            <p className="font-bold text-foreground">
                              {donation.drives?.name ||
                                donation.hospitals?.name ||
                                "Donation"}
                            </p>
                            <div className="flex items-center space-x-2 mt-0.5">
                              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                              <p className="text-sm text-muted-foreground">
                                {donation.donation_date
                                  ? format(
                                      new Date(donation.donation_date),
                                      "EEEE, MMMM dd, yyyy",
                                    )
                                  : "Date unknown"}
                              </p>
                            </div>
                            <div className="flex items-center space-x-3 mt-2">
                              {donation.blood_type && (
                                <Badge variant="outline" className="text-[10px] py-0 h-4 border-[hsl(0,80%,50%)]/30 text-[hsl(0,80%,50%)]">
                                  Type {donation.blood_type}
                                </Badge>
                              )}
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {donation.drives?.location || "Hospital Site"}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex flex-col items-end space-y-2">
                          <div className="flex items-center space-x-2">
                            <Badge
                              className={
                                donation.status === "completed"
                                  ? "bg-success text-white"
                                  : "bg-muted text-muted-foreground"
                              }
                            >
                              {donation.status?.toUpperCase() || "COMPLETED"}
                            </Badge>
                            {donation.status === "completed" && (
                               <Button
                                 size="sm"
                                 variant="ghost"
                                 className="h-8 w-8 p-0"
                                 onClick={() => handleViewCertificate(donation)}
                                 title="View Certificate"
                               >
                                 <Award className="h-4 w-4 text-[hsl(0,80%,50%)]" />
                               </Button>
                            )}
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-sm font-bold text-[hsl(0,80%,50%)]">
                              +{donation.points_earned || 0} PTS
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {donation.quantity_ml || 450}ml donated
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}

                    {donationsTotalPages > 1 && (
                      <div className="mt-6 border-t pt-6">
                        <PaginationControls
                          currentPage={donationsPage}
                          totalPages={donationsTotalPages}
                          onPageChange={setDonationsPage}
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>            
            
            {/* Achievements Tab */}
            <TabsContent value="achievements" className="space-y-6 mt-6">
              <Card className="border-2 border-[hsl(0,80%,50%)] rounded-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="w-5 h-5 text-[hsl(0,80%,50%)]" />
                    <span>Achievements & Badges</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {achievementList.map((achievement) => {
                      const isEarned = achievement.requirement(stats);
                      const progress = achievement.progress(stats);
                      
                      return (
                        <div 
                          key={achievement.id}
                          className={`relative overflow-hidden p-6 rounded-sm transition-all duration-300 ${
                            isEarned 
                              ? "bg-[hsl(0,80%,50%)]/5 border-2 border-[hsl(0,80%,50%)]" 
                              : "bg-[hsl(0,0%,98%)] dark:bg-[hsl(0,0%,10%)] border-2 border-dashed border-muted"
                          }`}
                        >
                          <div className="flex flex-col items-center text-center">
                            <div className={`w-16 h-16 rounded-full mb-4 flex items-center justify-center ${
                              isEarned ? "bg-[hsl(0,80%,50%)] shadow-lg shadow-[hsl(0,80%,50%)]/20" : "bg-muted"
                            }`}>
                              {React.cloneElement(achievement.icon as React.ReactElement, {
                                className: `w-8 h-8 ${isEarned ? "text-white" : "text-muted-foreground"}`
                              })}
                            </div>
                            <h3 className={`font-bold mb-1 ${isEarned ? "text-[hsl(0,80%,50%)]" : "text-muted-foreground"}`}>
                              {achievement.name}
                            </h3>
                            <p className="text-xs text-muted-foreground mb-4">
                              {achievement.description}
                            </p>
                            
                            {!isEarned && (
                              <div className="w-full space-y-2">
                                <div className="flex justify-between text-[10px] text-muted-foreground">
                                  <span>Progress</span>
                                  <span>{Math.round(progress)}%</span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                                  <div 
                                    className="bg-[hsl(0,80%,50%)] h-full transition-all duration-500" 
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                                <p className="text-[10px] font-medium text-[hsl(0,80%,50%)]">
                                  Goal: {achievement.threshold}
                                </p>
                              </div>
                            )}
                            
                            {isEarned && (
                              <Badge className="bg-success text-white hover:bg-success pointer-events-none">
                                Unlocked
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Points History Tab */}
            <TabsContent value="points" className="space-y-6 mt-6">
              <Card className="border-2 border-[hsl(0,80%,50%)] rounded-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <History className="w-5 h-5 text-[hsl(0,80%,50%)]" />
                    <span>Points Transaction History</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pointsLoading && (
                      <p className="text-muted-foreground text-center py-8">
                        Loading points history...
                      </p>
                    )}
                    {!pointsLoading && pointsHistory.length === 0 && (
                      <div className="text-center py-12">
                        <ArrowUpDown className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                        <p className="font-medium">No transactions yet</p>
                        <p className="text-sm text-muted-foreground">
                          Earn points by donating or use them in the Rewards Store.
                        </p>
                      </div>
                    )}
                    {paginatedPoints.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 bg-[hsl(0,0%,98%)] dark:bg-[hsl(0,0%,10%)] border border-border rounded-sm"
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            item.type === "earned" ? "bg-success/10" : "bg-warning/10"
                          }`}>
                            <ArrowUpDown className={`w-5 h-5 ${
                              item.type === "earned" ? "text-success" : "text-warning"
                            }`} />
                          </div>
                          <div>
                            <p className="font-bold">{item.title}</p>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                            <p className="text-[10px] text-muted-foreground mt-1">
                              {format(new Date(item.date), "MMM dd, yyyy HH:mm")}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-lg font-bold ${
                            item.type === "earned" ? "text-success" : "text-warning"
                          }`}>
                            {item.points > 0 ? "+" : ""}{item.points} PTS
                          </span>
                        </div>
                      </div>
                    ))}

                    {pointsTotalPages > 1 && (
                      <div className="mt-6 border-t pt-6">
                        <PaginationControls
                          currentPage={pointsPage}
                          totalPages={pointsTotalPages}
                          onPageChange={setPointsPage}
                        />
                      </div>
                    )}
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
