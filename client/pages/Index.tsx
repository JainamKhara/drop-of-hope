import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth, useUser } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, MapPin, Calendar, Users, Award, Shield, Phone, Mail } from 'lucide-react';

export default function Index() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();

  const stats = [
    { label: 'Lives Saved', value: '10,000+', icon: Heart },
    { label: 'Active Donors', value: '5,000+', icon: Users },
    { label: 'Blood Drives', value: '200+', icon: Calendar },
    { label: 'Partner Hospitals', value: '50+', icon: Shield },
  ];

  const features = [
    {
      icon: MapPin,
      title: 'Find Nearby Drives',
      description: 'Discover blood donation drives in your area with our interactive map',
    },
    {
      icon: Calendar,
      title: 'Easy Scheduling',
      description: 'Book appointments that sync with your Google Calendar',
    },
    {
      icon: Award,
      title: 'Earn Rewards',
      description: 'Get points, badges, and recognition for your life-saving donations',
    },
    {
      icon: Shield,
      title: 'Safe & Secure',
      description: 'Verified locations with professional medical staff',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-hope-pink to-white dark:from-hope-coral dark:to-background">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md dark:bg-card/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-hope-red rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-white fill-current" />
              </div>
              <span className="text-xl font-bold text-hope-red">Drop of Hope</span>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/about" className="text-foreground hover:text-hope-red transition-colors">About</Link>
              <Link to="/drives" className="text-foreground hover:text-hope-red transition-colors">Find Drives</Link>
              <Link to="/contact" className="text-foreground hover:text-hope-red transition-colors">Contact</Link>
            </nav>
            <div className="flex items-center space-x-4">
              <Button variant="outline" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
              <Button className="bg-hope-red hover:bg-hope-red/90" asChild>
                <Link to="/register">Donate Now</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge variant="secondary" className="mb-6 bg-hope-coral text-hope-red">
            💧 Every Drop Counts
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-hope-red to-red-700 bg-clip-text text-transparent">
            Drop of Hope
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Connect donors with those in need. Save lives through the power of community and technology.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-hope-red hover:bg-hope-red/90 text-lg px-8 py-3" asChild>
              <Link to="/dashboard">Become a Donor</Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-3 border-hope-red text-hope-red hover:bg-hope-red hover:text-white" asChild>
              <Link to="/request">Request Blood</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-white dark:bg-card">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-hope-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-8 h-8 text-hope-red" />
                </div>
                <div className="text-3xl font-bold text-hope-red mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our platform makes blood donation simple, rewarding, and impactful
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-hope-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-8 h-8 text-hope-red" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-hope-red to-red-700">
        <div className="container mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-6">Our Mission</h2>
          <p className="text-xl mb-8 max-w-4xl mx-auto leading-relaxed">
            We believe that no one should suffer due to lack of blood. Our platform connects generous donors 
            with hospitals and patients in need, creating a network of hope that spans communities and saves lives.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div>
              <h3 className="text-2xl font-semibold mb-3">Accessibility</h3>
              <p className="opacity-90">Making blood donation accessible to everyone, everywhere</p>
            </div>
            <div>
              <h3 className="text-2xl font-semibold mb-3">Technology</h3>
              <p className="opacity-90">Leveraging modern tech to streamline the donation process</p>
            </div>
            <div>
              <h3 className="text-2xl font-semibold mb-3">Community</h3>
              <p className="opacity-90">Building a community of heroes who give the gift of life</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-hope-pink dark:bg-hope-coral">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 text-hope-red">Ready to Make a Difference?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of donors who are already making a difference in their communities
          </p>
          <Button size="lg" className="bg-hope-red hover:bg-hope-red/90 text-lg px-12 py-4" asChild>
            <Link to="/register">Start Your Journey</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-hope-red rounded-full flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white fill-current" />
                </div>
                <span className="text-xl font-bold">Drop of Hope</span>
              </div>
              <p className="text-gray-400">
                Connecting hearts, saving lives through the power of blood donation.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">For Donors</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/register" className="hover:text-white transition-colors">Register</Link></li>
                <li><Link to="/drives" className="hover:text-white transition-colors">Find Drives</Link></li>
                <li><Link to="/rewards" className="hover:text-white transition-colors">Rewards</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">For Hospitals</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/hospital-portal" className="hover:text-white transition-colors">Hospital Portal</Link></li>
                <li><Link to="/request-blood" className="hover:text-white transition-colors">Request Blood</Link></li>
                <li><Link to="/organize-drive" className="hover:text-white transition-colors">Organize Drive</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <div className="space-y-2 text-gray-400">
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
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Drop of Hope. All rights reserved. Saving lives, one drop at a time.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
