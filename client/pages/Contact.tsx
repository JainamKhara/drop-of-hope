import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Heart,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  Twitter,
  Instagram,
  Facebook,
  Linkedin,
  Clock,
  Send,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Message Sent",
        description:
          "Thank you for reaching out. Our support team will respond to you within 24 hours.",
      });
      (e.target as HTMLFormElement).reset();
    }, 1500);
  };

  const contactInfo = [
    {
      title: "Email Us",
      description: "Send us a message anytime",
      value: "hello@dropofhope.com",
      icon: Mail,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Call Us",
      description: "Mon-Fri from 9am to 6pm",
      value: "+1 (555) 123-4567",
      icon: Phone,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Visit Us",
      description: "Our main headquarters",
      value: "123 Medical Plaza, New York, NY",
      icon: MapPin,
      color: "bg-purple-100 text-purple-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
            Get in Touch
          </h1>
          <p className="text-xl text-muted-foreground">
            Have questions about donating? Want to partner with us? We're here
            to help you make an impact.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {contactInfo.map((info, idx) => (
            <Card
              key={idx}
              className="border-0 shadow-lg hover:shadow-xl transition-shadow"
            >
              <CardContent className="pt-6">
                <div
                  className={`w-12 h-12 rounded-xl ${info.color} flex items-center justify-center mb-4`}
                >
                  <info.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold mb-1">{info.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {info.description}
                </p>
                <p className="font-medium text-hope-red">{info.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white dark:bg-card rounded-3xl overflow-hidden shadow-2xl items-stretch">
          <div className="p-8 md:p-12 lg:p-16">
            <h2 className="text-3xl font-bold mb-2">Send us a message</h2>
            <p className="text-muted-foreground mb-8">
              We usually respond within 24 hours.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" placeholder="John" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" placeholder="Doe" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Work Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@company.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="How can we help you?"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Tell us more about your inquiry..."
                  rows={5}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-hope-red hover:bg-hope-red/90 h-12 rounded-xl font-bold transition-all hover:scale-[1.02]"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <Send className="mr-2 h-5 w-5" />
                )}
                {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </div>

          <div className="bg-hope-red p-8 md:p-12 lg:p-16 text-white flex flex-col justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-8">
                Connect with our community
              </h2>
              <div className="space-y-6 mb-12">
                <div className="flex gap-4">
                  <Clock className="w-6 h-6 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold">24/7 Emergency Support</h3>
                    <p className="opacity-80">
                      Our specialized team is available round the clock for
                      urgent blood logistics help.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <MessageSquare className="w-6 h-6 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold">Live Chat</h3>
                    <p className="opacity-80">
                      Login to your dashboard to access priority live chat
                      support.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <p className="font-bold mb-4 uppercase tracking-widest text-xs opacity-80">
                Follow us on social
              </p>
              <div className="flex gap-6">
                <a href="#" className="hover:scale-110 transition-transform">
                  <Twitter className="w-6 h-6" />
                </a>
                <a href="#" className="hover:scale-110 transition-transform">
                  <Instagram className="w-6 h-6" />
                </a>
                <a href="#" className="hover:scale-110 transition-transform">
                  <Facebook className="w-6 h-6" />
                </a>
                <a href="#" className="hover:scale-110 transition-transform">
                  <Linkedin className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-12 text-center text-muted-foreground">
        <p>&copy; 2024 Drop of Hope. Built with passion for saving lives.</p>
      </footer>
    </div>
  );
}

function RefreshCw(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M3 21v-5h5" />
    </svg>
  );
}
