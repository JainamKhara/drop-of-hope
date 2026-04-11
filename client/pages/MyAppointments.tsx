import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { appointmentService } from "@/lib/db-services";
import {
  Heart,
  ArrowLeft,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  RefreshCw,
  Printer,
} from "lucide-react";
import { format, isAfter, isBefore, addDays } from "date-fns";
import { useHybridAuth, DonorProfile } from "@/contexts/HybridAuthContext";
import { useToast } from "@/hooks/use-toast";

interface AppointmentDisplay {
  id: string;
  driveName: string;
  organizer: string;
  date: string;
  time: string;
  location: string;
  address: string;
  status: "scheduled" | "completed" | "cancelled" | "no_show";
  notes?: string;
}

export default function MyAppointments() {
  const { donorProfile } = useHybridAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState("upcoming");
  const [appointments, setAppointments] = useState<AppointmentDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load appointments from database
  useEffect(() => {
    if (donorProfile?.id) {
      loadAppointments();
    }
  }, [donorProfile]);

  const loadAppointments = async () => {
    if (!donorProfile?.id) return;

    try {
      setLoading(true);
      const { data, error } = await appointmentService.getByDonor(
        donorProfile.id,
      );

      if (error) {
        console.error("Error loading appointments:", error);
        return;
      }

      // Convert to display format
      const displayAppointments: AppointmentDisplay[] = (data || []).map(
        (apt: any) => {
          // Convert 24h time to 12h format
          const [hours, minutes] = (apt.appointment_time || "00:00").split(":");
          const hour24 = parseInt(hours, 10);
          const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
          const ampm = hour24 >= 12 ? "PM" : "AM";
          const timeDisplay = `${hour12}:${minutes} ${ampm}`;

          return {
            id: apt.id,
            driveName: apt.drives?.name || "Blood Drive",
            organizer: "Blood Donation Center",
            date: apt.appointment_date,
            time: timeDisplay,
            location: apt.drives?.location || "Unknown",
            address: `${apt.drives?.address || ""}, ${apt.drives?.city || ""}, ${apt.drives?.state || ""}`,
            status: apt.status === "scheduled" ? "scheduled" : apt.status,
            notes: apt.notes,
          };
        },
      );
      setAppointments(displayAppointments);
    } catch (error) {
      console.error("Error loading appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const upcomingAppointments = appointments.filter(
    (apt) =>
      isAfter(new Date(apt.date), new Date()) && apt.status === "scheduled",
  );

  const pastAppointments = appointments.filter(
    (apt) =>
      isBefore(new Date(apt.date), new Date()) ||
      apt.status === "completed" ||
      apt.status === "cancelled",
  );

  const handleCancelAppointment = async (id: string) => {
    if (window.confirm("Are you sure you want to cancel this appointment?")) {
      try {
        const { error } = await appointmentService.cancel(id);

        if (error) {
          throw error;
        }

        // Update local state
        setAppointments((prev) =>
          prev.map((app) =>
            app.id === id ? { ...app, status: "cancelled" as const } : app,
          ),
        );
        toast({
          title: "Appointment Cancelled",
          description: "Your appointment has been successfully cancelled.",
        });
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to cancel appointment. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleRescheduleAppointment = (id: string) => {
    const appointment = appointments.find((apt) => apt.id === id);
    if (appointment) {
      window.location.href = "/drives";
    }
  };

  const handlePrintSlip = (appointment: AppointmentDisplay) => {
    const slipHtml = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;border:2px solid #e74c3c;border-radius:12px">
        <h2 style="color:#e74c3c;margin-bottom:8px">Drop of Hope — Appointment Slip</h2>
        <hr style="border-color:#e74c3c;margin-bottom:16px"/>
        <p><strong>Drive:</strong> ${appointment.driveName}</p>
        <p><strong>Date:</strong> ${format(new Date(appointment.date), "EEEE, MMM dd, yyyy")}</p>
        <p><strong>Time:</strong> ${appointment.time}</p>
        <p><strong>Location:</strong> ${appointment.location}</p>
        <p><strong>Address:</strong> ${appointment.address}</p>
        ${appointment.notes ? `<p><strong>Notes:</strong> ${appointment.notes}</p>` : ""}
        <p style="margin-top:16px;color:#888;font-size:12px">Appointment ID: ${appointment.id}</p>
      </div>
    `;
    const win = window.open("", "_blank", "width=700,height=500");
    if (win) {
      win.document.write(
        `<html><head><title>Appointment Slip</title></head><body>${slipHtml}</body></html>`,
      );
      win.document.close();
      win.print();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-4 h-4 text-success" />;
      case "completed":
        return <CheckCircle className="w-4 h-4 text-success" />;
      case "cancelled":
        return <XCircle className="w-4 h-4 text-destructive" />;
      default:
        return <AlertCircle className="w-4 h-4 text-warning" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-success/10 text-success border-success/20";
      case "completed":
        return "bg-success/10 text-success border-success/20";
      case "cancelled":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-warning/10 text-warning border-warning/20";
    }
  };

  // Get dates with appointments for calendar highlighting
  // Normalize dates to midnight for proper comparison
  const appointmentDates = appointments.map((apt) => {
    const date = new Date(apt.date);
    date.setHours(0, 0, 0, 0);
    return date;
  });

  return (
    <div className="min-h-screen bg-white dark:bg-[hsl(0,0%,6%)]">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[hsl(0,80%,50%)] mb-4">
            My Appointments
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Manage your blood donation appointments and view your donation
            history
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Calendar Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-2 border-[hsl(0,80%,50%)] rounded-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CalendarIcon className="w-5 h-5" />
                  <span>Calendar</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 overflow-x-auto">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  modifiers={{
                    hasAppointment: appointmentDates,
                  }}
                  modifiersClassNames={{
                    hasAppointment:
                      "bg-[hsl(0,80%,50%)]/20 text-[hsl(0,80%,50%)] font-semibold border border-[hsl(0,80%,50%)]/30",
                  }}
                  className="w-full [--cell-size:1.75rem]"
                  classNames={{
                    day_selected:
                      "bg-[hsl(0,80%,50%)] text-white hover:bg-[hsl(0,80%,50%)] hover:text-white focus:bg-[hsl(0,80%,50%)] focus:text-white",
                    day_today:
                      "bg-[hsl(0,0%,98%)]/30 text-[hsl(0,80%,50%)] font-semibold",
                  }}
                />
                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-[hsl(0,80%,50%)] rounded-full"></div>
                    <span>Appointment scheduled</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-muted rounded-full"></div>
                    <span>Available dates</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="border-2 border-[hsl(0,80%,50%)] rounded-sm mt-6">
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-3 bg-[hsl(0,0%,98%)] dark:bg-[hsl(14,100%,50%)] rounded-sm">
                  <div className="text-2xl font-bold text-[hsl(0,80%,50%)]">
                    {upcomingAppointments.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Upcoming</div>
                </div>
                <div className="text-center p-3 bg-[hsl(0,0%,98%)] dark:bg-[hsl(14,100%,50%)] rounded-sm">
                  <div className="text-2xl font-bold text-[hsl(0,80%,50%)]">
                    {
                      pastAppointments.filter(
                        (apt) => apt.status === "completed",
                      ).length
                    }
                  </div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </div>
                <div className="text-center p-3 bg-[hsl(0,0%,98%)] dark:bg-[hsl(14,100%,50%)] rounded-sm">
                  <div className="text-2xl font-bold text-[hsl(0,80%,50%)]">
                    {pastAppointments.filter(
                      (apt) => apt.status === "completed",
                    ).length * 3}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Lives Saved
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Appointments List */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upcoming">
                  Upcoming ({upcomingAppointments.length})
                </TabsTrigger>
                <TabsTrigger value="past">
                  Past ({pastAppointments.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upcoming" className="space-y-6 mt-6">
                {upcomingAppointments.length === 0 ? (
                  <Card className="border-2 border-[hsl(0,80%,50%)] rounded-sm">
                    <CardContent className="text-center py-12">
                      <CalendarIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">
                        No Upcoming Appointments
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        Schedule your next blood donation to continue helping
                        save lives
                      </p>
                      <Button
                        className="bg-[hsl(0,80%,50%)] hover:bg-[hsl(0,80%,50%)]/90 text-white"
                        asChild
                      >
                        <Link to="/drives">Find Blood Drives</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  upcomingAppointments.map((appointment) => (
                    <Card
                      key={appointment.id}
                      className="border-2 border-[hsl(0,80%,50%)] rounded-sm"
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-xl text-[hsl(0,80%,50%)]">
                              {appointment.driveName}
                            </CardTitle>
                            <p className="text-muted-foreground">
                              {appointment.organizer}
                            </p>
                          </div>
                          <Badge className={getStatusColor(appointment.status)}>
                            {getStatusIcon(appointment.status)}
                            <span className="ml-1 capitalize">
                              {appointment.status}
                            </span>
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="flex items-center space-x-3">
                            <CalendarIcon className="w-5 h-5 text-[hsl(0,80%,50%)]" />
                            <div>
                              <p className="font-medium">
                                {format(
                                  new Date(appointment.date),
                                  "EEEE, MMM dd",
                                )}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(appointment.date), "yyyy")}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <Clock className="w-5 h-5 text-[hsl(0,80%,50%)]" />
                            <div>
                              <p className="font-medium">{appointment.time}</p>
                              <p className="text-sm text-muted-foreground">
                                Local time
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start space-x-3">
                            <MapPin className="w-5 h-5 text-[hsl(0,80%,50%)] mt-0.5" />
                            <div>
                              <p className="font-medium">
                                {appointment.location}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {appointment.address}
                              </p>
                            </div>
                          </div>
                        </div>

                        {appointment.notes && (
                          <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                              {appointment.notes}
                            </AlertDescription>
                          </Alert>
                        )}

                        <div className="flex space-x-3 pt-4">
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() =>
                              handleRescheduleAppointment(appointment.id)
                            }
                          >
                            Reschedule
                          </Button>
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() =>
                              handleCancelAppointment(appointment.id)
                            }
                            disabled={
                              appointment.status === "cancelled" ||
                              appointment.status === "completed"
                            }
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="outline"
                            className="flex-1 border-[hsl(0,80%,50%)]/20 text-[hsl(0,80%,50%)] hover:bg-[hsl(0,80%,50%)] hover:text-white"
                            onClick={() => handlePrintSlip(appointment)}
                          >
                            <Printer className="w-4 h-4 mr-1" />
                            Print Slip
                          </Button>
                          <Button
                            className="flex-1 bg-[hsl(0,80%,50%)] hover:bg-[hsl(0,80%,50%)]/90 text-white"
                            onClick={() => {
                              const address = encodeURIComponent(
                                appointment.address,
                              );
                              window.open(
                                `https://www.google.com/maps/search/?api=1&query=${address}`,
                                "_blank",
                              );
                            }}
                          >
                            Get Directions
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="past" className="space-y-6 mt-6">
                {pastAppointments.map((appointment) => (
                  <Card
                    key={appointment.id}
                    className="border-2 border-[hsl(0,80%,50%)] rounded-sm"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl text-[hsl(0,80%,50%)]">
                            {appointment.driveName}
                          </CardTitle>
                          <p className="text-muted-foreground">
                            {appointment.organizer}
                          </p>
                        </div>
                        <Badge className={getStatusColor(appointment.status)}>
                          {getStatusIcon(appointment.status)}
                          <span className="ml-1 capitalize">
                            {appointment.status}
                          </span>
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center space-x-3">
                          <CalendarIcon className="w-5 h-5 text-[hsl(0,80%,50%)]" />
                          <div>
                            <p className="font-medium">
                              {format(
                                new Date(appointment.date),
                                "EEEE, MMM dd, yyyy",
                              )}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {appointment.time}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <MapPin className="w-5 h-5 text-[hsl(0,80%,50%)] mt-0.5" />
                          <div>
                            <p className="font-medium">
                              {appointment.location}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {appointment.address}
                            </p>
                          </div>
                        </div>

                        {appointment.status === "completed" && (
                          <div className="flex items-center space-x-3">
                            <Heart className="w-5 h-5 text-[hsl(0,80%,50%)] fill-current" />
                            <div>
                              <p className="font-medium text-success">
                                Donation Completed
                              </p>
                              <p className="text-sm text-muted-foreground">
                                +100 points earned
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {appointment.notes && (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            {appointment.notes}
                          </AlertDescription>
                        </Alert>
                      )}

                      {appointment.status === "completed" && (
                        <div className="flex space-x-3 pt-4">
                          <Button variant="outline" className="flex-1">
                            View Certificate
                          </Button>
                          <Button variant="outline" className="flex-1">
                            Share Achievement
                          </Button>
                          <Button
                            className="flex-1 bg-[hsl(0,80%,50%)] hover:bg-[hsl(0,80%,50%)]/90 text-white"
                            asChild
                          >
                            <Link to="/drives">Book Next Donation</Link>
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
