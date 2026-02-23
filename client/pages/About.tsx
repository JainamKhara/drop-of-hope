import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Heart,
  ArrowLeft,
  Users,
  ShieldCheck,
  Globe,
  Zap,
  Award,
  Sparkles,
} from "lucide-react";

export default function About() {
  const stats = [
    {
      label: "Lives Saved",
      value: "25k+",
      icon: Heart,
      color: "text-hope-red",
    },
    {
      label: "Active Donors",
      value: "10k+",
      icon: Users,
      color: "text-blue-500",
    },
    {
      label: "Partner Hospitals",
      value: "150+",
      icon: ShieldCheck,
      color: "text-green-500",
    },
    {
      label: "Cities Covered",
      value: "45+",
      icon: Globe,
      color: "text-purple-500",
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-background">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-b from-hope-pink/30 to-white dark:from-hope-coral/20 dark:to-background overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold text-hope-red mb-6 leading-tight">
              Giving Life When It Matters Most
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Drop of Hope is more than just a platform; it's a lifeline. We
              connect generous donors with those in urgent need of blood,
              creating a seamless and community-driven ecosystem of life-savers.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                className="bg-hope-red hover:bg-hope-red/90 h-12 px-8 text-lg"
                asChild
              >
                <Link to="/donor/register">Join the Mission</Link>
              </Button>
              <Button variant="outline" className="h-12 px-8 text-lg" asChild>
                <Link to="/contact">Partner With Us</Link>
              </Button>
            </div>
          </div>
        </div>
        {/* Background blobs */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-hope-pink/50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-hope-red/20 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center group">
                <div
                  className={`mx-auto w-12 h-12 rounded-full bg-white dark:bg-card shadow-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="aspect-[4/5] rounded-3xl bg-hope-red/5 overflow-hidden shadow-2xl border border-hope-red/10 flex flex-col items-center justify-center relative bg-[radial-gradient(circle_at_center,theme(colors.hope.pink)_0%,transparent_100%)]">
                <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white dark:from-background dark:via-transparent dark:to-background pointer-events-none z-10 opacity-90" />
                <div className="flex flex-col gap-12 animate-marquee-vertical py-12 items-center">
                  {/* First set of words */}
                  <span className="text-6xl md:text-8xl font-black text-hope-red/10 tracking-tighter select-none">
                    HOPE
                  </span>
                  <span className="text-6xl md:text-8xl font-black text-hope-red/10 tracking-tighter select-none">
                    LIFE
                  </span>
                  <span className="text-6xl md:text-8xl font-black text-hope-red/10 tracking-tighter select-none">
                    GIVE
                  </span>
                  <span className="text-6xl md:text-8xl font-black text-hope-red/10 tracking-tighter select-none">
                    SAVE
                  </span>
                  <span className="text-6xl md:text-8xl font-black text-hope-red/10 tracking-tighter select-none">
                    HEAL
                  </span>
                  <span className="text-6xl md:text-8xl font-black text-hope-red/10 tracking-tighter select-none">
                    SERVE
                  </span>
                  {/* Duplicate set for infinite loop */}
                  <span className="text-6xl md:text-8xl font-black text-hope-red/10 tracking-tighter select-none">
                    HOPE
                  </span>
                  <span className="text-6xl md:text-8xl font-black text-hope-red/10 tracking-tighter select-none">
                    LIFE
                  </span>
                  <span className="text-6xl md:text-8xl font-black text-hope-red/10 tracking-tighter select-none">
                    GIVE
                  </span>
                  <span className="text-6xl md:text-8xl font-black text-hope-red/10 tracking-tighter select-none">
                    SAVE
                  </span>
                  <span className="text-6xl md:text-8xl font-black text-hope-red/10 tracking-tighter select-none">
                    HEAL
                  </span>
                  <span className="text-6xl md:text-8xl font-black text-hope-red/10 tracking-tighter select-none">
                    SERVE
                  </span>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 bg-white dark:bg-card p-6 rounded-2xl shadow-xl max-w-xs border border-hope-red/20">
                <Sparkles className="w-8 h-8 text-hope-red mb-3" />
                <p className="font-semibold text-lg italic">
                  "Every drop you donate can rewrite the story of someone's
                  life."
                </p>
              </div>
            </div>

            <div className="space-y-8">
              <h2 className="text-4xl font-bold tracking-tight">
                Our Mission & Vision
              </h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-hope-red/10 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-hope-red" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Zero Delay</h3>
                    <p className="text-muted-foreground">
                      In clinical emergencies, time is everything. Our platform
                      is optimized to reduce the time from a request to a
                      matching donor to mere minutes.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Verified Network</h3>
                    <p className="text-muted-foreground">
                      We partner only with accredited hospitals and use thorough
                      verification processes for all users to ensure safety and
                      reliability.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
                    <Award className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">
                      Community Rewards
                    </h3>
                    <p className="text-muted-foreground">
                      We celebrate our heroes. Our gamified system allows donors
                      to earn badges, level up, and unlock real-world benefits
                      for their life-saving acts.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team CTA */}
      <section className="py-20 bg-hope-red text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to make a difference?
          </h2>
          <p className="text-xl mb-10 opacity-90 max-w-2xl mx-auto">
            Become a part of the fastest-growing life-saving network. Whether
            you're a donor, a hospital, or a health organization, there's a
            place for you.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              variant="secondary"
              className="h-12 px-8 text-lg font-bold"
              asChild
            >
              <Link to="/donor/register">Register as Donor</Link>
            </Button>
            <Button
              variant="outline"
              className="h-12 px-8 text-lg bg-transparent border-white text-white hover:bg-white hover:text-hope-red"
              asChild
            >
              <Link to="/hospital/login">Hospital Portal</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer link back */}
      <footer className="py-12 border-t text-center text-muted-foreground">
        <p>&copy; 2024 Drop of Hope. Saving lives, one drop at a time.</p>
      </footer>
    </div>
  );
}
