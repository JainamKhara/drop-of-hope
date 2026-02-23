import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
import {
  Heart,
  ArrowLeft,
  Send,
  AlertTriangle,
  Hospital,
  Droplets,
  User,
  Phone,
  RefreshCw,
  CheckCircle,
  MapPin,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useHybridAuth } from "@/contexts/HybridAuthContext";
import { bloodRequestService, hospitalService } from "@/lib/db-services";

export default function RequestBlood() {
  const { toast } = useToast();
  const { donorProfile, hospitalProfile, isSignedIn } = useHybridAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [hospitals, setHospitals] = useState<any[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    patientName: "",
    hospitalId: "",
    hospitalName: "",
    bloodType: "",
    units: "",
    urgency: "high",
    contact: "",
    address: "",
    notes: "",
  });

  // Load hospitals for dropdown
  useEffect(() => {
    const loadHospitals = async () => {
      const { data } = await hospitalService.getAll();
      if (data) {
        setHospitals(data);
      }
    };
    loadHospitals();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create blood request in database
      const { data, error } = await bloodRequestService.create({
        hospital_id: formData.hospitalId || undefined,
        blood_type: formData.bloodType as any,
        quantity_units: parseInt(formData.units) || 1,
        urgency: formData.urgency as any,
        status: "pending",
        reason:
          [
            formData.patientName && `Patient: ${formData.patientName}`,
            formData.contact && `Contact: ${formData.contact}`,
            formData.address && `Location: ${formData.address}`,
            formData.notes,
          ]
            .filter(Boolean)
            .join(". ") || undefined,
      });

      if (error) {
        throw error;
      }

      setSubmitted(true);
      toast({
        title: "Request Submitted Successfully!",
        description:
          "Your blood request has been broadcasted to available donors and hospitals.",
      });
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

  // Success state after submission
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-hope-pink to-white dark:from-hope-coral dark:to-background">
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-lg mx-auto text-center">
            <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-success" />
            </div>
            <h1 className="text-3xl font-bold text-hope-red mb-4">
              Request Submitted!
            </h1>
            <p className="text-muted-foreground mb-8">
              Your emergency blood request has been submitted and is now visible
              to hospitals and donors in your area. You will be contacted
              shortly.
            </p>
            <div className="flex flex-col gap-3">
              <Button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({
                    patientName: "",
                    hospitalId: "",
                    hospitalName: "",
                    bloodType: "",
                    units: "",
                    urgency: "urgent",
                    contact: "",
                    address: "",
                    notes: "",
                  });
                }}
                className="bg-hope-red hover:bg-hope-red/90"
              >
                Submit Another Request
              </Button>
              <Button variant="outline" onClick={() => navigate("/")}>
                Return to Home
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-hope-pink to-white dark:from-hope-coral dark:to-background">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-hope-red mb-2">
              Emergency Blood Request
            </h1>
            <p className="text-muted-foreground">
              Fill out the form below to request blood. Your request will be
              immediately visible to hospitals and donors in your area.
            </p>
          </div>

          <Alert className="mb-8 border-hope-red bg-hope-red/5 text-hope-red">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              For extreme emergencies, please contact your local emergency
              services or visit the nearest hospital emergency room directly.
            </AlertDescription>
          </Alert>

          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Droplets className="w-6 h-6 text-hope-red" />
                Request Details
              </CardTitle>
              <CardDescription>
                All fields marked with * are required.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="patientName">Patient Full Name *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="patientName"
                        placeholder="Enter patient name"
                        className="pl-10"
                        value={formData.patientName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            patientName: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hospital">Hospital *</Label>
                    <Select
                      value={formData.hospitalId}
                      onValueChange={(value) => {
                        const hospital = hospitals.find((h) => h.id === value);
                        setFormData({
                          ...formData,
                          hospitalId: value,
                          hospitalName: hospital?.name || "",
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a hospital" />
                      </SelectTrigger>
                      <SelectContent>
                        {hospitals.map((hospital) => (
                          <SelectItem key={hospital.id} value={hospital.id}>
                            {hospital.name}
                          </SelectItem>
                        ))}
                        <SelectItem value="other">
                          Other (Enter manually)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {formData.hospitalId === "other" && (
                  <div className="space-y-2">
                    <Label htmlFor="hospitalName">Hospital Name *</Label>
                    <div className="relative">
                      <Hospital className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="hospitalName"
                        placeholder="Enter hospital name"
                        className="pl-10"
                        value={formData.hospitalName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            hospitalName: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bloodType">Required Blood Type *</Label>
                    <Select
                      value={formData.bloodType}
                      onValueChange={(value) =>
                        setFormData({ ...formData, bloodType: value })
                      }
                      required
                    >
                      <SelectTrigger id="bloodType">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="units">Units Required *</Label>
                    <Input
                      id="units"
                      type="number"
                      min="1"
                      placeholder="1"
                      value={formData.units}
                      onChange={(e) =>
                        setFormData({ ...formData, units: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="urgency">Urgency Level *</Label>
                    <Select
                      value={formData.urgency}
                      onValueChange={(value) =>
                        setFormData({ ...formData, urgency: value })
                      }
                    >
                      <SelectTrigger id="urgency">
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact">Contact Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="contact"
                        placeholder="+1 (555) 000-0000"
                        className="pl-10"
                        value={formData.contact}
                        onChange={(e) =>
                          setFormData({ ...formData, contact: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Location / Address</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="address"
                        placeholder="City or address"
                        className="pl-10"
                        value={formData.address}
                        onChange={(e) =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Information / Reason</Label>
                  <Textarea
                    id="notes"
                    placeholder="Provide details about the emergency or any specific requirements..."
                    rows={4}
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-hope-red hover:bg-hope-red/90 text-white font-bold h-12 text-lg"
                  disabled={
                    isSubmitting || !formData.bloodType || !formData.patientName
                  }
                >
                  {isSubmitting ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-5 w-5" />
                  )}
                  {isSubmitting
                    ? "Submitting Request..."
                    : "Submit Blood Request"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

// Simple Alert Component (inline since shadcn alert might not be available or is separate)
function Alert({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex items-start gap-4 p-4 rounded-lg border ${className}`}
    >
      {children}
    </div>
  );
}

function AlertDescription({ children }: { children: React.ReactNode }) {
  return <div className="text-sm">{children}</div>;
}
