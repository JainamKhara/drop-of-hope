import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
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
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { PaginationControls } from "@/components/PaginationControls";
import { format, isAfter, isBefore, addDays, isSameDay } from "date-fns";
import { useHybridAuth, DonorProfile } from "@/contexts/HybridAuthContext";
import { useToast } from "@/hooks/use-toast";
import { generateGoogleCalendarUrl as getGoogleCalendarUrl, parseAppointmentDateTime } from "@/lib/calendar";

interface AppointmentDisplay {
  id: string;
  driveName: string;
  organizer: string;
  date: string;
  time: string;
  location: string;
  address: string;
  status: "scheduled" | "confirmed" | "completed" | "cancelled" | "no_show";
  isAccepted: boolean;
  notes?: string;
}

export default function MyAppointments() {
  const { donorProfile } = useHybridAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [appointments, setAppointments] = useState<AppointmentDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [historyPage, setHistoryPage] = useState(1);
  const [upcomingPage, setUpcomingPage] = useState(1);
  const [cancelledPage, setCancelledPage] = useState(1);
  const itemsPerPage = 5;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingAppointments = appointments.filter(
    (apt) => {
      const aptDate = new Date(apt.date);
      aptDate.setHours(0, 0, 0, 0);
      return !isBefore(aptDate, today) && (apt.status === "scheduled" || apt.status === "confirmed");
    },
  );

  const completedAppointments = appointments.filter(
    (apt) => apt.status === "completed",
  );

  const cancelledAppointments = appointments.filter(
    (apt) => apt.status === "cancelled" || apt.status === "no_show",
  );

  // Filter and Paginate Upcoming
  const filteredUpcoming = upcomingAppointments
    .filter((apt) => !selectedDate || isSameDay(new Date(apt.date), selectedDate))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const upcomingTotalPages = Math.ceil(filteredUpcoming.length / itemsPerPage);
  const paginatedUpcoming = filteredUpcoming.slice((upcomingPage - 1) * itemsPerPage, upcomingPage * itemsPerPage);

  // Filter and Paginate History
  const filteredHistory = completedAppointments
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const historyTotalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const paginatedHistory = filteredHistory.slice((historyPage - 1) * itemsPerPage, historyPage * itemsPerPage);

  // Filter and Paginate Cancelled
  const filteredCancelled = cancelledAppointments
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const cancelledTotalPages = Math.ceil(filteredCancelled.length / itemsPerPage);
  const paginatedCancelled = filteredCancelled.slice((cancelledPage - 1) * itemsPerPage, cancelledPage * itemsPerPage);

  useEffect(() => {
    if (donorProfile?.id) {
      loadAppointments();
    }
  }, [donorProfile]);

  const loadAppointments = async (retryCount = 0) => {
    if (!donorProfile?.id) return;

    try {
      setLoading(true);
      const { data, error } = await appointmentService.getByDonor(
        donorProfile.id,
      );

      if (error) {
        // Handle specific timeout/network errors with automatic retry
        // PostgrestError has message, details, hint, and code
        const isNetworkError = 
          error.message?.toLowerCase().includes("fetch") || 
          error.message?.toLowerCase().includes("timeout") ||
          error.code === "UND_ERR_CONNECT_TIMEOUT";
        
        if (isNetworkError && retryCount < 2) {
          console.warn(`Connection timeout, retrying... (${retryCount + 1}/2)`);
          setTimeout(() => loadAppointments(retryCount + 1), 2000);
          return;
        }

        console.error("Error loading appointments:", error);
        toast({
          title: "Connection Error",
          description: "Failed to reach the database. Please check your internet connection and try again.",
          variant: "destructive",
        });
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
            status: apt.status || "scheduled",
            isAccepted: !!apt.acceptance_email_sent_at,
            notes: apt.notes,
          };
        },
      );
      setAppointments(displayAppointments);
    } catch (error: any) {
      console.error("Unexpected error loading appointments:", error);
      
      // Attempt retry on unexpected network failures
      if (retryCount < 2) {
        setTimeout(() => loadAppointments(retryCount + 1), 2000);
      } else {
        toast({
          title: "Fetch Failed",
          description: "An unexpected error occurred while loading your appointments.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

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

  const generateGoogleCalendarUrl = (appointment: AppointmentDisplay) => {
    const startDateTime = parseAppointmentDateTime(appointment.date, appointment.time);
    if (!startDateTime) return "#";
    
    // Assume 30 minute duration
    const endDateTime = new Date(startDateTime.getTime() + 30 * 60 * 1000);
    
    return getGoogleCalendarUrl({
      title: `Blood Donation: ${appointment.driveName}`,
      description: `Blood donation appointment at ${appointment.driveName}. Thank you for saving lives!`,
      location: `${appointment.location}, ${appointment.address}`,
      startDate: startDateTime,
      endDate: endDateTime
    });
  };

  const handleViewCertificate = (appointment: AppointmentDisplay) => {
    const donorName = donorProfile?.name || "Valued Donor";
    const certWindow = window.open("", "_blank", "width=900,height=650");
    if (!certWindow) return;
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
            <div class="detail"><div class="detail-label">Blood Drive</div><div class="detail-val">${appointment.driveName}</div></div>
            <div class="detail"><div class="detail-label">Date</div><div class="detail-val">${appointment.date}</div></div>
            <div class="detail"><div class="detail-label">Location</div><div class="detail-val">${appointment.location}</div></div>
            <div class="detail"><div class="detail-label">Time</div><div class="detail-val">${appointment.time}</div></div>
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

  const handleShareAchievement = (appointment: AppointmentDisplay) => {
    const message = `I just completed a blood donation at ${appointment.driveName}! Join me in saving lives. 🩸 #BloodDonation #DropOfHope`;

    if (navigator.share) {
      navigator.share({
        title: "My Blood Donation Achievement",
        text: message,
        url: window.location.origin,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(message);
      toast({
        title: "Achievement Copied",
        description: "Share message copied to clipboard!",
      });
    }
  };

  const handlePrintSlip = (appointment: AppointmentDisplay) => {
    const printWindow = window.open("", "_blank", "width=700,height=600");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Appointment Slip – ${appointment.driveName}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; color: #111; }
            h1 { color: #cc2222; border-bottom: 2px solid #cc2222; padding-bottom: 10px; }
            .field { margin: 12px 0; }
            .label { font-weight: bold; color: #555; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; }
            .value { font-size: 16px; margin-top: 2px; }
            .footer { margin-top: 40px; font-size: 12px; color: #888; border-top: 1px solid #ddd; padding-top: 12px; }
            @media print { button { display: none; } }
          </style>
        </head>
        <body>
          <h1>🩸 Drop of Hope – Appointment Confirmation</h1>
          <div class="field"><div class="label">Appointment ID</div><div class="value">${appointment.id}</div></div>
          <div class="field"><div class="label">Blood Drive</div><div class="value">${appointment.driveName}</div></div>
          <div class="field"><div class="label">Date</div><div class="value">${appointment.date}</div></div>
          <div class="field"><div class="label">Time</div><div class="value">${appointment.time}</div></div>
          <div class="field"><div class="label">Location</div><div class="value">${appointment.location}</div></div>
          <div class="field"><div class="label">Address</div><div class="value">${appointment.address}</div></div>
          <div class="field"><div class="label">Status</div><div class="value" style="text-transform:capitalize">${appointment.status}</div></div>
          ${appointment.notes ? `<div class="field"><div class="label">Notes</div><div class="value">${appointment.notes}</div></div>` : ""}
          <div class="footer">Please arrive 15 minutes early. Bring a valid photo ID. Printed on ${new Date().toLocaleString()}.</div>
          <br/><button onclick="window.print()">🖨️ Print</button>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
  };

  const getStatusLabel = (appointment: AppointmentDisplay) => {
    if (appointment.isAccepted && appointment.status === "scheduled") return "Accepted";
    switch (appointment.status) {
      case "no_show": return "No Show";
      case "confirmed": return "Accepted";
      case "completed": return "Completed";
      case "cancelled": return "Cancelled";
      case "scheduled": return "Scheduled";
      default: return appointment.status;
    }
  };

  const getStatusIcon = (status: string, isAccepted?: boolean) => {
    if (isAccepted && status === "scheduled") return <CheckCircle className="w-4 h-4 text-success" />;
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-4 h-4 text-success" />;
      case "completed":
        return <CheckCircle className="w-4 h-4 text-success" />;
      case "cancelled":
        return <XCircle className="w-4 h-4 text-destructive" />;
      case "no_show":
        return <XCircle className="w-4 h-4 text-gray-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-warning" />;
    }
  };

  const getStatusColor = (status: string, isAccepted?: boolean) => {
    if (isAccepted && status === "scheduled") return "bg-success/10 text-success border-success/20";
    switch (status) {
      case "confirmed":
        return "bg-success/10 text-success border-success/20";
      case "completed":
        return "bg-success/10 text-success border-success/20";
      case "cancelled":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "no_show":
        return "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400";
      default:
        return "bg-warning/10 text-warning border-warning/20";
    }
  };

  // Get dates with appointments for calendar highlighting
  // Normalize dates to midnight for proper comparison
  // Get dates with active appointments for calendar highlighting
  // Only highlight scheduled or confirmed appointments to avoid confusion with cancelled ones
  const activeAppointmentDates = appointments
    .filter(apt => apt.status === "scheduled" || apt.status === "confirmed")
    .map((apt) => {
      const date = new Date(apt.date);
      date.setHours(0, 0, 0, 0);
      return date;
    });

  const otherAppointmentDates = appointments
    .filter(apt => apt.status !== "scheduled" && apt.status !== "confirmed")
    .map((apt) => {
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
                  onSelect={setSelectedDate}
                  footer={
                    selectedDate && (
                      <div className="mt-2 flex justify-center">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-xs h-8 text-[hsl(0,80%,50%)] hover:text-[hsl(0,80%,50%)] hover:bg-[hsl(0,80%,50%)]/10"
                          onClick={() => setSelectedDate(undefined)}
                        >
                          Show All Upcoming
                        </Button>
                      </div>
                    )
                  }
                  modifiers={{
                    hasActiveAppointment: activeAppointmentDates,
                    hasOtherAppointment: otherAppointmentDates,
                  }}
                  modifiersClassNames={{
                    hasActiveAppointment:
                      "font-bold text-[hsl(0,80%,50%)]",
                    hasOtherAppointment:
                      "opacity-60",
                  }}
                  components={{
                    DayButton: (props) => {
                      const { day, modifiers } = props;
                      const date = day.date;
                      const isToday = format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
                      const hasActive = activeAppointmentDates.some(d => format(d, "yyyy-MM-dd") === format(date, "yyyy-MM-dd"));
                      
                      return (
                        <div className="relative w-full h-full flex items-center justify-center">
                          <CalendarDayButton {...props} />
                          {hasActive && (
                            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[hsl(0,80%,50%)] rounded-full" />
                          )}
                        </div>
                      );
                    }
                  }}
                  className="w-full [--cell-size:1.75rem]"
                  classNames={{
                    day_selected:
                      "bg-[hsl(0,80%,50%)] text-white hover:bg-[hsl(0,80%,50%)] hover:text-white focus:bg-[hsl(0,80%,50%)] focus:text-white rounded-full",
                    day_today:
                      "text-[hsl(0,80%,50%)] font-bold",
                  }}
                />
                <div className="mt-4 space-y-2 text-[10px]">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-[hsl(0,80%,50%)] rounded-full"></div>
                    <span>Active appointment</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-muted rounded-full"></div>
                    <span>Past/Other dates</span>
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
                    {completedAppointments.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </div>
                <div className="text-center p-3 bg-[hsl(0,0%,98%)] dark:bg-[hsl(14,100%,50%)] rounded-sm">
                  <div className="text-2xl font-bold text-[hsl(0,80%,50%)]">
                    {completedAppointments.length * 3}
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
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="upcoming">
                  Upcoming ({upcomingAppointments.length})
                </TabsTrigger>
                <TabsTrigger value="completed">
                  Completed ({completedAppointments.length})
                </TabsTrigger>
                <TabsTrigger value="cancelled">
                  Cancelled ({cancelledAppointments.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upcoming" className="space-y-6 mt-6">
                {paginatedUpcoming.length === 0 ? (
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
                  <>
                  {paginatedUpcoming.map((appointment) => (
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
                          <Badge className={getStatusColor(appointment.status, appointment.isAccepted)}>
                            {getStatusIcon(appointment.status, appointment.isAccepted)}
                            <span className="ml-1">
                              {getStatusLabel(appointment)}
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
                            className="flex-1 border-[hsl(0,80%,50%)] text-[hsl(0,80%,50%)] hover:bg-[hsl(0,80%,50%)] hover:text-white"
                            asChild
                          >
                            <a 
                              href={generateGoogleCalendarUrl(appointment)} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center justify-center"
                            >
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Add to Calendar
                            </a>
                          </Button>
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
                  ))}
                  <PaginationControls 
                    currentPage={upcomingPage} 
                    totalPages={upcomingTotalPages} 
                    onPageChange={setUpcomingPage} 
                  />
                  </>
                )}
              </TabsContent>

              <TabsContent value="completed" className="space-y-6 mt-6">
                {paginatedHistory.length === 0 ? (
                  <Card className="border-2 border-[hsl(0,80%,50%)] rounded-sm">
                    <CardContent className="text-center py-12">
                      <CheckCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">
                        No Completed Appointments
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        Your completed donations will appear here
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                  {paginatedHistory.map((appointment) => (
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
                            onClick={() => handleViewCertificate(appointment)}
                          >
                            View Certificate
                          </Button>
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => handleShareAchievement(appointment)}
                          >
                            Share Achievement
                          </Button>
                          <Button
                            className="flex-1 bg-[hsl(0,80%,50%)] hover:bg-[hsl(0,80%,50%)]/90 text-white"
                            asChild
                          >
                            <Link to="/drives">Book Next Donation</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  <PaginationControls 
                    currentPage={historyPage} 
                    totalPages={historyTotalPages} 
                    onPageChange={setHistoryPage} 
                  />
                  </>
                )}
              </TabsContent>

              <TabsContent value="cancelled" className="space-y-6 mt-6">
                {paginatedCancelled.length === 0 ? (
                  <Card className="border-2 border-[hsl(0,80%,50%)] rounded-sm">
                    <CardContent className="text-center py-12">
                      <XCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">
                        No Cancelled Appointments
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        Cancelled or no-show appointments will appear here
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                  {paginatedCancelled.map((appointment) => (
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
                            className="flex-1 bg-[hsl(0,80%,50%)] hover:bg-[hsl(0,80%,50%)]/90 text-white"
                            asChild
                          >
                            <Link to="/drives">Schedule New Appointment</Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  <PaginationControls 
                    currentPage={cancelledPage} 
                    totalPages={cancelledTotalPages} 
                    onPageChange={setCancelledPage} 
                  />
                  </>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
