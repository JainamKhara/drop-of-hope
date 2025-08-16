import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Heart, ArrowLeft, Calendar as CalendarIcon, Clock, MapPin, CheckCircle, XCircle, AlertCircle, Plus } from 'lucide-react';
import { format, isAfter, isBefore, addDays } from 'date-fns';

// Mock appointments data
const mockAppointments = [
  {
    id: 1,
    driveName: 'Red Cross Downtown Drive',
    organizer: 'American Red Cross',
    date: '2024-12-15',
    time: '10:30 AM',
    location: 'Downtown Community Center',
    address: '123 Main St, Downtown',
    status: 'confirmed',
    notes: 'Remember to bring ID and eat a good meal beforehand',
    reminderSent: true
  },
  {
    id: 2,
    driveName: 'City Hospital Emergency Drive',
    organizer: 'City General Hospital',
    date: '2024-12-20',
    time: '2:00 PM',
    location: 'City General Hospital',
    address: '456 Healthcare Ave, Medical District',
    status: 'confirmed',
    notes: '',
    reminderSent: false
  },
  {
    id: 3,
    driveName: 'University Student Drive',
    organizer: 'State University Health Center',
    date: '2024-11-20',
    time: '3:30 PM',
    location: 'Student Union Building',
    address: '789 Campus Dr, University District',
    status: 'completed',
    notes: 'Great experience! Received Hero badge.',
    reminderSent: true
  },
  {
    id: 4,
    driveName: 'Community Health Fair',
    organizer: 'Local Health Department',
    date: '2024-11-10',
    time: '11:00 AM',
    location: 'Community Health Center',
    address: '321 Health St, Downtown',
    status: 'cancelled',
    notes: 'Drive was cancelled due to severe weather',
    reminderSent: false
  }
];

