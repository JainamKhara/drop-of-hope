import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { seedTestData, testCredentials } from "@/lib/seedData";
import {
  Database,
  Users,
  Building2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export const AdminSetup = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message?: string;
    error?: any;
  } | null>(null);

  const handleSeedData = async () => {
    setLoading(true);
    setResult(null);

    try {
      const result = await seedTestData();
      setResult(result);
    } catch (error) {
      setResult({ success: false, error });
    } finally {
      setLoading(false);
    }
  };

  // Note: We no longer create auth users, as passwords are stored directly in the tables

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[hsl(0,80%,50%)] mb-2">
          Database Setup
        </h1>
        <p className="text-muted-foreground">
          Initialize the database with test data for admin, donor, and hospital
          users
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Seed Database Profiles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="w-5 h-5 text-blue-600" />
              <span>Seed Database Profiles</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Add test admin and hospital user profiles to the database.
            </p>
            <Button
              onClick={handleSeedData}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Seeding..." : "Seed Profiles Data"}
            </Button>
          </CardContent>
        </Card>

        {/* Note about passwords */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-green-600" />
              <span>Password Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Passwords are now stored directly in the admin and hospital
              tables. No separate auth users are needed.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Result Display */}
      {result && (
        <Alert variant={result.success ? "default" : "destructive"}>
          {result.success ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>
            {result.success
              ? result.message || "Operation completed successfully!"
              : `Error: ${result.error?.message || "Unknown error occurred"}`}
          </AlertDescription>
        </Alert>
      )}

      {/* Test Credentials Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-blue-600">Admin Credentials</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {testCredentials.admin.map((user, index) => (
                <div key={index} className="p-2 bg-blue-50 rounded">
                  <div className="font-medium">{user.email}</div>
                  <div className="text-xs text-muted-foreground">
                    Password: {user.password}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-[hsl(0,80%,50%)]">
              Donor Credentials
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {testCredentials.donor.map((user, index) => (
                <div key={index} className="p-2 bg-red-50 rounded">
                  <div className="font-medium">{user.email}</div>
                  <div className="text-xs text-muted-foreground">
                    Password: {user.password}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">
              Hospital Credentials
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {testCredentials.hospital.map((user, index) => (
                <div key={index} className="p-2 bg-green-50 rounded">
                  <div className="font-medium">{user.email}</div>
                  <div className="text-xs text-muted-foreground">
                    Password: {user.password}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>
              <strong>Step 1:</strong> Click "Seed Profiles Data" to add test
              user profiles to the database.
            </p>
            <p>
              <strong>Step 2:</strong> Passwords are stored directly in the
              admin and hospital tables. No separate auth users are needed.
            </p>
            <p>
              <strong>Step 3:</strong> Use the credentials above to test
              role-based login functionality.
            </p>
            <p>
              <strong>Note:</strong> Make sure your Supabase anon key is
              properly configured in the environment variables.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSetup;
