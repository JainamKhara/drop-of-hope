import React, { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
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
} from "lucide-react";
import { format, addDays } from "date-fns";

// Mock blood drive data (would come from database)
const mockDrive = {
  id: 1,
  name: "Red Cross Downtown Drive",
  organizer: "American Red Cross",
  location: "Downtown Community Center",
  address: "123 Main St, Downtown",
  date: "2024-12-15",
  time: "10:00 AM - 4:00 PM",
  bloodTypes: ["O+", "O-", "A+", "B+"],
  description:
    "Annual holiday blood drive to help save lives during the holiday season.",
  requirements: ["Valid ID", "Age 17+", "Weight 110+ lbs"],
  contact: "contact@redcross.org",
};

// Available time slots
const timeSlots = [
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "1:00 PM",
  "1:30 PM",
  "2:00 PM",
  "2:30 PM",
  "3:00 PM",
  "3:30 PM",
];

export default function BookAppointment() {
  const { driveId } = useParams();
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState<Date>(
    new Date(mockDrive.date),
  );
  const [selectedTime, setSelectedTime] = useState("");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bloodType: "",
    notes: "",
    emergencyContact: "",
    emergencyPhone: "",
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBooked, setIsBooked] = useState(false);

  const bloodTypes = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsBooked(true);
    }, 2000);
  };

  const isFormValid = () => {
    return (
      formData.firstName &&
      formData.lastName &&
      formData.email &&
      formData.phone &&
      formData.bloodType &&
      selectedTime &&
      acceptedTerms
    );
  };

  if (isBooked) {
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
            </div>
          </div>
        </header>

        {/* Success Message */}
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-2xl mx-auto text-center">
            <Card className="border-0 shadow-xl">
              <CardContent className="p-12">
                <div className="w-20 h-20 bg-success rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-hope-red mb-4">
                  Appointment Booked!
                </h1>
                <p className="text-lg text-muted-foreground mb-6">
                  Thank you for scheduling your blood donation. You're helping
                  save lives!
                </p>

                <div className="bg-hope-pink dark:bg-hope-coral p-6 rounded-lg mb-6 text-left">
                  <h3 className="font-semibold text-hope-red mb-4">
                    Appointment Details:
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Drive:</strong> {mockDrive.name}
                    </p>
                    <p>
                      <strong>Date:</strong>{" "}
                      {format(selectedDate, "EEEE, MMMM dd, yyyy")}
                    </p>
                    <p>
                      <strong>Time:</strong> {selectedTime}
                    </p>
                    <p>
                      <strong>Location:</strong> {mockDrive.location}
                    </p>
                    <p>
                      <strong>Address:</strong> {mockDrive.address}
                    </p>
                  </div>
                </div>

                <Alert className="mb-6">
                  <CalendarIcon className="h-4 w-4" />
                  <AlertDescription>
                    A calendar invitation has been sent to {formData.email}.
                    You'll also receive a reminder 24 hours before your
                    appointment.
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <Button
                    className="w-full bg-hope-red hover:bg-hope-red/90"
                    asChild
                  >
                    <Link to="/dashboard">Go to Dashboard</Link>
                  </Button>
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/drives">Find More Drives</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
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

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-hope-red mb-4">
              Book Your Appointment
            </h1>
            <p className="text-xl text-muted-foreground">
              Schedule your blood donation and help save lives in your community
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Drive Information */}
            <div className="lg:col-span-1">
              <Card className="border-0 shadow-lg sticky top-8">
                <CardHeader>
                  <CardTitle className="text-hope-red">
                    Drive Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold">{mockDrive.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {mockDrive.organizer}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-4 h-4 text-hope-red mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">
                          {mockDrive.location}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {mockDrive.address}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="w-4 h-4 text-hope-red" />
                      <p className="text-sm">
                        {format(
                          new Date(mockDrive.date),
                          "EEEE, MMMM dd, yyyy",
                        )}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-hope-red" />
                      <p className="text-sm">{mockDrive.time}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Requirements:
                    </p>
                    <ul className="text-xs space-y-1">
                      {mockDrive.requirements.map((req, index) => (
                        <li key={index} className="flex items-center space-x-1">
                          <div className="w-1 h-1 bg-hope-red rounded-full"></div>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Booking Form */}
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Appointment Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Date & Time Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-base font-medium">
                          Select Date
                        </Label>
                        <div className="mt-2">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => date && setSelectedDate(date)}
                            disabled={(date) =>
                              date < new Date() ||
                              date > addDays(new Date(), 30)
                            }
                            className="rounded-md border"
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-base font-medium">
                          Select Time
                        </Label>
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          {timeSlots.map((time) => (
                            <Button
                              key={time}
                              type="button"
                              variant={
                                selectedTime === time ? "default" : "outline"
                              }
                              size="sm"
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
                      </div>
                    </div>

                    {/* Personal Information */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <User className="w-5 h-5 mr-2 text-hope-red" />
                        Personal Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">First Name *</Label>
                          <Input
                            id="firstName"
                            value={formData.firstName}
                            onChange={(e) =>
                              handleInputChange("firstName", e.target.value)
                            }
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName">Last Name *</Label>
                          <Input
                            id="lastName"
                            value={formData.lastName}
                            onChange={(e) =>
                              handleInputChange("lastName", e.target.value)
                            }
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email Address *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                              handleInputChange("email", e.target.value)
                            }
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone Number *</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) =>
                              handleInputChange("phone", e.target.value)
                            }
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="bloodType">Blood Type *</Label>
                          <Select
                            value={formData.bloodType}
                            onValueChange={(value) =>
                              handleInputChange("bloodType", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select your blood type" />
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
                    </div>

                    {/* Emergency Contact */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <Phone className="w-5 h-5 mr-2 text-hope-red" />
                        Emergency Contact (Optional)
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="emergencyContact">Contact Name</Label>
                          <Input
                            id="emergencyContact"
                            value={formData.emergencyContact}
                            onChange={(e) =>
                              handleInputChange(
                                "emergencyContact",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="emergencyPhone">Contact Phone</Label>
                          <Input
                            id="emergencyPhone"
                            type="tel"
                            value={formData.emergencyPhone}
                            onChange={(e) =>
                              handleInputChange(
                                "emergencyPhone",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>

                    {/* Additional Notes */}
                    <div>
                      <Label htmlFor="notes">
                        Additional Notes or Medical Information
                      </Label>
                      <Textarea
                        id="notes"
                        placeholder="Any medical conditions, medications, or special requirements..."
                        value={formData.notes}
                        onChange={(e) =>
                          handleInputChange("notes", e.target.value)
                        }
                      />
                    </div>

                    {/* Terms and Conditions */}
                    <div className="flex items-start space-x-2">
                      <Checkbox
                        id="terms"
                        checked={acceptedTerms}
                        onCheckedChange={setAcceptedTerms}
                      />
                      <Label htmlFor="terms" className="text-sm">
                        I agree to the{" "}
                        <Link
                          to="/terms"
                          className="text-hope-red hover:underline"
                        >
                          terms and conditions
                        </Link>{" "}
                        and confirm that I meet all eligibility requirements for
                        blood donation.
                      </Label>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4">
                      <Button
                        type="submit"
                        className="w-full bg-hope-red hover:bg-hope-red/90"
                        disabled={!isFormValid() || isSubmitting}
                      >
                        {isSubmitting
                          ? "Booking Appointment..."
                          : "Book Appointment"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
