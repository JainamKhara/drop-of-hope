import React, { useState, useRef } from "react";
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
import { supabase } from "@/lib/supabase";

export default function Contact() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const subjectRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      name: `${firstNameRef.current?.value || ""} ${lastNameRef.current?.value || ""}`.trim(),
      email: emailRef.current?.value || "",
      subject: subjectRef.current?.value || "",
      message: messageRef.current?.value || "",
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("contacts").insert([payload]);

    setIsSubmitting(false);

    if (error) {
      console.error("Contact form error:", error);
    }

    toast({
      title: "Message Sent",
      description:
        "Thank you for reaching out. Our support team will respond within 24 hours.",
    });
    formRef.current?.reset();
  };

  const contactInfo = [
    {
      title: "Email Us",
      description: "Send us a message anytime",
      value: "kharajaynam@gmail.com",
      icon: Mail,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Call Us",
      description: "Mon-Fri from 9am to 6pm",
      value: "+91 7779069774",
      icon: Phone,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Visit Us",
      description: "Our main headquarters",
      value: "Ahmedabad, Gujarat, India",
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
              className="border-2 border-[hsl(0,80%,50%)] rounded-sm hover:shadow-none"
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
                <p className="font-medium text-[hsl(0,80%,50%)]">
                  {info.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white dark:bg-card rounded-none overflow-hidden shadow-none items-stretch">
          <div className="p-8 md:p-12 lg:p-16">
            <h2 className="text-3xl font-bold mb-2">Send us a message</h2>
            <p className="text-muted-foreground mb-8">
              We usually respond within 24 hours.
            </p>

            <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    ref={firstNameRef}
                    id="firstName"
                    placeholder="John"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    ref={lastNameRef}
                    id="lastName"
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Work Email</Label>
                <Input
                  ref={emailRef}
                  id="email"
                  type="email"
                  placeholder="john@company.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  ref={subjectRef}
                  id="subject"
                  placeholder="How can we help you?"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  ref={messageRef}
                  id="message"
                  placeholder="Tell us more about your inquiry..."
                  rows={5}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-[hsl(0,80%,50%)] hover:bg-[hsl(0,80%,50%)]/90 h-12 rounded-sm font-bold transition-all hover:scale-[1.02] text-white"
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

          <div className="bg-[hsl(0,80%,50%)] p-8 md:p-12 lg:p-16 text-white flex flex-col justify-between">
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
