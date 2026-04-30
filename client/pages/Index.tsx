import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useHybridAuth } from "@/contexts/HybridAuthContext";
import { useUser } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ChatbotWidget from "@/components/ChatbotWidget";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import { useScrollReveal, useCountUp } from "@/hooks/useScrollReveal";
import { statsService } from "@/lib/db-services";
import {
  Heart,
  MapPin,
  Calendar,
  Users,
  Award,
  Shield,
  Phone,
  Mail,
} from "lucide-react";

export default function Index() {
  const {
    donorProfile,
    adminProfile,
    hospitalProfile,
    userRole,
    isSignedIn,
    clerkSignOut,
  } = useHybridAuth();

  const [realStats, setRealStats] = useState({
    livesSaved: 0,
    activeDonors: 0,
    bloodDrives: 0,
    partnerHospitals: 0,
  });

  useEffect(() => {
    statsService.getAdminStats().then(data => {
      setRealStats({
        livesSaved: data.livesImpacted || 0,
        activeDonors: data.totalDonors || 0,
        bloodDrives: data.totalDrives || 0,
        partnerHospitals: data.partnerships || 0,
      });
    });
  }, []);

  // 👤 Use appropriate profile based on role
  const profileName = (() => {
    if (userRole === "admin") return adminProfile?.name;
    if (userRole === "hospital") return hospitalProfile?.name;
    return donorProfile?.name || "Donor";
  })();

  const dashboardLink = (() => {
    if (userRole === "admin") return "/admin";
    if (userRole === "hospital") return "/hospital-portal";
    return "/dashboard";
  })();

  const stats = [
    { label: "Lives Saved", value: realStats.livesSaved, icon: Heart },
    { label: "Active Donors", value: realStats.activeDonors, icon: Users },
    { label: "Blood Drives", value: realStats.bloodDrives, icon: Calendar },
    { label: "Partner Hospitals", value: realStats.partnerHospitals, icon: Shield },
  ];

  const features = [
    {
      icon: MapPin,
      title: "Find Nearby Drives",
      description:
        "Discover blood donation drives in your area with our interactive map",
    },
    {
      icon: Calendar,
      title: "Easy Scheduling",
      description: "Book appointments that sync with your Google Calendar",
    },
    {
      icon: Award,
      title: "Earn Rewards",
      description:
        "Get points, badges, and recognition for your life-saving donations",
    },
    {
      icon: Shield,
      title: "Safe & Secure",
      description: "Verified locations with professional medical staff",
    },
  ];

  // Stats count-up animation refs
  const countRefs = stats.map(() =>
    useCountUp({ end: 0, duration: 0, triggerOnScroll: false }),
  );

  // Scroll reveal animations
  const statsRef = useScrollReveal({ threshold: 0.1, delay: 0 });
  const featuresHeaderRef = useScrollReveal({ threshold: 0.1, delay: 0 });
  const missionRef = useScrollReveal({ threshold: 0.1, delay: 0 });
  const ctaRef = useScrollReveal({ threshold: 0.1, delay: 0 });

  return (
    <div className="min-h-screen bg-white dark:bg-background">
      {/* Announcement Banner */}
      <AnnouncementBanner />

      {/* Emergency Alert Bar */}
      <div className="w-full bg-[hsl(0,80%,50%)] text-white py-4 px-4 border-b-2 border-[hsl(0,80%,30%)]">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2">
            <span className="text-2xl animate-pulse">🚨</span>
            <span className="font-mono font-bold text-lg">
              EVERY 2 SECONDS, SOMEONE NEEDS BLOOD
            </span>
          </div>
        </div>
      </div>

      {/* Hero Section - Asymmetric Layout */}
      <section className="py-12 md:py-20 px-4 border-b-2 border-[hsl(0,80%,50%)]">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-8 items-center">
            {/* Left Section - 10% - Hero Image (subtle) - Hidden on mobile */}
            <div className="hidden lg:flex lg:col-span-1 justify-center">
              <div className="w-16 h-96 bg-[hsl(0,80%,50%)] rounded-none"></div>
            </div>

            {/* Right Section - 90% on desktop, full width on mobile */}
            <div className="lg:col-span-11">
              <div className="space-y-4 md:space-y-6">
                <Badge
                  variant="outline"
                  className="border-2 border-[hsl(0,80%,50%)] text-[hsl(0,80%,50%)] bg-transparent text-sm md:text-base"
                >
                  💧 Every Drop Counts
                </Badge>

                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-mono text-[hsl(0,80%,50%)] select-none">
                  SAVE LIVES.
                </h1>

                <p className="text-base md:text-lg text-foreground max-w-2xl leading-relaxed">
                  Connect donors with those in need. Every donation is a second
                  chance at life. Drop of Hope unites communities through the
                  power of blood donation.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                  {isSignedIn ? (
                    <>
                      <Button size="lg" corners="crisp" asChild>
                        <Link to={dashboardLink}>Go to Dashboard</Link>
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        corners="crisp"
                        asChild
                      >
                        <Link to="/drives">Find Drives Near Me</Link>
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button size="lg" corners="crisp" asChild>
                        <Link to="/register">Become a Donor</Link>
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        corners="crisp"
                        asChild
                      >
                        <Link to="/request">Request Blood</Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Staggered Alignment */}
      <section
        ref={statsRef}
        className="py-12 md:py-20 px-4 bg-[hsl(0,0%,98%)] dark:bg-card border-b border-border"
      >
        <div className="container mx-auto space-y-8 md:space-y-12">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`flex items-center gap-4 md:gap-8 ${
                index % 2 === 0 ? "flex-row" : "flex-row-reverse"
              }`}
              style={{
                animation: `slide-in-${index % 2 === 0 ? "left" : "right"} 600ms ease-out forwards`,
                animationDelay: `${index * 100}ms`,
                opacity: 0,
              }}
            >
              {/* Left/Right - Icon */}
              <div className="flex-shrink-0 w-12 h-12 md:w-20 md:h-20 bg-[hsl(0,80%,50%)] rounded-none flex items-center justify-center">
                <stat.icon className="w-6 md:w-10 h-6 md:h-10 text-white" />
              </div>

              {/* Center - Stats */}
              <div className="flex-1">
                <div className="text-3xl md:text-5xl lg:text-6xl font-bold font-mono text-[hsl(0,80%,50%)]">
                  {stat.value.toLocaleString()}+
                </div>
                <div className="text-xs md:text-sm text-muted-foreground uppercase tracking-wider font-medium">
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-20 px-4">
        <div className="container mx-auto">
          <div ref={featuresHeaderRef} className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-mono text-foreground mb-4 select-none">
              HOW IT WORKS
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Our platform makes blood donation simple, rewarding, and impactful
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                variant="outline"
                className="border-2 border-[hsl(0,80%,50%)] rounded-none"
              >
                <CardContent className="p-4 md:p-6">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-[hsl(0,80%,50%)] rounded-none flex items-center justify-center mb-4">
                    <feature.icon className="w-5 md:w-6 h-5 md:h-6 text-white" />
                  </div>
                  <h3 className="font-display font-bold text-base md:text-lg mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section
        ref={missionRef}
        className="py-12 md:py-20 px-4 bg-[hsl(0,80%,50%)] text-white border-y-2 border-[hsl(0,80%,30%)]"
      >
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-mono text-white mb-6 text-center select-none">
            OUR MISSION
          </h2>

          <p className="text-base md:text-lg leading-relaxed max-w-4xl mx-auto text-center mb-12">
            We believe that no one should suffer due to lack of blood. Our
            platform connects generous donors with hospitals and patients in
            need, creating a network of hope that spans communities and saves
            lives.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {["Accessibility", "Technology", "Community"].map((item, idx) => (
              <div
                key={idx}
                className="border-l-4 border-white pl-4 md:pl-6"
                style={{
                  animation: `slide-in-left 600ms ease-out forwards`,
                  animationDelay: `${idx * 100}ms`,
                  opacity: 0,
                }}
              >
                <h3 className="text-lg md:text-2xl font-bold mb-3 font-display">{item}</h3>
                <p className="text-sm md:text-base text-white/90">
                  {item === "Accessibility"
                    ? "Making blood donation accessible to everyone, everywhere"
                    : item === "Technology"
                      ? "Leveraging modern tech to streamline the donation process"
                      : "Building a community of heroes who give the gift of life"}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section ref={ctaRef} className="py-20 px-4 bg-white dark:bg-background">
        <div className="container mx-auto text-center">
          <h2 className="h2-brutal text-[hsl(0,80%,50%)] mb-6 select-none">
            READY TO MAKE A DIFFERENCE?
          </h2>

          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of donors who are already making a difference in
            their communities
          </p>

          <Button size="lg" corners="crisp" asChild>
            <Link to={isSignedIn ? dashboardLink : "/register"}>
              {isSignedIn ? "Go to Dashboard" : "Start Your Journey"}
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[hsl(0,0%,20%)] text-white py-12 px-4 border-t-2 border-[hsl(0,80%,50%)]">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-[hsl(0,80%,50%)] rounded-none flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white fill-current" />
                </div>
                <span className="font-bold font-display text-lg">
                  Drop of Hope
                </span>
              </div>
              <p className="text-gray-400 text-sm">
                Connecting hearts, saving lives through the power of blood
                donation.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4 font-display">For Donors</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <Link
                    to="/register"
                    className="hover:text-white transition-colors"
                  >
                    Register
                  </Link>
                </li>
                <li>
                  <Link
                    to="/drives"
                    className="hover:text-white transition-colors"
                  >
                    Find Drives
                  </Link>
                </li>
                <li>
                  <Link
                    to="/rewards"
                    className="hover:text-white transition-colors"
                  >
                    Rewards
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4 font-display">Support</h3>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <Link
                    to="/about"
                    className="hover:text-white transition-colors"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    to="/community"
                    className="hover:text-white transition-colors"
                  >
                    Community
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="hover:text-white transition-colors"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4 font-display">Contact</h3>
              <div className="space-y-2 text-gray-400 text-sm">
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>1-800-DONATE</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>help@dropofhope.org</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-[hsl(0,80%,50%)] pt-8 text-center text-gray-400 text-sm">
            <p>
              &copy; 2024 Drop of Hope. All rights reserved. Saving lives, one
              drop at a time.
            </p>
          </div>
        </div>
      </footer>

      {/* AI Chatbot */}
      <ChatbotWidget />
    </div>
  );
}
