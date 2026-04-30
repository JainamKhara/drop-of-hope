import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Heart,
  HelpCircle,
  Calendar,
  MapPin,
  Award,
} from "lucide-react";

interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

// Predefined responses for common questions
const botResponses = {
  greeting: {
    content:
      "Hello! 👋 I'm Hope, your personal blood donation assistant.\n\nI can help you with:\n• Checking if you're eligible to donate\n• Finding a blood drive near you\n• Explaining the donation process\n• Understanding donor rewards\n\nHow can I assist you today?",
    suggestions: [
      "Am I eligible?",
      "Find drives near me",
      "What is the process?",
      "Tell me about rewards",
    ],
  },
  eligibility: {
    content:
      "To be a superhero donor, you generally need to:\n\n✅ Be at least 17 years old (16 with consent)\n✅ Weigh at least 110 lbs\n✅ Be in good general health\n✅ Have not donated whole blood in the last 56 days\n\nCommon deferrals include recent travel to malaria-risk areas, certain medications, or low iron levels.\n\nWould you like to check specific conditions?",
    suggestions: [
      "Can I donate if I have a cold?",
      "Medication restrictions",
      "Travel restrictions",
      "Back to menu",
    ],
  },
  scheduling: {
    content:
      "Ready to save a life? 🩸\n\n1. Go to the **'Find Drives'** page.\n2. Enter your zip code or city.\n3. Pick a time that works for you.\n4. You'll get a confirmation email with all the details!\n\nI can take you there now if you like.",
    suggestions: [
      "Go to Find Drives",
      "Reschedule existing",
      "Cancel appointment",
    ],
  },
  process: {
    content:
      "Donating is safe, simple, and takes about an hour!\n\n1️⃣ **Registration**: Sign in and show ID.\n2️⃣ **Health History**: Private mini-physical and questionnaire.\n3️⃣ **The Donation**: The actual draw takes only 8-10 minutes. You just sit back and relax!\n4️⃣ **Refreshments**: Cookies and juice on us! 🍪🧃\n\nMost people feel just a quick pinch. You've got this!",
    suggestions: [
      "Does it hurt?",
      "How long does it take?",
      "What should I eat?",
    ],
  },
  preparation: {
    content:
      "Set yourself up for success! 💪\n\n**Before:**\n• Drink an extra 16oz of water 💧\n• Eat a healthy meal (avoid fatty foods) 🥗\n• Wear a shirt with sleeves you can roll up 👕\n\n**After:**\n• Keep the bandage on for a few hours\n• Avoid heavy lifting\n• Enjoy the feeling of saving lives!",
    suggestions: ["Foods to avoid", "Can I exercise?", "Back to menu"],
  },
  rewards: {
    content:
      "Your generosity deserves recognition! 🏆\n\nEarn **Hope Points** for every donation:\n• Whole Blood: 100 pts\n• Platelets: 150 pts\n\nRedeem points for gift cards, exclusive merch, or donate them to charity. You also earn badges as you reach milestones!",
    suggestions: [
      "Check my points",
      "View rewards catalog",
      "How to earn badges",
    ],
  },
  default: {
    content:
      "I'm not sure I understood that specific question, but I'm learning every day! 🧠\n\nHere are some things I can help with:",
    suggestions: [
      "Am I eligible?",
      "Find drives",
      "Donation process",
      "Donor rewards",
    ],
  },
};

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Send welcome message when chat opens
      setTimeout(() => {
        addBotMessage(
          botResponses.greeting.content,
          botResponses.greeting.suggestions,
        );
      }, 500);
    }
  }, [isOpen]);

  const addUserMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const addBotMessage = (content: string, suggestions?: string[]) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type: "bot",
      content,
      timestamp: new Date(),
      suggestions,
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleSendMessage = async (customMessage?: string) => {
    const textToSend = customMessage || inputValue;
    if (!textToSend.trim()) return;

    if (!customMessage) {
      addUserMessage(textToSend);
      setInputValue("");
    }
    
    setIsTyping(true);

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: textToSend,
          history: messages.slice(-10), // Send last 10 messages for context
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      setIsTyping(false);
      addBotMessage(data.content);
    } catch (error: any) {
      console.error("Chatbot error:", error);
      setIsTyping(false);
      const errorMessage = error.message && error.message !== "Failed to get response" 
        ? `Error: ${error.message}` 
        : "I'm sorry, I'm having trouble connecting right now. Please try again later.";
      addBotMessage(errorMessage);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    addUserMessage(suggestion);
    handleSendMessage(suggestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          corners="crisp"
          size="icon-lg"
          className="w-14 h-14 sm:w-16 sm:h-16"
        >
          <MessageCircle className="w-8 h-8" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-72 sm:w-80 md:w-96 h-[400px] sm:h-[500px] max-w-[95vw] sm:max-w-[90vw] max-h-[80vh]">
      <Card className="border-0 shadow-2xl h-full flex flex-col">
        <CardHeader className="bg-[hsl(0,80%,50%)] text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-lg">Hope Assistant</CardTitle>
                <p className="text-sm opacity-90">Your blood donation helper</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-5 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] ${message.type === "user" ? "order-2" : "order-1"}`}
                >
                  <div
                    className={`flex items-start space-x-2 ${message.type === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.type === "user"
                          ? "bg-[hsl(0,80%,50%)]"
                          : "bg-gray-100"
                      }`}
                    >
                      {message.type === "user" ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-[hsl(0,80%,50%)]" />
                      )}
                    </div>
                    <div
                      className={`px-3 py-2 rounded-sm ${
                        message.type === "user"
                          ? "bg-[hsl(0,80%,50%)] text-white"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-line">
                        {message.content}
                      </p>
                    </div>
                  </div>

                  {/* Suggestions */}
                  {message.type === "bot" && message.suggestions && (
                    <div className="mt-2 space-y-1">
                      {message.suggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="text-xs mr-1 mb-1"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-[hsl(0,80%,50%)]" />
                  </div>
                  <div className="bg-gray-100 px-3 py-2 rounded-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t p-3 sm:p-4 md:p-5">
            <div className="flex space-x-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me about blood donation..."
                className="flex-1"
                disabled={isTyping}
              />
              <Button
                onClick={() => handleSendMessage()}
                size="default"
                corners="crisp"
                disabled={!inputValue.trim() || isTyping}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Hope AI answers blood donation related questions only.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
