import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, ArrowLeft } from "lucide-react";

export default function Setup() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-background">
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h1 className="text-4xl font-bold text-[hsl(0,80%,50%)]">
            Drop of Hope
          </h1>
          <p className="text-lg text-muted-foreground">
            Welcome to the Blood Donation Management System
          </p>
          <div className="space-y-4">
            <Link to="/">
              <Button className="w-full" size="lg">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Return to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
