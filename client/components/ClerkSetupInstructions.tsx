import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExternalLink, Key, Settings, CheckCircle } from "lucide-react";

export default function ClerkSetupInstructions() {
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-blue-800">
            <Key className="w-5 h-5 mr-2" />
            Clerk Authentication Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Settings className="h-4 w-4" />
            <AlertDescription>
              Your Clerk publishable key is invalid or missing. Follow these
              steps to get the correct key.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-800">
                1
              </div>
              <div>
                <p className="font-medium">Access Clerk Dashboard</p>
                <p className="text-sm text-gray-600 mb-2">
                  Go to your Clerk dashboard and navigate to API Keys
                </p>
                <Button asChild variant="outline" size="sm">
                  <a
                    href="https://dashboard.clerk.com/last-active?path=api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open Clerk Dashboard
                  </a>
                </Button>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-800">
                2
              </div>
              <div>
                <p className="font-medium">Copy Publishable Key</p>
                <p className="text-sm text-gray-600">
                  Find your Publishable Key (starts with{" "}
                  <code className="bg-gray-100 px-1 rounded">pk_</code>) and
                  copy it
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-800">
                3
              </div>
              <div>
                <p className="font-medium">Update Environment Variable</p>
                <p className="text-sm text-gray-600 mb-2">
                  Set the{" "}
                  <code className="bg-gray-100 px-1 rounded">
                    VITE_CLERK_PUBLISHABLE_KEY
                  </code>{" "}
                  environment variable
                </p>
                <div className="bg-gray-50 p-2 rounded text-xs font-mono">
                  VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_actual_key_here
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-sm">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium">Restart Development Server</p>
                <p className="text-sm text-gray-600">
                  Restart your dev server for changes to take effect
                </p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 p-3 rounded">
            <p className="text-sm font-medium text-yellow-800 mb-1">
              Current Status:
            </p>
            <p className="text-xs text-yellow-700">
              Key: {import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "Not set"}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-4">
          <p className="text-sm text-green-800">
            <strong>Note:</strong> Admin and Hospital authentication will
            continue to work normally using Supabase. Only donor authentication
            requires Clerk setup.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
