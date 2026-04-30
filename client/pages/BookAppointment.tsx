import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useHybridAuth } from "@/contexts/HybridAuthContext";
import { Drive } from "@/lib/supabase";
import {
  driveService,
  donorService,
} from "@/lib/db-services";
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
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
  Heart,
  ArrowLeft,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  Calendar as CalendarIcon,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import {
  format,
  addMinutes,
  parse,
  isAfter,
  isBefore,
  isSameDay,
} from "date-fns";

interface DriveWithDetails extends Drive {
  hospitals?: { name: string; city: string; state: string };
  profiles?: { name: string };
}

export default function BookAppointment() {
  const { driveId } = useParams<{ driveId: string }>();
  const { donorProfile, isSignedIn, updateDonorProfile } = useHybridAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [drive, setDrive] = useState<DriveWithDetails | null>(null);
  const [loading, setLoading] = useState(true);

  // Load drive from database
  useEffect(() => {
    const loadDrive = async () => {
      if (!driveId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await driveService.getById(driveId);

        if (error || !data) {
          console.error("Error loading drive:", error);
          toast({
            title: "Drive Not Found",
            description: "The requested blood drive could not be found.",
            variant: "destructive",
          });
          navigate("/drives");
          return;
        }

        setDrive(data as DriveWithDetails);
      } catch (error) {
        console.error("Error loading drive:", error);
        toast({
          title: "Error",
          description: "Failed to load the blood drive. Please try again.",
          variant: "destructive",
        });
        navigate("/drives");
      } finally {
        setLoading(false);
      }
    };

    loadDrive();
  }, [driveId, navigate, toast]);

  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);

  // Form data
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState("");
  const [donorInfo, setDonorInfo] = useState({
    name: donorProfile?.name || "",
    email: donorProfile?.email || "",
    phone: donorProfile?.phone || "",
    bloodType: donorProfile?.blood_type || "",
    dateOfBirth: donorProfile?.date_of_birth || "",
    address: donorProfile?.address || "",
    city: donorProfile?.city || "",
    state: donorProfile?.state || "",
    postalCode: donorProfile?.postal_code || "",
  });
  const [medicalInfo, setMedicalInfo] = useState({
    lastDonation: donorProfile?.last_donation_date || "",
    medications: "",
    allergies: "",
    medicalConditions: "",
    recentTravel: false,
    recentTattoo: false,
    recentIllness: false,
  });
  const [notes, setNotes] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const generateTimeSlots = () => {
    if (!drive) return [];

    // Parse times - handle both HH:mm and HH:mm:ss formats from the database
    const today = new Date();
    const startTimeStr = drive.start_time?.substring(0, 5) || "09:00";
    const endTimeStr = drive.end_time?.substring(0, 5) || "17:00";

    const startTime = parse(startTimeStr, "HH:mm", today);
    const endTime = parse(endTimeStr, "HH:mm", today);
    const slots: string[] = [];

    // Validate parsed times
    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      return [];
    }

    let currentTime = new Date(startTime);
    while (currentTime < endTime) {
      slots.push(format(currentTime, "HH:mm"));
      currentTime = addMinutes(currentTime, 30);

      // Safety check to prevent infinite loops
      if (slots.length > 48) break;
    }

    return slots;
  };

  const getAvailableDates = () => {
    if (!drive) return [];

    const startDate = new Date(drive.start_date);
    const endDate = new Date(drive.end_date);
    const dates = [];

    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  };

  const canSelectDate = (date: Date) => {
    // Allow any date from today onwards for frontend demo
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    // Only disable past dates
    return checkDate >= today;
  };

  const handleSubmit = async () => {
    // Validation
    if (!drive || !selectedDate || !selectedTime) {
      toast({
        title: "Missing Information",
        description: "Please select a date and time for your appointment.",
        variant: "destructive",
      });
      return;
    }

    if (!donorInfo.name || !donorInfo.email || !donorInfo.phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required personal information.",
        variant: "destructive",
      });
      return;
    }

    if (!agreedToTerms) {
      toast({
        title: "Terms Required",
        description: "Please agree to the terms and conditions.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      // Validate that the donor is signed in
      if (!donorProfile?.id) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to book an appointment.",
          variant: "destructive",
        });
        return;
      }

      // Update user profile if signed in and blood type changed (optional - no error if fails)
      if (
        donorProfile &&
        isSignedIn &&
        updateDonorProfile &&
        donorInfo.bloodType &&
        donorInfo.bloodType !== donorProfile?.blood_type
      ) {
        try {
          await updateDonorProfile({
            blood_type: donorInfo.bloodType as any,
          });
        } catch (profileError) {
          // Silently fail - profile update is optional
        }
      }

      // Save appointment to database via API (sends confirmation email)
      const appointmentDate = format(selectedDate, "yyyy-MM-dd");
      const appointmentTime = selectedTime;

      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          donor_id: donorProfile.id,
          drive_id: drive.id,
          appointment_date: appointmentDate,
          appointment_time: appointmentTime,
          status: "scheduled",
          notes: notes || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to book appointment");
      }

      const appointmentData = await response.json();

      // Award points to the donor for booking (50 points for booking)
      try {
        await donorService.addPoints(donorProfile.id, 50);
      } catch (pointsError) {
        // Silently fail - points award is optional
      }

      toast({
        title: "Appointment Booked!",
        description:
          "Your blood donation appointment has been successfully scheduled. You earned 50 points!",
      });

      // Small delay before navigation for better UX
      setTimeout(() => {
        navigate("/appointments");
      }, 500);
    } catch (error: any) {
      console.error("Error creating appointment:", error);
      toast({
        title: "Booking Failed",
        description:
          error?.message ||
          "Failed to book your appointment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-[hsl(0,80%,50%)] mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">
            Loading blood drive details...
          </p>
        </div>
      </div>
    );
  }

  if (!drive) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Drive Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The blood drive you're looking for could not be found.
          </p>
          <Button asChild>
            <Link to="/drives">Browse All Drives</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[hsl(0,0%,98%)] to-white dark:from-[hsl(14,100%,50%)] dark:to-background">
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Drive Info */}
          <Card className="mb-8 border-2 border-[hsl(0,80%,50%)] rounded-sm">
            <CardHeader>
              <CardTitle className="text-2xl text-[hsl(0,80%,50%)]">
                {drive.name}
              </CardTitle>
              <p className="text-muted-foreground">
                Organized by{" "}
                {drive.profiles?.name ||
                  drive.hospitals?.name ||
                  "Unknown Organizer"}
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-[hsl(0,80%,50%)] mt-1" />
                    <div>
                      <p className="font-medium">{drive.location}</p>
                      <p className="text-sm text-muted-foreground">
                        {drive.address}, {drive.city}, {drive.state}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="w-4 h-4 text-[hsl(0,80%,50%)]" />
                    <p>
                      {new Date(drive.start_date).toLocaleDateString()}
                      {drive.start_date !== drive.end_date &&
                        ` - ${new Date(drive.end_date).toLocaleDateString()}`}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-[hsl(0,80%,50%)]" />
                    <p>
                      {drive.start_time} - {drive.end_time}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {drive.blood_types_needed &&
                    drive.blood_types_needed.length > 0 && (
                      <div>
                        <p className="font-medium mb-2">Blood Types Needed:</p>
                        <div className="flex flex-wrap gap-2">
                          {drive.blood_types_needed.map((type) => (
                            <span
                              key={type}
                              className="px-2 py-1 bg-[hsl(0,80%,50%)] text-white text-sm rounded-sm"
                            >
                              {type}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                  {drive.description && (
                    <div>
                      <p className="font-medium mb-2">Description:</p>
                      <p className="text-sm text-muted-foreground">
                        {drive.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Multi-step Form */}
          <Card className="border-2 border-[hsl(0,80%,50%)] rounded-sm">
            <CardHeader>
              <CardTitle className="text-[hsl(0,80%,50%)]">
                Book Your Appointment - Step {step} of 3
              </CardTitle>
              <div className="flex space-x-2 mt-4">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={`h-2 flex-1 rounded-sm ${
                      s <= step ? "bg-[hsl(0,80%,50%)]" : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>
            </CardHeader>
            <CardContent>
              {step === 1 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Select Date & Time</h3>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label className="text-base font-medium">
                        Choose Date
                      </Label>
                      <Card className="border-2 border-[hsl(0,80%,50%)] rounded-sm">
                        <CardContent className="p-3">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            disabled={(date) => !canSelectDate(date)}
                            classNames={{
                              day_selected:
                                "bg-[hsl(0,80%,50%)] text-white hover:bg-[hsl(0,80%,50%)] hover:text-white focus:bg-[hsl(0,80%,50%)] focus:text-white",
                              day_today:
                                "bg-[hsl(0,0%,98%)]/30 text-[hsl(0,80%,50%)] font-semibold",
                            }}
                          />
                        </CardContent>
                      </Card>
                    </div>

                    <div>
                      <Label className="text-base font-medium mb-3 block">
                        Choose Time
                      </Label>
                      {selectedDate ? (
                        <div className="grid grid-cols-2 gap-2">
                          {generateTimeSlots().map((time) => (
                            <Button
                              key={time}
                              variant={
                                selectedTime === time ? "default" : "outline"
                              }
                              onClick={() => setSelectedTime(time)}
                              className={
                                selectedTime === time
                                  ? "bg-[hsl(0,80%,50%)] hover:bg-[hsl(0,80%,50%)]/90 text-white"
                                  : ""
                              }
                            >
                              {time}
                            </Button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">
                          Please select a date first
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => setStep(2)}
                      disabled={!selectedDate || !selectedTime}
                      className="bg-[hsl(0,80%,50%)] hover:bg-[hsl(0,80%,50%)]/90 text-white"
                    >
                      Next: Personal Information
                    </Button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">
                    Personal Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={donorInfo.name}
                        onChange={(e) =>
                          setDonorInfo({ ...donorInfo, name: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={donorInfo.email}
                        onChange={(e) =>
                          setDonorInfo({ ...donorInfo, email: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        value={donorInfo.phone}
                        onChange={(e) =>
                          setDonorInfo({ ...donorInfo, phone: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="bloodType">Blood Type</Label>
                      <Select
                        value={donorInfo.bloodType}
                        onValueChange={(value) =>
                          setDonorInfo({ ...donorInfo, bloodType: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select blood type" />
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

                    <div>
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={donorInfo.dateOfBirth}
                        onChange={(e) =>
                          setDonorInfo({
                            ...donorInfo,
                            dateOfBirth: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={donorInfo.address}
                        onChange={(e) =>
                          setDonorInfo({
                            ...donorInfo,
                            address: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={donorInfo.city}
                        onChange={(e) =>
                          setDonorInfo({ ...donorInfo, city: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={donorInfo.state}
                        onChange={(e) =>
                          setDonorInfo({ ...donorInfo, state: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setStep(1)}>
                      Back
                    </Button>
                    <Button
                      onClick={() => setStep(3)}
                      disabled={
                        !donorInfo.name || !donorInfo.email || !donorInfo.phone
                      }
                      className="bg-[hsl(0,80%,50%)] hover:bg-[hsl(0,80%,50%)]/90 text-white"
                    >
                      Next: Medical Information
                    </Button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">
                    Medical Information & Confirmation
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="lastDonation">
                        Date of Last Blood Donation
                      </Label>
                      <Input
                        id="lastDonation"
                        type="date"
                        value={medicalInfo.lastDonation}
                        onChange={(e) =>
                          setMedicalInfo({
                            ...medicalInfo,
                            lastDonation: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="medications">Current Medications</Label>
                      <Textarea
                        id="medications"
                        value={medicalInfo.medications}
                        onChange={(e) =>
                          setMedicalInfo({
                            ...medicalInfo,
                            medications: e.target.value,
                          })
                        }
                        placeholder="List any medications you're currently taking..."
                      />
                    </div>

                    <div>
                      <Label htmlFor="allergies">Known Allergies</Label>
                      <Textarea
                        id="allergies"
                        value={medicalInfo.allergies}
                        onChange={(e) =>
                          setMedicalInfo({
                            ...medicalInfo,
                            allergies: e.target.value,
                          })
                        }
                        placeholder="List any known allergies..."
                      />
                    </div>

                    <div className="space-y-3">
                      <Label>
                        Medical History (Check all that apply in the last 8
                        weeks)
                      </Label>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="recentTravel"
                          checked={medicalInfo.recentTravel}
                          onCheckedChange={(checked) =>
                            setMedicalInfo({
                              ...medicalInfo,
                              recentTravel: !!checked,
                            })
                          }
                        />
                        <Label htmlFor="recentTravel">
                          Recent travel outside the country
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="recentTattoo"
                          checked={medicalInfo.recentTattoo}
                          onCheckedChange={(checked) =>
                            setMedicalInfo({
                              ...medicalInfo,
                              recentTattoo: !!checked,
                            })
                          }
                        />
                        <Label htmlFor="recentTattoo">
                          Recent tattoo or piercing
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="recentIllness"
                          checked={medicalInfo.recentIllness}
                          onCheckedChange={(checked) =>
                            setMedicalInfo({
                              ...medicalInfo,
                              recentIllness: !!checked,
                            })
                          }
                        />
                        <Label htmlFor="recentIllness">
                          Recent illness or infection
                        </Label>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="notes">Additional Notes</Label>
                      <Textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Any additional information for the medical staff..."
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="terms"
                        checked={agreedToTerms}
                        onCheckedChange={(checked) =>
                          setAgreedToTerms(!!checked)
                        }
                      />
                      <Label htmlFor="terms">
                        I agree to the{" "}
                        <Link
                          to="/terms"
                          className="text-[hsl(0,80%,50%)] hover:underline"
                        >
                          terms and conditions
                        </Link>{" "}
                        and confirm that all information provided is accurate.
                      </Label>
                    </div>
                  </div>

                  {/* Appointment Summary */}
                  <Card className="bg-[hsl(0,0%,98%)] dark:bg-[hsl(14,100%,50%)] border-2 border-[hsl(0,80%,50%)] rounded-sm">
                    <CardHeader>
                      <CardTitle className="text-[hsl(0,80%,50%)]">
                        Appointment Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p>
                          <strong>Drive:</strong> {drive.name}
                        </p>
                        <p>
                          <strong>Date:</strong>{" "}
                          {selectedDate?.toLocaleDateString()}
                        </p>
                        <p>
                          <strong>Time:</strong> {selectedTime}
                        </p>
                        <p>
                          <strong>Location:</strong> {drive.location}
                        </p>
                        <p>
                          <strong>Donor:</strong> {donorInfo.name}
                        </p>
                        <p>
                          <strong>Blood Type:</strong>{" "}
                          {donorInfo.bloodType || "Not specified"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={() => setStep(2)}>
                      Back
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      disabled={!agreedToTerms || submitting}
                      className="bg-[hsl(0,80%,50%)] hover:bg-[hsl(0,80%,50%)]/90 text-white"
                    >
                      {submitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Booking...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Confirm Appointment
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
