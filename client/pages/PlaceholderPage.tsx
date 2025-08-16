import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, ArrowLeft, MessageCircle } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
  description: string;
  suggestedPrompt?: string;
}

export default function PlaceholderPage({
  title,
  description,
  suggestedPrompt,
}: PlaceholderPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-hope-pink to-white dark:from-hope-coral dark:to-background">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md dark:bg-card/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-hope-red rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-white fill-current" />
              </div>
              <span className="text-xl font-bold text-hope-red">
                Drop of Hope
              </span>
            </Link>
            <Button variant="outline" asChild>
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto text-center">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="w-16 h-16 bg-hope-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-hope-red" />
              </div>
              <CardTitle className="text-3xl text-hope-red">{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-lg text-muted-foreground">{description}</p>

              {suggestedPrompt && (
                <div className="bg-hope-pink dark:bg-hope-coral p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">
                    Suggested prompt for the developer:
                  </p>
                  <code className="text-sm bg-white dark:bg-card p-2 rounded border">
                    "{suggestedPrompt}"
                  </code>
                </div>
              )}

              <div className="pt-4">
                <Button className="bg-hope-red hover:bg-hope-red/90" asChild>
                  <Link to="/">Return to Home</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
