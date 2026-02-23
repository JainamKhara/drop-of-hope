import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Heart,
  ArrowLeft,
  ShieldCheck,
  FileText,
  Scale,
  AlertCircle,
} from "lucide-react";

export default function Terms() {
  const lastUpdated = "December 29, 2024";

  const sections = [
    {
      id: "acceptance",
      title: "1. Acceptance of Terms",
      icon: FileText,
      content: `By accessing or using the Drop of Hope platform ("Platform"), you agree to be bound by these Terms of Service. If you do not agree to all of these terms, do not use our services. We reserve the right to modify these terms at any time, and your continued use of the platform constitutes acceptance of updated terms.`,
    },
    {
      id: "eligibility",
      title: "2. Eligibility for Donation",
      icon: Heart,
      content: `Blood donation eligibility is determined by local medical standards and health regulations. By registering as a donor, you acknowledge that:
      • You meet the minimum age requirements (typically 17+ or 16 with parental consent).
      • You meet minimum weight and health requirements.
      • You will provide honest and accurate information regarding your medical history.
      • Final eligibility is determined by medical professionals at the time of donation.`,
    },
    {
      id: "user-conduct",
      title: "3. User Conduct",
      icon: ShieldCheck,
      content: `Users are expected to maintain professional and respectful behavior. Prohibited activities include:
      • Providing false identification or medical data.
      • Harassing other donors, volunteers, or hospital staff.
      • Attempting to circumvent the platform's security or gamification systems.
      • Using the platform for commercial purposes without authorization.`,
    },
    {
      id: "medical-disclaimer",
      title: "4. Medical Disclaimer",
      icon: AlertCircle,
      content: `The Platform provides logistics and information facilitation. Drop of Hope is NOT a medical provider.
      • Information on the site is for educational purposes and should not replace professional medical advice.
      • We do not perform medical procedures; we connect you with accredited hospitals.
      • In case of a medical emergency, always call 911 or your local emergency number immediately.`,
    },
    {
      id: "privacy",
      title: "5. Data Privacy & Security",
      icon: ShieldCheck,
      content: `Your health and personal data are handled with the highest security standards. 
      • Donor data is shared only with verified hospital partners for specific donation appointments.
      • We comply with HIPAA and local clinical data regulations.
      • Please refer to our Privacy Policy for a detailed breakdown of how your data is protected and used.`,
    },
    {
      id: "liability",
      title: "6. Limitation of Liability",
      icon: Scale,
      content: `To the maximum extent permitted by law, Drop of Hope shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your access to or use of the services. We do not guarantee the immediate availability of blood or donors in all regions at all times.`,
    },
    {
      id: "termination",
      title: "7. Termination",
      icon: AlertCircle,
      content: `We reserve the right to suspend or terminate your account if you violate these terms or engage in behavior that puts the Platform or other users at risk. You may also close your account at any time through your profile settings.`,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
              Terms of Service
            </h1>
            <p className="text-muted-foreground">
              Last Updated:{" "}
              <span className="font-semibold text-hope-red">{lastUpdated}</span>
            </p>
            <div className="w-24 h-1 bg-hope-red mx-auto mt-6 rounded-full"></div>
          </div>

          <div className="bg-white dark:bg-card rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="p-8 md:p-12">
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-lg leading-relaxed mb-10 text-muted-foreground">
                  Welcome to Drop of Hope. These terms govern your use of our
                  website, mobile application, and related services. By using
                  our platform, you agree to comply with and be bound by the
                  following terms and conditions of use.
                </p>

                <div className="space-y-12">
                  {sections.map((section) => (
                    <section
                      key={section.id}
                      id={section.id}
                      className="scroll-mt-24"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-hope-red/10 flex items-center justify-center text-hope-red">
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
                    8. Contact Information
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    If you have any questions or concerns about these Terms of
                    Service, please contact our legal team at:
                  </p>
                  <div className="space-y-2 font-medium">
                    <p>Legal Department, Drop of Hope</p>
                    <p>legal@dropofhope.com</p>
                    <p>123 Medical Plaza, New York, NY</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-hope-red/5 p-8 border-t border-hope-red/10 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <ShieldCheck className="w-10 h-10 text-hope-red" />
                <div>
                  <p className="font-bold">Your safety is our priority</p>
                  <p className="text-sm text-muted-foreground">
                    We iterate on these terms to ensure a safe community.
                  </p>
                </div>
              </div>
              <Button
                className="bg-hope-red hover:bg-hope-red/90 font-bold"
                asChild
              >
                <Link to="/register">Accept & Register</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-12 text-center text-muted-foreground">
        <div className="flex justify-center gap-6 mb-4 text-sm">
          <Link to="/privacy" className="hover:text-hope-red transition-colors">
            Privacy Policy
          </Link>
          <Link to="/contact" className="hover:text-hope-red transition-colors">
            Contact Us
          </Link>
        </div>
        <p>&copy; 2024 Drop of Hope. All rights reserved.</p>
      </footer>
    </div>
  );
}
