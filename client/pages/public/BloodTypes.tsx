import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, ArrowLeft, CheckCircle2, XCircle, TrendingUp, TrendingDown } from "lucide-react";

const BLOOD_TYPES = ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"] as const;

// canDonateTo[donor] = list of compatible recipients
const COMPATIBILITY: Record<string, string[]> = {
  "O-": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"],
  "O+": ["O+", "A+", "B+", "AB+"],
  "A-": ["A-", "A+", "AB-", "AB+"],
  "A+": ["A+", "AB+"],
  "B-": ["B-", "B+", "AB-", "AB+"],
  "B+": ["B+", "AB+"],
  "AB-": ["AB-", "AB+"],
  "AB+": ["AB+"],
};

const FACTS: Record<string, { label: string; color: string; fact: string }> = {
  "O-": {
    label: "Universal Donor",
    color: "bg-red-600 text-white",
    fact: "Can donate red blood cells to any blood type. Only 7% of the population.",
  },
  "O+": {
    label: "Most Common",
    color: "bg-red-400 text-white",
    fact: "Found in 38% of the population. Compatible with O+, A+, B+, AB+ recipients.",
  },
  "A-": {
    label: "Rare",
    color: "bg-blue-600 text-white",
    fact: "Only 6% of people have A-. Important for patients with rare blood types.",
  },
  "A+": {
    label: "Common",
    color: "bg-blue-400 text-white",
    fact: "Second most common type at 34%. Compatible with A+ and AB+ recipients.",
  },
  "B-": {
    label: "Rare",
    color: "bg-green-600 text-white",
    fact: "Only 2% of the population. Valuable for B and AB recipients.",
  },
  "B+": {
    label: "Common",
    color: "bg-green-400 text-white",
    fact: "About 9% of the population. Compatible with B+ and AB+ recipients.",
  },
  "AB-": {
    label: "Universal Plasma",
    color: "bg-orange-600 text-white",
    fact: "Rarest type — only 1%. Can donate plasma to all blood types.",
  },
  "AB+": {
    label: "Universal Recipient",
    color: "bg-orange-400 text-white",
    fact: "Can receive blood from any type. About 3% of the population.",
  },
};

