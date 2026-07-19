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

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 md:py-24 px-4 bg-gradient-to-b from-red-50/40 via-white to-white dark:from-[hsl(0,80%,10%)]/20 dark:via-background dark:to-background border-b border-border">
        {/* Abstract Grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none"></div>
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left - Hero Text */}
            <div className="lg:col-span-7 space-y-6">
              <Badge
                variant="outline"
                className="border-2 border-[hsl(0,80%,50%)] text-[hsl(0,80%,50%)] bg-red-50/50 dark:bg-red-950/20 text-sm py-1 px-3 rounded-full animate-bounce"
              >
                💧 Every Drop Counts
              </Badge>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground select-none">
                Give Blood, <br />
                <span className="text-[hsl(0,80%,50%)] bg-gradient-to-r from-[hsl(0,80%,50%)] to-[hsl(14,100%,50%)] bg-clip-text text-transparent">
                  Share the Gift of Life.
                </span>
              </h1>

              <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
                Connect with local drives, track your donation stats, earn rewards, and join a community of lifesavers. Your contribution is someone's second chance.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                {isSignedIn ? (
                  <>
                    <Button size="lg" className="bg-[hsl(0,80%,50%)] hover:bg-[hsl(0,80%,50%)]/90 text-white rounded-none shadow-lg shadow-red-500/20 transition-all hover:scale-105" asChild>
                      <Link to={dashboardLink}>Go to Dashboard</Link>
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="rounded-none border-2 hover:bg-muted"
                      asChild
                    >
                      <Link to="/drives">Find Drives Near Me</Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button size="lg" className="bg-[hsl(0,80%,50%)] hover:bg-[hsl(0,80%,50%)]/90 text-white rounded-none shadow-lg shadow-red-500/20 transition-all hover:scale-105" asChild>
                      <Link to="/register">Become a Donor</Link>
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="rounded-none border-2 hover:bg-muted"
                      asChild
                    >
                      <Link to="/request">Request Blood</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Right - Premium Heartbeat SVG Illustration */}
            <div className="lg:col-span-5 flex justify-center items-center">
              <div className="relative w-full max-w-md h-72 flex items-center justify-center p-4 bg-white/50 dark:bg-black/20 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl">
                <svg className="w-full h-full" viewBox="0 0 300 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Heartbeat trace */}
                  <path
                    d="M10 100 H100 L110 70 L120 130 L130 100 H160 L170 50 L185 150 L195 100 H290"
                    stroke="hsl(0, 80%, 50%)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="animate-pulse"
                    style={{ strokeDasharray: 600, strokeDashoffset: 0 }}
                  />
                  {/* Glowing pulse drop in center */}
                  <g transform="translate(145, 80) scale(0.8)">
                    <path
                      d="M20 0 C20 0 40 24 40 38 C40 49 31 58 20 58 C9 58 0 49 0 38 C0 24 20 0 20 0 Z"
                      fill="url(#bloodDropGradient)"
                      className="animate-bounce"
                      style={{ animationDuration: '2s' }}
                    />
                  </g>
                  <defs>
                    <linearGradient id="bloodDropGradient" x1="20" y1="0" x2="20" y2="58" gradientUnits="userSpaceOnUse">
                      <stop stopColor="hsl(0, 100%, 60%)" />
                      <stop offset="1" stopColor="hsl(0, 80%, 40%)" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section
        ref={statsRef}
        className="py-12 md:py-16 px-4 bg-muted/30 border-b border-border"
      >
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {stats.map((stat, index) => (
              <Card
                key={index}
                className="border border-border/60 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white/80 dark:bg-background/80 backdrop-blur-sm rounded-xl overflow-hidden group"
              >
                <CardContent className="p-6 text-center space-y-3">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-950/20 text-[hsl(0,80%,50%)] rounded-full flex items-center justify-center mx-auto transition-transform group-hover:scale-110">
                    <stat.icon className="w-6 h-6 fill-current" />
                  </div>
                  <div>
                    <div className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
                      {stat.value.toLocaleString()}+
                    </div>
                    <div className="text-xs md:text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      {stat.label}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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
                <img 
                  src="/drop_of_hope_logo.png" 
                  alt="Drop of Hope Logo" 
                  className="w-8 h-8 object-contain"
                />
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
                  <span>+91 7779069774</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>kharajaynam@gmail.com</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-[hsl(0,80%,50%)] pt-8 text-center text-gray-400 text-sm">
            <p>
              &copy; 2026 Drop of Hope. All rights reserved. Saving lives, one
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
