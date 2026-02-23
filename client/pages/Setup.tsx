import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, ArrowLeft } from "lucide-react";
import AdminSetup from "@/components/AdminSetup";

export default function Setup() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-background">
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <AdminSetup />
      </div>
    </div>
  );
}