export default function BloodTypes() {
  const [selectedType, setSelectedType] = React.useState<string>("O-");

  return (
    <div className="min-h-screen bg-gradient-to-b from-[hsl(0,0%,98%)] to-white dark:from-[hsl(14,100%,50%)] dark:to-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            asChild
            className="text-[hsl(0,80%,50%)] hover:text-[hsl(0,80%,50%)]/80 -ml-2"
          >
            <Link to="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>
        </div>

        <div className="text-center mb-10">
          <div className="w-20 h-20 mx-auto mb-4">
            <img src="/drop_of_hope_logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-4xl font-bold text-[hsl(0,80%,50%)] mb-2">
            Blood Type Guide
          </h1>
          <p className="text-muted-foreground text-lg">
            Understand compatibility, facts, and why every type matters
          </p>
        </div>

        {/* Blood Type Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {BLOOD_TYPES.map((type) => (
            <Card
              key={type}
              className="border-2 border-[hsl(0,80%,50%)] rounded-sm hover:shadow-xl transition-shadow"
            >
              <CardHeader className="pb-3 text-center">
                <div className="w-14 h-14 bg-[hsl(0,80%,50%)] rounded-sm mx-auto mb-2 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">{type}</span>
                </div>
                <Badge className={FACTS[type].color}>{FACTS[type].label}</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center">
                  {FACTS[type].fact}
                </p>
                <div className="mt-3 text-xs text-center text-muted-foreground">
                  Can donate to:{" "}
                  <strong className="text-foreground">
                    {COMPATIBILITY[type].join(", ")}
                  </strong>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Interactive Compatibility Calculator */}
        <Card className="border-2 border-[hsl(0,80%,50%)] rounded-sm mb-8 overflow-hidden">
          <CardHeader className="bg-[hsl(0,80%,50%)]/5">
            <CardTitle className="flex items-center space-x-2 text-[hsl(0,80%,50%)]">
              <Heart className="w-5 h-5 fill-current text-[hsl(0,80%,50%)]" />
              <span>Interactive Blood Compatibility Calculator</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Select a blood type below to visualize compatibility rules instantly
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-2 justify-center mb-6">
              {BLOOD_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg border-2 transition-all ${
                    selectedType === type
                      ? "bg-[hsl(0,80%,50%)] border-[hsl(0,80%,50%)] text-white scale-110 shadow-lg"
                      : "bg-background border-border hover:border-[hsl(0,80%,50%)]/50 text-foreground"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Can Give To */}
              <div className="p-4 rounded-sm border border-border bg-muted/10">
                <h3 className="font-bold text-lg mb-3 flex items-center text-[hsl(0,80%,50%)]">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  <span>If you are {selectedType}, you can give to:</span>
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  {BLOOD_TYPES.map((type) => {
                    const isCompatible = COMPATIBILITY[selectedType].includes(type);
                    return (
                      <div
                        key={type}
                        className={`p-3 rounded-sm text-center font-bold border transition-all ${
                          isCompatible
                            ? "bg-green-100 dark:bg-green-950/30 border-green-500 text-green-700 dark:text-green-400"
                            : "bg-muted/30 border-transparent text-muted-foreground/30"
                        }`}
                      >
                        {type}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Can Receive From */}
              <div className="p-4 rounded-sm border border-border bg-muted/10">
                <h3 className="font-bold text-lg mb-3 flex items-center text-[hsl(0,80%,50%)]">
                  <TrendingDown className="w-5 h-5 mr-2" />
                  <span>If you are {selectedType}, you can receive from:</span>
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  {BLOOD_TYPES.map((type) => {
                    const isCompatible = COMPATIBILITY[type].includes(selectedType);
                    return (
                      <div
                        key={type}
                        className={`p-3 rounded-sm text-center font-bold border transition-all ${
                          isCompatible
                            ? "bg-blue-100 dark:bg-blue-950/30 border-blue-500 text-blue-700 dark:text-blue-400"
                            : "bg-muted/30 border-transparent text-muted-foreground/30"
                        }`}
                      >
                        {type}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Compatibility Table */}
        <Card className="border-2 border-[hsl(0,80%,50%)] rounded-sm mb-8">
          <CardHeader>
            <CardTitle>Donation Compatibility Chart</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left p-2 text-muted-foreground font-medium">
                    Donor ↓ / Recipient →
                  </th>
                  {BLOOD_TYPES.map((t) => (
                    <th
                      key={t}
                      className="p-2 font-bold text-[hsl(0,80%,50%)] text-center"
                    >
                      {t}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {BLOOD_TYPES.map((donor) => (
                  <tr
                    key={donor}
                    className="border-t border-border hover:bg-muted/30 transition-colors"
                  >
                    <td className="p-2 font-bold text-[hsl(0,80%,50%)]">
                      {donor}
                    </td>
                    {BLOOD_TYPES.map((recipient) => (
                      <td key={recipient} className="p-2 text-center">
                        {COMPATIBILITY[donor].includes(recipient) ? (
                          <CheckCircle2 className="w-4 h-4 text-success mx-auto" />
                        ) : (
                          <XCircle className="w-4 h-4 text-muted-foreground/30 mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center p-8 bg-[hsl(0,80%,50%)]/5 dark:bg-[hsl(0,80%,50%)]/10 rounded-sm border border-[hsl(0,80%,50%)]/20">
          <h2 className="text-2xl font-bold text-[hsl(0,80%,50%)] mb-2">
            Ready to Donate?
          </h2>
          <p className="text-muted-foreground mb-4">
            Every blood type is needed. Find a drive near you today.
          </p>
          <Button
            asChild
            className="bg-[hsl(0,80%,50%)] hover:bg-[hsl(0,80%,50%)]/90 text-white"
          >
            <Link to="/drives">Find Blood Drives</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