export default function MyAppointments() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState('upcoming');

  const upcomingAppointments = mockAppointments.filter(apt => 
    isAfter(new Date(apt.date), new Date()) && apt.status === 'confirmed'
  );

  const pastAppointments = mockAppointments.filter(apt => 
    isBefore(new Date(apt.date), new Date()) || apt.status === 'completed' || apt.status === 'cancelled'
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-destructive" />;
      default:
        return <AlertCircle className="w-4 h-4 text-warning" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-success/10 text-success border-success/20';
      case 'completed':
        return 'bg-success/10 text-success border-success/20';
      case 'cancelled':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-warning/10 text-warning border-warning/20';
    }
  };

  // Get dates with appointments for calendar highlighting
  const appointmentDates = mockAppointments.map(apt => new Date(apt.date));

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
              <span className="text-xl font-bold text-hope-red">Drop of Hope</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Button variant="outline" asChild>
                <Link to="/dashboard">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
              <Button className="bg-hope-red hover:bg-hope-red/90" asChild>
                <Link to="/drives">
                  <Plus className="w-4 h-4 mr-2" />
                  Book New Appointment
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-hope-red mb-4">My Appointments</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Manage your blood donation appointments and view your donation history
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Calendar Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CalendarIcon className="w-5 h-5" />
                  <span>Calendar</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="rounded-md border-0"
                  modifiers={{
                    hasAppointment: appointmentDates,
                  }}
                  modifiersStyles={{
                    hasAppointment: {
                      backgroundColor: 'hsl(var(--hope-red))',
                      color: 'white',
                      borderRadius: '50%'
                    }
                  }}
                />
                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-hope-red rounded-full"></div>
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
            <Card className="border-0 shadow-lg mt-6">
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-3 bg-hope-pink dark:bg-hope-coral rounded-lg">
                  <div className="text-2xl font-bold text-hope-red">{upcomingAppointments.length}</div>
                  <div className="text-sm text-muted-foreground">Upcoming</div>
                </div>
                <div className="text-center p-3 bg-hope-pink dark:bg-hope-coral rounded-lg">
                  <div className="text-2xl font-bold text-hope-red">
                    {pastAppointments.filter(apt => apt.status === 'completed').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </div>
                <div className="text-center p-3 bg-hope-pink dark:bg-hope-coral rounded-lg">
                  <div className="text-2xl font-bold text-hope-red">
                    {pastAppointments.filter(apt => apt.status === 'completed').length * 3}
                  </div>
                  <div className="text-sm text-muted-foreground">Lives Saved</div>
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
                  <Card className="border-0 shadow-lg">
                    <CardContent className="text-center py-12">
                      <CalendarIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">No Upcoming Appointments</h3>
                      <p className="text-muted-foreground mb-6">
                        Schedule your next blood donation to continue helping save lives
                      </p>
                      <Button className="bg-hope-red hover:bg-hope-red/90" asChild>
                        <Link to="/drives">Find Blood Drives</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  upcomingAppointments.map((appointment) => (
                    <Card key={appointment.id} className="border-0 shadow-lg">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-xl text-hope-red">
                              {appointment.driveName}
                            </CardTitle>
                            <p className="text-muted-foreground">{appointment.organizer}</p>
                          </div>
                          <Badge className={getStatusColor(appointment.status)}>
                            {getStatusIcon(appointment.status)}
                            <span className="ml-1 capitalize">{appointment.status}</span>
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="flex items-center space-x-3">
                            <CalendarIcon className="w-5 h-5 text-hope-red" />
                            <div>
                              <p className="font-medium">
                                {format(new Date(appointment.date), 'EEEE, MMM dd')}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(appointment.date), 'yyyy')}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <Clock className="w-5 h-5 text-hope-red" />
                            <div>
                              <p className="font-medium">{appointment.time}</p>
                              <p className="text-sm text-muted-foreground">Local time</p>
                            </div>
                          </div>

                          <div className="flex items-start space-x-3">
                            <MapPin className="w-5 h-5 text-hope-red mt-0.5" />
                            <div>
                              <p className="font-medium">{appointment.location}</p>
                              <p className="text-sm text-muted-foreground">{appointment.address}</p>
                            </div>
                          </div>
                        </div>

                        {appointment.notes && (
                          <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{appointment.notes}</AlertDescription>
                          </Alert>
                        )}

                        <div className="flex space-x-3 pt-4">
                          <Button variant="outline" className="flex-1">
                            Reschedule
                          </Button>
                          <Button variant="outline" className="flex-1">
                            Cancel
                          </Button>
                          <Button className="flex-1 bg-hope-red hover:bg-hope-red/90">
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
                  <Card key={appointment.id} className="border-0 shadow-lg">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl text-hope-red">
                            {appointment.driveName}
                          </CardTitle>
                          <p className="text-muted-foreground">{appointment.organizer}</p>
                        </div>
                        <Badge className={getStatusColor(appointment.status)}>
                          {getStatusIcon(appointment.status)}
                          <span className="ml-1 capitalize">{appointment.status}</span>
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center space-x-3">
                          <CalendarIcon className="w-5 h-5 text-hope-red" />
                          <div>
                            <p className="font-medium">
                              {format(new Date(appointment.date), 'EEEE, MMM dd, yyyy')}
                            </p>
                            <p className="text-sm text-muted-foreground">{appointment.time}</p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <MapPin className="w-5 h-5 text-hope-red mt-0.5" />
                          <div>
                            <p className="font-medium">{appointment.location}</p>
                            <p className="text-sm text-muted-foreground">{appointment.address}</p>
                          </div>
                        </div>

                        {appointment.status === 'completed' && (
                          <div className="flex items-center space-x-3">
                            <Heart className="w-5 h-5 text-hope-red fill-current" />
                            <div>
                              <p className="font-medium text-success">Donation Completed</p>
                              <p className="text-sm text-muted-foreground">+100 points earned</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {appointment.notes && (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{appointment.notes}</AlertDescription>
                        </Alert>
                      )}

                      {appointment.status === 'completed' && (
                        <div className="flex space-x-3 pt-4">
                          <Button variant="outline" className="flex-1">
                            View Certificate
                          </Button>
                          <Button variant="outline" className="flex-1">
                            Share Achievement
                          </Button>
                          <Button className="flex-1 bg-hope-red hover:bg-hope-red/90" asChild>
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
