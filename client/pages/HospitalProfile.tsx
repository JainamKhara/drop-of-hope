import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Heart,
  CheckCircle2,
} from "lucide-react";
import { hospitalService, driveService } from "@/lib/db-services";
import { format } from "date-fns";
import { PaginationControls } from "@/components/PaginationControls";

export default function HospitalProfile() {
  const { id } = useParams<{ id: string }>();
  const [hospital, setHospital] = useState<any>(null);
  const [drives, setDrives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      const [hospResult, drivesResult] = await Promise.all([
        hospitalService.getById(id),
        driveService.getAll(),
      ]);
      if (hospResult.error || !hospResult.data) {
        setError("Hospital not found.");
      } else {
        setHospital(hospResult.data);
        const filtered = (drivesResult.data || []).filter(
          (d: any) => d.hospital_id === id,
        );
        setDrives(filtered);
      }
      setLoading(false);
    };
    load();
  }, [id]);

  const [drivesPage, setDrivesPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(drives.length / itemsPerPage);
  const paginatedDrives = drives.slice((drivesPage - 1) * itemsPerPage, drivesPage * itemsPerPage);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[hsl(0,80%,50%)] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !hospital) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>{error || "Hospital not found."}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[hsl(0,0%,6%)]">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            asChild
            className="text-[hsl(0,80%,50%)] hover:text-[hsl(0,80%,50%)]/80 -ml-2"
          >
            <Link to="/drives">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Drives
            </Link>
          </Button>
        </div>

        {/* Hospital Header */}
        <Card className="border-2 border-[hsl(0,80%,50%)] rounded-sm mb-6">
          <CardContent className="p-8">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 bg-[hsl(0,80%,50%)] rounded-2xl flex items-center justify-center flex-shrink-0">
                <Building2 className="w-10 h-10 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-[hsl(0,80%,50%)]">
                    {hospital.name}
                  </h1>
                  {hospital.is_verified && (
                    <Badge className="bg-success/10 text-success border-success/20 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Verified
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap gap-4 text-muted-foreground text-sm">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {hospital.address}, {hospital.city}, {hospital.state}
                  </span>
                  {hospital.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      {hospital.phone}
                    </span>
                  )}
                  {hospital.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {hospital.email}
                    </span>
                  )}
                </div>
                {hospital.contact_person && (
                  <p className="text-sm mt-2 text-muted-foreground">
                    Contact person:{" "}
                    <strong className="text-foreground">
                      {hospital.contact_person}
                    </strong>
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Blood Drives */}
        <Card className="border-2 border-[hsl(0,80%,50%)] rounded-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-[hsl(0,80%,50%)] fill-current" />
              Upcoming Blood Drives
              <Badge className="ml-2">{drives.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {drives.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <Calendar className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p>No upcoming drives scheduled.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {paginatedDrives.map((drive: any) => (
                  <div
                    key={drive.id}
                    className="p-4 border border-border rounded-sm hover:border-[hsl(0,80%,50%)]/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-lg">{drive.name}</h3>
                        <div className="flex flex-wrap gap-3 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {drive.start_date
                              ? format(
                                  new Date(drive.start_date),
                                  "MMM d, yyyy",
                                )
                              : "TBD"}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {drive.location || drive.city}
                          </span>
                        </div>
                        {drive.blood_types_needed?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {drive.blood_types_needed.map((t: string) => (
                              <Badge
                                key={t}
                                variant="outline"
                                className="text-xs border-[hsl(0,80%,50%)]/30 text-[hsl(0,80%,50%)]"
                              >
                                {t}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-medium">
                          {drive.registered_count}/{drive.capacity_slots}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          registered
                        </p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Button
                        asChild
                        size="sm"
                        className="bg-[hsl(0,80%,50%)] hover:bg-[hsl(0,80%,50%)]/90 text-white"
                      >
                        <Link to={`/book-appointment/${drive.id}`}>
                          Book a Slot
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}

                {totalPages > 1 && (
                  <div className="pt-4 border-t">
                    <PaginationControls
                      currentPage={drivesPage}
                      totalPages={totalPages}
                      onPageChange={setDrivesPage}
                    />
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
