import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useHybridAuth } from "@/contexts/HybridAuthContext";
import { db, Drive } from "@/lib/supabase";
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
import { format, addDays, parse, isAfter, isBefore, isSameDay } from "date-fns";

interface DriveWithDetails extends Drive {
  hospitals?: { name: string; city: string; state: string };
  profiles?: { name: string };
}

export default function BookAppointment() {
  const { driveId } = useParams<{ driveId: string }>();
  const { userProfile, userRole, isSignedIn } = useHybridAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [drive, setDrive] = useState<DriveWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);

  // Form data
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState("");
  const [donorInfo, setDonorInfo] = useState({
    name: userProfile?.name || "",
    email: userProfile?.email || "",
    phone: userProfile?.phone || "",
    bloodType: userProfile?.blood_type || "",
    dateOfBirth: userProfile?.date_of_birth || "",
    address: userProfile?.address || "",
    city: userProfile?.city || "",
    state: userProfile?.state || "",
    postalCode: userProfile?.postal_code || "",
  });
  const [medicalInfo, setMedicalInfo] = useState({
    lastDonation: userProfile?.last_donation_date || "",
    medications: "",
    allergies: "",
    medicalConditions: "",
    recentTravel: false,
    recentTattoo: false,
    recentIllness: false,
  });
  const [notes, setNotes] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  useEffect(() => {
    if (!isSignedIn) {
      navigate("/donor/login");
      return;
    }
    if (driveId) {
      loadDriveDetails();
    }
  }, [driveId, isSignedIn]);

  useEffect(() => {
    if (donorProfile) {
      setDonorInfo({
        name: donorProfile.name || "",
        email: donorProfile.email || "",
        phone: donorProfile.phone || "",
        bloodType: donorProfile.blood_type || "",
        dateOfBirth: donorProfile.date_of_birth || "",
        address: donorProfile.address || "",
        city: donorProfile.city || "",
        state: donorProfile.state || "",
        postalCode: donorProfile.postal_code || "",
      });
      if (donorProfile.last_donation_date) {
        setMedicalInfo((prev) => ({
          ...prev,
          lastDonation: donorProfile.last_donation_date || "",
        }));
      }
    }
  }, [donorProfile]);

  const loadDriveDetails = async () => {
    if (!driveId) return;

    setLoading(true);
    try {
      const { data, error } = await db.getDrives();
      if (error) {
        console.error("Error loading drive:", error);
        toast({
          title: "Error",
          description: "Failed to load blood drive details.",
          variant: "destructive",
        });
      } else {
        const foundDrive = data?.find((d) => d.id === driveId);
        if (foundDrive) {
          setDrive(foundDrive);
        } else {
          toast({
            title: "Drive Not Found",
            description: "The requested blood drive could not be found.",
            variant: "destructive",
          });
          navigate("/drives");
        }
      }
    } catch (error) {
      console.error("Error loading drive:", error);
      toast({
        title: "Error",
        description: "Failed to load blood drive details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateTimeSlots = () => {
    if (!drive) return [];

    const startTime = parse(drive.start_time, "HH:mm", new Date());
    const endTime = parse(drive.end_time, "HH:mm", new Date());
    const slots = [];

    let currentTime = startTime;
    while (isBefore(currentTime, endTime)) {
      slots.push(format(currentTime, "HH:mm"));
      currentTime = addDays(currentTime, 0);
      currentTime.setMinutes(currentTime.getMinutes() + 30);
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
    if (!drive) return false;

    const startDate = new Date(drive.start_date);
    const endDate = new Date(drive.end_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return date >= today && date >= startDate && date <= endDate;
  };

  const handleSubmit = async () => {
    if (!donorProfile || !drive || !selectedDate || !selectedTime) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
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
      const appointmentData = {
        donor_id: donorProfile.id,
        drive_id: drive.id,
        appointment_date: format(selectedDate, "yyyy-MM-dd"),
        appointment_time: selectedTime,
        notes: notes || null,
        status: "scheduled" as const,
      };

      const { data, error } = await db.createAppointment(appointmentData);

      if (error) {
        console.error("Error creating appointment:", error);
        toast({
          title: "Booking Failed",
          description: "Failed to book your appointment. Please try again.",
          variant: "destructive",
        });
      } else {
        // Update user profile if needed
        if (
          donorInfo.bloodType &&
          donorInfo.bloodType !== donorProfile?.blood_type
        ) {
          // TODO: Use updateDonorProfile from hybrid auth context
          // await updateDonorProfile({
          //   blood_type: donorInfo.bloodType as any,
          // });
        }

        toast({
          title: "Appointment Booked!",
          description:
            "Your blood donation appointment has been successfully scheduled.",
        });

        navigate("/appointments");
      }
    } catch (error) {
      console.error("Error creating appointment:", error);
      toast({
        title: "Booking Failed",
        description: "Failed to book your appointment. Please try again.",
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
          <RefreshCw className="w-8 h-8 text-hope-red mx-auto mb-4 animate-spin" />
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

            <Button variant="outline" asChild>
              <Link to="/drives">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Drives
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Drive Info */}
          <Card className="mb-8 border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-2xl text-hope-red">
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
                    <MapPin className="w-4 h-4 text-hope-red mt-1" />
                    <div>
                      <p className="font-medium">{drive.location}</p>
                      <p className="text-sm text-muted-foreground">
                        {drive.address}, {drive.city}, {drive.state}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="w-4 h-4 text-hope-red" />
                    <p>
                      {new Date(drive.start_date).toLocaleDateString()}
                      {drive.start_date !== drive.end_date &&
                        ` - ${new Date(drive.end_date).toLocaleDateString()}`}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-hope-red" />
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
                              className="px-2 py-1 bg-hope-red text-white text-sm rounded"
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
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-hope-red">
                Book Your Appointment - Step {step} of 3
              </CardTitle>
              <div className="flex space-x-2 mt-4">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className={`h-2 flex-1 rounded ${
                      s <= step ? "bg-hope-red" : "bg-gray-200"
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
                    <div>
                      <Label className="text-base font-medium mb-3 block">
                        Choose Date
                      </Label>
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => !canSelectDate(date)}
                        className="rounded-md border"
                      />
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
                                  ? "bg-hope-red hover:bg-hope-red/90"
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
                      className="bg-hope-red hover:bg-hope-red/90"
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
                      className="bg-hope-red hover:bg-hope-red/90"
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
                          className="text-hope-red hover:underline"
                        >
                          terms and conditions
                        </Link>{" "}
                        and confirm that all information provided is accurate.
                      </Label>
                    </div>
                  </div>

                  {/* Appointment Summary */}
                  <Card className="bg-hope-pink dark:bg-hope-coral">
                    <CardHeader>
                      <CardTitle className="text-hope-red">
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
                      className="bg-hope-red hover:bg-hope-red/90"
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
