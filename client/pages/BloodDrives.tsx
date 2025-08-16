import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Heart, MapPin, Calendar as CalendarIcon, Clock, Users, Search, Filter, ArrowLeft, Navigation } from 'lucide-react';
import { format } from 'date-fns';

// Mock data for blood drives
const mockBloodDrives = [
  {
    id: 1,
    name: 'Red Cross Downtown Drive',
    organizer: 'American Red Cross',
    location: 'Downtown Community Center',
    address: '123 Main St, Downtown',
    date: '2024-12-15',
    time: '10:00 AM - 4:00 PM',
    bloodTypes: ['O+', 'O-', 'A+', 'B+'],
    capacity: 50,
    registered: 32,
    distance: '0.5 miles',
    coordinates: { lat: 40.7128, lng: -74.0060 },
    description: 'Annual holiday blood drive to help save lives during the holiday season.',
    requirements: ['Valid ID', 'Age 17+', 'Weight 110+ lbs'],
    contact: 'contact@redcross.org'
  },
  {
    id: 2,
    name: 'City Hospital Emergency Drive',
    organizer: 'City General Hospital',
    location: 'City General Hospital',
    address: '456 Healthcare Ave, Medical District',
    date: '2024-12-18',
    time: '8:00 AM - 6:00 PM',
    bloodTypes: ['O-', 'A-', 'B-', 'AB-'],
    capacity: 75,
    registered: 45,
    distance: '1.2 miles',
    coordinates: { lat: 40.7589, lng: -73.9851 },
    description: 'Emergency blood drive due to high demand during winter season.',
    requirements: ['Valid ID', 'Age 17+', 'Good health'],
    contact: 'bloodbank@cityhospital.org'
  },
  {
    id: 3,
    name: 'University Student Drive',
    organizer: 'State University Health Center',
    location: 'Student Union Building',
    address: '789 Campus Dr, University District',
    date: '2024-12-20',
    time: '12:00 PM - 8:00 PM',
    bloodTypes: ['All Types Welcome'],
    capacity: 40,
    registered: 28,
    distance: '2.1 miles',
    coordinates: { lat: 40.6892, lng: -74.0445 },
    description: 'Student-organized blood drive with pizza and prizes for donors!',
    requirements: ['Student ID or Valid ID', 'Age 17+'],
    contact: 'health@university.edu'
  }
];

