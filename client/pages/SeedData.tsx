import { seedTestData, testCredentials } from "../lib/seedData";
import { Button } from "../components/ui/button";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";

const SeedData = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  const handleSeedTestData = async () => {
    setLoading(true);
    setResult(null);
    try {
      // Seed the test data with passwords
      const response = await seedTestData();
      setResult(response);
      if (response.success) {
        alert("Test data seeded successfully!");
      } else {
        alert("Failed to seed test data. Check the console for details.");
      }
    } catch (error) {
      console.error("Error seeding test data:", error);
      setResult({
        success: false,
        message: "Error seeding test data",
        error: error
      });
      alert("Failed to seed test data. Check the console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-3xl font-bold mb-2">Database Seed Utility</h1>
      <p className="text-gray-500 mb-6">
        Use this utility to populate the database with test data for development and testing purposes.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Seed Test Data</CardTitle>
            <CardDescription>
              Populate the database with test users, hospitals, and other entities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm">
              This will create test records for:
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline">{testCredentials.admin.length} Admins</Badge>
                <Badge variant="outline">{testCredentials.donor.length} Donors</Badge>
                <Badge variant="outline">{testCredentials.hospital.length} Hospitals</Badge>
              </div>
            </p>
            <Button
              onClick={handleSeedTestData}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Seeding..." : "Seed Test Data"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Password Information</CardTitle>
            <CardDescription>
              About the stored passwords
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm">
              Passwords are now stored directly in the admin and hospital tables. No separate auth users are needed.
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline">Simple Authentication</Badge>
                <Badge variant="outline">Direct DB Storage</Badge>
              </div>
            </p>
          </CardContent>
        </Card>
      </div>

      {result && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Operation Result</CardTitle>
            <CardDescription>
              {result.success
                ? "Operation completed successfully"
                : "Operation failed - check details below"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-md border">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={result.success ? "default" : "destructive"}>
                  {result.success ? "Success" : "Error"}
                </Badge>
                <span className="text-sm font-medium">{result.message}</span>
              </div>
              
              {result.details && (
                <>
                  <Separator className="my-3" />
                  <div className="text-sm">
                    <h4 className="font-semibold mb-1">Details:</h4>
                    <pre className="bg-gray-100 p-3 rounded overflow-auto max-h-60 text-xs">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  </div>
                </>
              )}
              
              {result.error && (
                <>
                  <Separator className="my-3" />
                  <div className="text-sm text-red-600">
                    <h4 className="font-semibold mb-1">Error:</h4>
                    <pre className="bg-red-50 p-3 rounded overflow-auto max-h-60 text-xs">
                      {JSON.stringify(result.error, null, 2)}
                    </pre>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Test Credentials</CardTitle>
          <CardDescription>
            Use these credentials to log in as test users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="admin">
            <TabsList className="mb-4">
              <TabsTrigger value="admin">Admin Users</TabsTrigger>
              <TabsTrigger value="donor">Donor Users</TabsTrigger>
              <TabsTrigger value="hospital">Hospital Users</TabsTrigger>
            </TabsList>
            
            <TabsContent value="admin">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {testCredentials.admin.map((cred, i) => (
                  <div key={i} className="border rounded-md p-3">
                    <div className="font-medium">{cred.email}</div>
                    <div className="text-sm text-gray-500">Password: {cred.password}</div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="donor">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {testCredentials.donor.map((cred, i) => (
                  <div key={i} className="border rounded-md p-3">
                    <div className="font-medium">{cred.email}</div>
                    <div className="text-sm text-gray-500">Password: {cred.password}</div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="hospital">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {testCredentials.hospital.map((cred, i) => (
                  <div key={i} className="border rounded-md p-3">
                    <div className="font-medium">{cred.email}</div>
                    <div className="text-sm text-gray-500">Password: {cred.password}</div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SeedData;