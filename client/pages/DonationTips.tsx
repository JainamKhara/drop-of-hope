import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const PRE_DONATION = [
  "Drink at least 16 oz (500 ml) of water or juice in the 2 hours before donating.",
  "Eat a healthy meal — avoid fatty foods which can affect blood tests.",
  "Sleep at least 6 hours the night before your donation.",
  "Avoid alcohol for at least 24 hours before donating.",
  "Wear a shirt with sleeves that roll up easily above the elbow.",
  "Bring a valid photo ID and your donor card if you have one.",
  "Let staff know if you are taking any medications.",
];

const POST_DONATION = [
  "Keep the bandage on for at least 4–5 hours after donation.",
  "Drink extra fluids (water, juice, sports drinks) for the next 24–48 hours.",
  "Avoid strenuous exercise or heavy lifting for the rest of the day.",
  "Eat iron-rich foods: red meat, spinach, beans, and fortified cereals.",
  "If you feel dizzy or lightheaded, sit or lie down until it passes.",
  "Avoid alcohol for at least 24 hours post-donation.",
  "You can donate whole blood again in 56 days (8 weeks).",
];

const FAQS = [
  {
    q: "Does blood donation hurt?",
    a: "You may feel a brief pinch when the needle is inserted, but most donors feel little to no pain during the actual donation process.",
  },
  {
    q: "How long does the entire process take?",
    a: "The full process — registration, health screening, donation, and refreshments — takes about 45–60 minutes. The actual blood draw only takes 8–10 minutes.",
  },
  {
    q: "Who can donate blood?",
    a: "Most healthy adults over 17 years old who weigh at least 50 kg (110 lbs) and have not donated in the last 56 days are eligible.",
  },
  {
    q: "Can I donate if I'm on medication?",
    a: "It depends on the medication. Most common medications like blood pressure pills or birth control are fine. Antibiotics may require a short wait period. Always inform the staff.",
  },
  {
    q: "How much blood is taken?",
    a: "About 450–475 ml (roughly 1 pint) of whole blood is collected per donation. Your body replaces the fluid in 24 hours and red blood cells in about 4–6 weeks.",
  },
  {
    q: "Will I feel weak after donating?",
    a: "Most donors feel fine immediately after. Some may feel slight dizziness, which passes quickly after resting and eating a snack. Stay hydrated and don't rush to leave.",
  },
  {
    q: "How often can I donate?",
    a: "Whole blood: every 56 days (8 weeks). Platelets: up to 24 times/year. Plasma: up to 2 times/week. Double red cells: every 112 days.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-sm overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/40 transition-colors"
      >
        <span className="font-medium">{q}</span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        )}
      </button>
      {open && (
        <div className="px-4 pb-4 text-muted-foreground text-sm leading-relaxed">
          {a}
        </div>
      )}
    </div>
  );
}

const QUIZ_QUESTIONS = [
  {
    id: 1,
    q: "Are you aged between 18 and 65?",
    sub: "Age limits ensure donor safety and quality of blood collected.",
    correct: true,
  },
  {
    id: 2,
    q: "Do you weigh at least 50 kg (110 lbs)?",
    sub: "Average blood volume varies; weight is a key threshold for whole blood donation.",
    correct: true,
  },
  {
    id: 3,
    q: "Have you donated whole blood in the last 56 days (8 weeks)?",
    sub: "Your body needs time to replenish red blood cells before the next donation.",
    correct: false,
  },
  {
    id: 4,
    q: "Have you received a tattoo or body piercing in the last 6 months?",
    sub: "Tattoos/piercings require a brief waiting period for health screening safety.",
    correct: false,
  },
  {
    id: 5,
    q: "Are you currently feeling well and healthy, and not on antibiotics?",
    sub: "You should be in good general health at the time of your donation.",
    correct: true,
  },
];