export default function BloodDrives() {
  const [searchLocation, setSearchLocation] = useState('');
  const [selectedBloodType, setSelectedBloodType] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [filteredDrives, setFilteredDrives] = useState(mockBloodDrives);

  const bloodTypes = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

  const handleSearch = () => {
    let filtered = mockBloodDrives;

    // Filter by blood type
    if (selectedBloodType) {
      filtered = filtered.filter(drive => 
        drive.bloodTypes.includes(selectedBloodType) || 
        drive.bloodTypes.includes('All Types Welcome')
      );
    }

    // Filter by date
    if (selectedDate) {
      const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
      filtered = filtered.filter(drive => drive.date === selectedDateStr);
    }

    // Filter by location (simple text search)
    if (searchLocation) {
      filtered = filtered.filter(drive =>
        drive.location.toLowerCase().includes(searchLocation.toLowerCase()) ||
        drive.address.toLowerCase().includes(searchLocation.toLowerCase())
      );
    }

    setFilteredDrives(filtered);
  };

  React.useEffect(() => {
    handleSearch();
  }, [selectedBloodType, selectedDate, searchLocation]);

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
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-hope-red mb-4">Find Blood Drives</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover blood donation opportunities in your area and help save lives
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="w-5 h-5" />
              <span>Search & Filter</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Location Search */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Enter city or address"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Blood Type Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Blood Type Needed</label>
                <Select value={selectedBloodType} onValueChange={setSelectedBloodType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All blood types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All blood types</SelectItem>
                    {bloodTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {selectedDate ? format(selectedDate, 'MMM dd, yyyy') : 'Any date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* View Mode Toggle */}
              <div className="space-y-2">
                <label className="text-sm font-medium">View</label>
                <div className="flex space-x-2">
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    onClick={() => setViewMode('list')}
                    className="flex-1"
                  >
                    List
                  </Button>
                  <Button
                    variant={viewMode === 'map' ? 'default' : 'outline'}
                    onClick={() => setViewMode('map')}
                    className="flex-1"
                  >
                    Map
                  </Button>
                </div>
              </div>
            </div>

            {/* Clear Filters */}
            <div className="mt-4 flex justify-end">
              <Button
                variant="ghost"
                onClick={() => {
                  setSearchLocation('');
                  setSelectedBloodType('');
                  setSelectedDate(undefined);
                  setFilteredDrives(mockBloodDrives);
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-muted-foreground">
            Found {filteredDrives.length} blood drive{filteredDrives.length !== 1 ? 's' : ''} near you
          </p>
          <Button variant="outline" size="sm">
            <Navigation className="w-4 h-4 mr-2" />
            Use My Location
          </Button>
        </div>

        {/* Drive List */}
        {viewMode === 'list' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredDrives.map((drive) => (
              <Card key={drive.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl text-hope-red">{drive.name}</CardTitle>
                      <p className="text-muted-foreground">{drive.organizer}</p>
                    </div>
                    <Badge variant="secondary" className="bg-hope-pink text-hope-red">
                      {drive.distance}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Location */}
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-hope-red mt-0.5" />
                    <div>
                      <p className="font-medium">{drive.location}</p>
                      <p className="text-sm text-muted-foreground">{drive.address}</p>
                    </div>
                  </div>

                  {/* Date & Time */}
                  <div className="flex items-center space-x-3">
                    <CalendarIcon className="w-5 h-5 text-hope-red" />
                    <div>
                      <p className="font-medium">{format(new Date(drive.date), 'EEEE, MMMM dd, yyyy')}</p>
                      <p className="text-sm text-muted-foreground">{drive.time}</p>
                    </div>
                  </div>

                  {/* Capacity */}
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-hope-red" />
                    <div>
                      <p className="font-medium">{drive.registered}/{drive.capacity} registered</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-hope-red h-2 rounded-full" 
                          style={{ width: `${(drive.registered / drive.capacity) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Blood Types */}
                  <div>
                    <p className="text-sm font-medium mb-2">Blood types needed:</p>
                    <div className="flex flex-wrap gap-2">
                      {drive.bloodTypes.map((type, index) => (
                        <Badge key={index} variant="outline" className="border-hope-red text-hope-red">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground">{drive.description}</p>

                  {/* Actions */}
                  <div className="flex space-x-3 pt-4">
                    <Button className="flex-1 bg-hope-red hover:bg-hope-red/90" asChild>
                      <Link to={`/book-appointment/${drive.id}`}>
                        Book Appointment
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link to={`/drive-details/${drive.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* Map View Placeholder */
          <Card className="border-0 shadow-lg h-96">
            <CardContent className="h-full flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-16 h-16 text-hope-red mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Interactive Map</h3>
                <p className="text-muted-foreground mb-4">
                  Map integration would show blood drives with interactive markers
                </p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• Google Maps or Mapbox integration</p>
                  <p>• Clickable markers for each drive</p>
                  <p>• Route navigation to selected drives</p>
                  <p>• Real-time location updates</p>
                </div>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setViewMode('list')}
                >
                  Back to List View
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Results */}
        {filteredDrives.length === 0 && (
          <Card className="border-0 shadow-lg">
            <CardContent className="text-center py-12">
              <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No blood drives found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search criteria or check back later for new drives
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchLocation('');
                  setSelectedBloodType('');
                  setSelectedDate(undefined);
                  setFilteredDrives(mockBloodDrives);
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
