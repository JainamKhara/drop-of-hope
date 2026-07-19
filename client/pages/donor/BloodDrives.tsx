import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useHybridAuth } from "@/contexts/HybridAuthContext";
import { Drive } from "@/lib/supabase";
import { driveService, feedbackService } from "@/lib/db-services";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PaginationControls } from "@/components/PaginationControls";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
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
  Star,
  MessageSquare,
  Plus,
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface DriveWithDetails extends Drive {
  hospitals?: { name: string; city: string; state: string };
  profiles?: { name: string };
}

export default function BloodDrives() {
  const { donorProfile, adminProfile, isSignedIn } = useHybridAuth();
  const { toast } = useToast();
  const [drives, setDrives] = useState<DriveWithDetails[]>([]);
  const [filteredDrives, setFilteredDrives] = useState<DriveWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBloodType, setSelectedBloodType] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [cityFilter, setCityFilter] = useState("");

  // Feedback modal state
  const [feedbackDriveId, setFeedbackDriveId] = useState<string | null>(null);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);


  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // 3x3 grid

  // Load drives from database on mount
  useEffect(() => {
    loadBloodDrives();
  }, []);

  const loadBloodDrives = async () => {
    try {
      setLoading(true);
      const { data, error } = await driveService.getAll();
      if (error) {
        console.error("Error loading drives:", error);
      }
      const drivesData = data || [];
      setDrives(drivesData);
      setFilteredDrives(drivesData);
    } catch (error) {
      console.error("Error loading drives:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    filterDrives();
  }, [searchQuery, selectedBloodType, selectedDate, cityFilter, drives]);

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
    setCurrentPage(1);
  };

  // Pagination logic
  const paginatedDrives = filteredDrives.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );
  const totalPages = Math.ceil(filteredDrives.length / itemsPerPage);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedBloodType, selectedDate, cityFilter]);

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

  /** Returns true if the drive's end_date+end_time is in the past */
  const isDriveExpired = (drive: DriveWithDetails): boolean => {
    try {
      const endTime = drive.end_time || "23:59:59";
      const timePart = endTime.length === 5 ? `${endTime}:00` : endTime;
      const endDT = new Date(`${drive.end_date}T${timePart}`);
      return endDT < new Date();
    } catch {
      return false;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-[hsl(0,80%,50%)] mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Loading blood drives...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[hsl(0,0%,6%)]">
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[hsl(0,80%,50%)] mb-4">
            Find Blood Drives Near You
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover upcoming blood donation drives in your area and make a
            difference in someone's life today.
          </p>
        </div>

        {/* Filters Section */}
        <Card className="mb-8 border-2 border-[hsl(0,80%,50%)]">
          <CardHeader>
            <CardTitle className="text-[hsl(0,80%,50%)] flex items-center">
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
                    className="justify-start text-left font-normal w-full"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                    classNames={{
                      day_selected:
                        "bg-[hsl(0,80%,50%)] text-white hover:bg-[hsl(0,80%,50%)] hover:text-white focus:bg-[hsl(0,80%,50%)] focus:text-white",
                      day_today:
                        "bg-[hsl(0,0%,98%)]/30 text-[hsl(0,80%,50%)] font-semibold",
                    }}
                  />
                </PopoverContent>
              </Popover>

              {/* Clear Filters */}
              <div className="flex gap-2">
                <Button variant="outline" className="w-full" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
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
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedDrives.map((drive) => {
                const expired = isDriveExpired(drive) || drive.is_active === false;
                const isFull = (drive.registered_count ?? 0) >= drive.capacity;
                return (
                <Card
                  key={drive.id}
                  className={`border-2 transition-shadow ${
                    expired
                      ? "border-gray-300 dark:border-gray-600 opacity-70"
                      : "border-[hsl(0,80%,50%)] hover:shadow-lg"
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className={`text-lg line-clamp-2 ${
                          expired ? "text-gray-400" : "text-[hsl(0,80%,50%)]"
                        }`}>
                          {drive.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          by{" "}
                          {drive.profiles?.name ||
                            drive.hospitals?.name ||
                            "Unknown Organizer"}
                        </p>
                      </div>
                      {expired ? (
                        <Badge variant="secondary" className="bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-0">
                          Ended
                        </Badge>
                      ) : (
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
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Location */}
                      <div className="flex items-start space-x-2">
                        <MapPin className="w-4 h-4 text-[hsl(0,80%,50%)] mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium">{drive.location}</p>
                          <p className="text-xs text-muted-foreground">
                            {drive.address}, {drive.city}, {drive.state}
                          </p>
                        </div>
                      </div>

                      {/* Date and Time */}
                      <div className="flex items-center space-x-2">
                        <CalendarIcon className="w-4 h-4 text-[hsl(0,80%,50%)]" />
                        <p className="text-sm">
                          {new Date(drive.start_date).toLocaleDateString()}
                          {drive.start_date !== drive.end_date &&
                            ` - ${new Date(drive.end_date).toLocaleDateString()}`}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-[hsl(0,80%,50%)]" />
                        <p className="text-sm">
                          {drive.start_time} - {drive.end_time}
                        </p>
                      </div>

                      {/* Capacity */}
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-[hsl(0,80%,50%)]" />
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
                                  className="text-xs border-[hsl(0,80%,50%)] text-[hsl(0,80%,50%)]"
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
                          asChild={!expired && !isFull}
                          className={`flex-1 text-white ${
                            expired
                              ? "bg-gray-400 cursor-not-allowed hover:bg-gray-400"
                              : "bg-[hsl(0,80%,50%)] hover:bg-[hsl(0,80%,50%)]/90"
                          }`}
                          disabled={expired || isFull}
                        >
                          {expired || isFull ? (
                            <span>{expired ? "Drive Ended" : "Full"}</span>
                          ) : (
                            <Link to={`/book-appointment/${drive.id}`}>
                              Book Appointment
                            </Link>
                          )}
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
                        {/* Feedback button for ended drives */}
                        {expired && isSignedIn && (
                          <Button
                            variant="outline"
                            size="icon"
                            title="Leave Feedback"
                            onClick={() => {
                              setFeedbackDriveId(drive.id);
                              setFeedbackRating(0);
                              setFeedbackText("");
                            }}
                          >
                            <MessageSquare className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                );
              })}
            </div>
            <PaginationControls 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={setCurrentPage} 
            />
          </div>
        ) : (
          <Card className="border-2 border-[hsl(0,80%,50%)]">
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
        {adminProfile && (
          <Card className="mt-8 border-2 border-[hsl(0,80%,50%)] bg-[hsl(0,0%,98%)] dark:bg-[hsl(0,0%,6%)]">
            <CardContent className="text-center py-8">
              <h3 className="text-xl font-semibold text-[hsl(0,80%,50%)] mb-2">
                Want to organize a blood drive?
              </h3>
              <p className="text-muted-foreground mb-4">
                Help save lives by organizing a blood drive in your community.
              </p>
              <Button
                asChild
                className="bg-[hsl(0,80%,50%)] hover:bg-[hsl(0,80%,50%)]/90 text-white"
              >
                <Link to="/admin">Organize a Drive</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Feedback Dialog */}
      <Dialog
        open={!!feedbackDriveId}
        onOpenChange={(open) => !open && setFeedbackDriveId(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[hsl(0,80%,50%)]" />
              Leave Your Feedback
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-sm font-medium">Your Rating</Label>
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFeedbackRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-7 h-7 transition-colors ${
                        star <= feedbackRating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="feedback-text" className="text-sm font-medium">
                Comments (optional)
              </Label>
              <Textarea
                id="feedback-text"
                placeholder="Share your experience at this blood drive..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                rows={4}
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFeedbackDriveId(null)}>
              Cancel
            </Button>
            <Button
              className="bg-[hsl(0,80%,50%)] hover:bg-[hsl(0,80%,50%)]/90 text-white"
              disabled={feedbackRating === 0 || isSubmittingFeedback}
              onClick={async () => {
                if (!donorProfile?.id || !feedbackDriveId) return;
                
                try {
                  setIsSubmittingFeedback(true);
                  const { error } = await feedbackService.submit({
                    donor_id: donorProfile.id,
                    drive_id: feedbackDriveId,
                    rating: feedbackRating,
                    comment: feedbackText
                  });

                  if (error) throw error;

                  toast({
                    title: "Feedback submitted!",
                    description: `Thank you for your ${feedbackRating}-star rating.`,
                  });
                  setFeedbackDriveId(null);
                } catch (error) {
                  console.error("Feedback submission error:", error);
                  toast({
                    title: "Submission failed",
                    description: "We couldn't save your feedback. Please try again.",
                    variant: "destructive"
                  });
                } finally {
                  setIsSubmittingFeedback(false);
                }
              }}
            >
              {isSubmittingFeedback ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                "Submit Feedback"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