export default function DonationTips() {
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, boolean>>({});

  const checkEligibility = () => {
    const reasons: string[] = [];
    if (quizAnswers[1] === false) reasons.push("Age must be between 18 and 65.");
    if (quizAnswers[2] === false) reasons.push("Weight must be at least 50 kg (110 lbs).");
    if (quizAnswers[3] === true) reasons.push("You must wait at least 56 days between whole blood donations.");
    if (quizAnswers[4] === true) reasons.push("A 6-month wait period is required after a new tattoo or piercing.");
    if (quizAnswers[5] === false) reasons.push("You must feel well, healthy, and be off antibiotics.");
    
    return {
      eligible: reasons.length === 0,
      reasons,
    };
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[hsl(0,0%,6%)]">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
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
          <h1 className="text-4xl font-bold text-[hsl(0,80%,50%)] mb-2">
            Donation Tips & FAQs
          </h1>
          <p className="text-muted-foreground text-lg">
            Everything you need to know for a smooth donation experience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* Pre-Donation */}
          <Card className="border-2 border-[hsl(0,80%,50%)] rounded-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-success" />
                Before Your Donation
              </CardTitle>
              <Badge className="w-fit bg-success/10 text-success border-success/20">
                Preparation
              </Badge>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {PRE_DONATION.map((tip, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Post-Donation */}
          <Card className="border-2 border-[hsl(0,80%,50%)] rounded-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-warning" />
                After Your Donation
              </CardTitle>
              <Badge className="w-fit bg-warning/10 text-warning border-warning/20">
                Recovery
              </Badge>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {POST_DONATION.map((tip, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <AlertCircle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Interactive Eligibility Checker */}
        <Card className="border-2 border-[hsl(0,80%,50%)] rounded-sm mb-8 overflow-hidden">
          <CardHeader className="bg-[hsl(0,80%,50%)]/5">
            <CardTitle className="flex items-center gap-2 text-[hsl(0,80%,50%)]">
              <CheckCircle2 className="w-5 h-5 text-[hsl(0,80%,50%)]" />
              <span>Interactive Donor Eligibility Checker</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              A quick 5-step self-assessment tool to verify if you can donate blood today
            </p>
          </CardHeader>
          <CardContent className="p-6">
            {quizStep === 0 && (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-4">
                  Take this quick assessment before visiting a blood drive to ensure you meet basic eligibility guidelines.
                </p>
                <Button
                  onClick={() => setQuizStep(1)}
                  className="bg-[hsl(0,80%,50%)] hover:bg-[hsl(0,80%,50%)]/90 text-white rounded-none"
                >
                  Start Assessment
                </Button>
              </div>
            )}

            {quizStep > 0 && quizStep <= 5 && (
              <div>
                {/* Progress bar */}
                <div className="w-full bg-muted h-2 rounded-full mb-6">
                  <div
                    className="bg-[hsl(0,80%,50%)] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(quizStep / 5) * 100}%` }}
                  />
                </div>

                <div className="min-h-32 flex flex-col justify-center text-center px-4">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">
                    Question {quizStep} of 5
                  </span>
                  <h3 className="text-xl font-bold mb-2">
                    {QUIZ_QUESTIONS[quizStep - 1].q}
                  </h3>
                  <p className="text-sm text-muted-foreground italic mb-6">
                    {QUIZ_QUESTIONS[quizStep - 1].sub}
                  </p>
                </div>

                <div className="flex justify-center gap-4">
                  <Button
                    onClick={() => {
                      setQuizAnswers({ ...quizAnswers, [quizStep]: true });
                      setQuizStep((s) => s + 1);
                    }}
                    className="w-24 bg-green-600 hover:bg-green-700 text-white rounded-none font-bold"
                  >
                    Yes
                  </Button>
                  <Button
                    onClick={() => {
                      setQuizAnswers({ ...quizAnswers, [quizStep]: false });
                      setQuizStep((s) => s + 1);
                    }}
                    className="w-24 bg-red-600 hover:bg-red-700 text-white rounded-none font-bold"
                  >
                    No
                  </Button>
                </div>
              </div>
            )}

            {quizStep === 6 && (() => {
              const { eligible, reasons } = checkEligibility();
              return (
                <div className="text-center py-4">
                  {eligible ? (
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-green-100 dark:bg-green-950/30 rounded-full flex items-center justify-center mx-auto text-green-600">
                        <CheckCircle2 className="w-10 h-10" />
                      </div>
                      <h3 className="text-2xl font-bold text-green-600">You are Eligible to Donate! 🎉</h3>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        Based on your answers, you meet all primary donor requirements. We encourage you to find a nearby blood drive and schedule an appointment.
                      </p>
                      <Button
                        asChild
                        className="bg-[hsl(0,80%,50%)] hover:bg-[hsl(0,80%,50%)]/90 text-white rounded-none mt-2"
                      >
                        <Link to="/drives">Find Blood Drives</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-orange-100 dark:bg-orange-950/30 rounded-full flex items-center justify-center mx-auto text-orange-600">
                        <AlertCircle className="w-10 h-10" />
                      </div>
                      <h3 className="text-2xl font-bold text-orange-600">Temporary Deferral Suggested ⏳</h3>
                      <p className="text-muted-foreground max-w-md mx-auto mb-4">
                        You may not be eligible to donate blood today due to the following criteria:
                      </p>
                      <div className="max-w-md mx-auto bg-muted/30 p-4 border rounded-sm text-left">
                        <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                          {reasons.map((reason, index) => (
                            <li key={index}>{reason}</li>
                          ))}
                        </ul>
                      </div>
                      <p className="text-xs text-muted-foreground mt-4 italic">
                        Please check with a healthcare professional or drive staff on-site for final eligibility determinations.
                      </p>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    onClick={() => {
                      setQuizStep(0);
                      setQuizAnswers({});
                    }}
                    className="mt-6 rounded-none"
                  >
                    Retake Assessment
                  </Button>
                </div>
              );
            })()}
          </CardContent>
        </Card>

        {/* FAQs */}
        <Card className="border-2 border-[hsl(0,80%,50%)] rounded-sm mb-8">
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {FAQS.map((faq, i) => (
              <FaqItem key={i} q={faq.q} a={faq.a} />
            ))}
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center p-8 bg-[hsl(0,80%,50%)]/5 rounded-none border border-[hsl(0,80%,50%)]/20">
          <h2 className="text-2xl font-bold text-[hsl(0,80%,50%)] mb-2">
            Ready to Save Lives?
          </h2>
          <p className="text-muted-foreground mb-4">
            Now that you're prepared, find a blood drive near you.
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
