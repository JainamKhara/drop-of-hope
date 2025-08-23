import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useHybridAuth } from "@/contexts/HybridAuthContext";
import { db, Drive } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Heart,
  MapPin,
  Calendar as CalendarIcon,
  Clock,
  Users,
  Search,
  Filter,
  ArrowLeft,
  Navigation,
  RefreshCw,
} from "lucide-react";
import { format } from "date-fns";

interface DriveWithDetails extends Drive {
  hospitals?: { name: string; city: string; state: string };
  profiles?: { name: string };
}

export default function BloodDrives() {
  const { donorProfile, isSignedIn } = useHybridAuth();
  const [drives, setDrives] = useState<DriveWithDetails[]>([]);
  const [filteredDrives, setFilteredDrives] = useState<DriveWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBloodType, setSelectedBloodType] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [cityFilter, setCityFilter] = useState("");

  useEffect(() => {
    loadBloodDrives();
  }, []);

  useEffect(() => {
    filterDrives();
  }, [drives, searchQuery, selectedBloodType, selectedDate, cityFilter]);

  const loadBloodDrives = async () => {
    setLoading(true);
    try {
      const { data, error } = await db.getDrives();
      if (error) {
        console.error("Error loading blood drives:", error);
      } else {
        setDrives(data || []);
      }
    } catch (error) {
      console.error("Error loading blood drives:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterDrives = () => {
    let filtered = drives;

    // Filter by search query (name, location, organizer)
    if (searchQuery) {
      filtered = filtered.filter(
        (drive) =>
          drive.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          drive.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          drive.profiles?.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          drive.hospitals?.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()),
      );
    }

    // Filter by blood type
    if (selectedBloodType) {
      filtered = filtered.filter((drive) =>
        drive.blood_types_needed?.includes(selectedBloodType),
      );
    }

    // Filter by date
    if (selectedDate) {
      const selectedDateString = format(selectedDate, "yyyy-MM-dd");
      filtered = filtered.filter(
        (drive) =>
          drive.start_date <= selectedDateString &&
          drive.end_date >= selectedDateString,
      );
    }

    // Filter by city
    if (cityFilter) {
      filtered = filtered.filter((drive) =>
        drive.city.toLowerCase().includes(cityFilter.toLowerCase()),
      );
    }

    setFilteredDrives(filtered);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedBloodType("");
    setSelectedDate(undefined);
    setCityFilter("");
  };

  const getAvailabilityColor = (registered: number, capacity: number) => {
    const percentage = (registered / capacity) * 100;
    if (percentage >= 90) return "text-red-600";
    if (percentage >= 70) return "text-yellow-600";
    return "text-green-600";
  };

  const getAvailabilityText = (registered: number, capacity: number) => {
    const percentage = (registered / capacity) * 100;
    if (percentage >= 90) return "Almost Full";
    if (percentage >= 70) return "Filling Up";
    return "Available";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-hope-red mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Loading blood drives...</p>
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

            <div className="flex items-center space-x-4">
              <Button variant="outline" asChild>
                <Link to={isSignedIn ? "/dashboard" : "/"}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {isSignedIn ? "Dashboard" : "Home"}
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
          <h1 className="text-4xl font-bold text-hope-red mb-4">
            Find Blood Drives Near You
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover upcoming blood donation drives in your area and make a
            difference in someone's life today.
          </p>
        </div>

        {/* Filters Section */}
        <Card className="mb-8 border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-hope-red flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Filter Drives
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search drives..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* City Filter */}
              <Input
                placeholder="Filter by city..."
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
              />

              {/* Blood Type Filter */}
              <Select
                value={selectedBloodType}
                onValueChange={setSelectedBloodType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Blood Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
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

              {/* Date Filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
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

              {/* Clear Filters */}
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {filteredDrives.length} of {drives.length} blood drives
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={loadBloodDrives}
                className="flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Blood Drives Grid */}
        {filteredDrives.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDrives.map((drive) => (
              <Card
                key={drive.id}
                className="border-0 shadow-md hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg text-hope-red line-clamp-2">
                        {drive.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        by{" "}
                        {drive.profiles?.name ||
                          drive.hospitals?.name ||
                          "Unknown Organizer"}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={`${getAvailabilityColor(
                        drive.registered_count || 0,
                        drive.capacity,
                      )} bg-transparent border`}
                    >
                      {getAvailabilityText(
                        drive.registered_count || 0,
                        drive.capacity,
                      )}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Location */}
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-4 h-4 text-hope-red mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">{drive.location}</p>
                        <p className="text-xs text-muted-foreground">
                          {drive.address}, {drive.city}, {drive.state}
                        </p>
                      </div>
                    </div>

                    {/* Date and Time */}
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="w-4 h-4 text-hope-red" />
                      <p className="text-sm">
                        {new Date(drive.start_date).toLocaleDateString()}
                        {drive.start_date !== drive.end_date &&
                          ` - ${new Date(drive.end_date).toLocaleDateString()}`}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-hope-red" />
                      <p className="text-sm">
                        {drive.start_time} - {drive.end_time}
                      </p>
                    </div>

                    {/* Capacity */}
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-hope-red" />
                      <p className="text-sm">
                        {drive.registered_count || 0}/{drive.capacity}{" "}
                        registered
                      </p>
                    </div>

                    {/* Blood Types Needed */}
                    {drive.blood_types_needed &&
                      drive.blood_types_needed.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">
                            Blood Types Needed:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {drive.blood_types_needed.map((type) => (
                              <Badge
                                key={type}
                                variant="outline"
                                className="text-xs border-hope-red text-hope-red"
                              >
                                {type}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Description */}
                    {drive.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {drive.description}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex space-x-2 pt-2">
                      <Button
                        asChild
                        className="flex-1 bg-hope-red hover:bg-hope-red/90"
                        disabled={drive.registered_count >= drive.capacity}
                      >
                        <Link to={`/book-appointment/${drive.id}`}>
                          {drive.registered_count >= drive.capacity
                            ? "Full"
                            : "Book Appointment"}
                        </Link>
                      </Button>
                      {drive.latitude && drive.longitude && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            window.open(
                              `https://maps.google.com/?q=${drive.latitude},${drive.longitude}`,
                              "_blank",
                            )
                          }
                        >
                          <Navigation className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-0 shadow-md">
            <CardContent className="text-center py-12">
              <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                No Blood Drives Found
              </h3>
              <p className="text-muted-foreground mb-6">
                {drives.length === 0
                  ? "There are currently no blood drives scheduled."
                  : "No drives match your current filters. Try adjusting your search criteria."}
              </p>
              {drives.length > 0 && (
                <Button onClick={clearFilters} variant="outline">
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Call to Action for Creating Drives */}
        {user && profile?.role === "admin" && (
          <Card className="mt-8 border-0 shadow-md bg-hope-pink dark:bg-hope-coral">
            <CardContent className="text-center py-8">
              <h3 className="text-xl font-semibold text-hope-red mb-2">
                Want to organize a blood drive?
              </h3>
              <p className="text-muted-foreground mb-4">
                Help save lives by organizing a blood drive in your community.
              </p>
              <Button asChild className="bg-hope-red hover:bg-hope-red/90">
                <Link to="/admin">Organize a Drive</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
