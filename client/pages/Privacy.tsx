import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Heart,
  ArrowLeft,
  Lock,
  Eye,
  Database,
  Share2,
  ShieldAlert,
} from "lucide-react";

export default function Privacy() {
  const lastUpdated = "December 29, 2024";

  const sections = [
    {
      id: "information-collection",
      title: "1. Information We Collect",
      icon: Database,
      content: `We collect information to provide better services to our community. This includes:
      • Personal Details: Name, email address, phone number, and date of birth.
      • Medical Information: Blood type, donation history, and health eligibility responses.
      • Technical Data: IP address, device type, and app usage patterns to improve performance.`,
    },
    {
      id: "how-we-use",
      title: "2. How We Use Information",
      icon: Eye,
      content: `Your data is used specifically to:
      • Facilitate donation appointments with verified hospital partners.
      • Notify you of urgent blood needs or local drives in your area.
      • Maintain your donation history and rewards/achievements levels.
      • Improve platform security and prevent fraudulent registrations.`,
    },
    {
      id: "data-sharing",
      title: "3. Information Sharing",
      icon: Share2,
      content: `We values your trust. We do not sell your personal data. Sharing only occurs:
      • With Hospital Partners: Specifically for scheduled appointments or emergency requests you respond to.
      • For Legal Reasons: If required by law or to protect the safety of our users.
      • With Service Providers: Third-party tools (like Clerk for auth) that help us run the app securely.`,
    },
    {
      id: "security",
      title: "4. Data Security",
      icon: Lock,
      content: `We implement enterprise-grade security measures:
      • Encryption of data in transit and at rest.
      • Access controls to ensure only authorized clinical staff see relevant medical details.
      • Regular security audits of our hybrid Supabase and Clerk infrastructure.`,
    },
    {
      id: "your-rights",
      title: "5. Your Rights",
      icon: ShieldAlert,
      content: `You have control over your data:
      • Access: You can view all your stored data via your profile dashboard.
      • Correction: You can update your contact and profile details at any time.
      • Deletion: You can request account deletion, after which your personal identifiers will be removed (though non-identifiable medical records may be retained for clinical compliance).`,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground">
              Last Updated:{" "}
              <span className="font-semibold text-[hsl(0,80%,50%)]">
                {lastUpdated}
              </span>
            </p>
            <div className="w-24 h-1 bg-[hsl(0,80%,50%)] mx-auto mt-6 rounded-full"></div>
          </div>

          <div className="bg-white dark:bg-card rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="p-8 md:p-12">
              <p className="text-lg leading-relaxed mb-10 text-muted-foreground">
                At Drop of Hope, we take your privacy seriously. This policy
                explains how we collect, protect, and use your personal and
                medical information as you save lives through our platform.
              </p>

              <div className="space-y-12">
                {sections.map((section) => (
                  <section
                    key={section.id}
                    id={section.id}
                    className="scroll-mt-24"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-[hsl(0,80%,50%)]/10 flex items-center justify-center text-[hsl(0,80%,50%)]">
                        <section.icon className="w-5 h-5" />
                      </div>
                      <h2 className="text-2xl font-bold m-0">
                        {section.title}
                      </h2>
                    </div>
                    <div className="pl-13 text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">
                      {section.content}
                    </div>
                  </section>
                ))}
              </div>

              <div className="mt-16 p-8 bg-gray-50 dark:bg-muted/30 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold mb-4">
                  Complaints & Feedback
                </h3>
                <p className="text-muted-foreground mb-4">
                  If you believe your privacy rights have been violated or have
                  questions about our data practices, please reach out to our
                  Data Protection Officer:
                </p>
                <div className="font-medium">
                  <p>privacy@dropofhope.com</p>
                  <p>Attn: Data Protection Officer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-12 text-center text-muted-foreground">
        <div className="flex justify-center gap-6 mb-4 text-sm">
          <Link
            to="/terms"
            className="hover:text-[hsl(0,80%,50%)] transition-colors"
          >
            Terms of Service
          </Link>
          <Link
            to="/contact"
            className="hover:text-[hsl(0,80%,50%)] transition-colors"
          >
            Contact Us
          </Link>
        </div>
        <p>&copy; 2024 Drop of Hope. Protect your data, protect lives.</p>
      </footer>
    </div>
  );
}
