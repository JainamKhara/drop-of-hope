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
      "Hi! I'm Hope, your blood donation assistant. I'm here to help with questions about eligibility, scheduling, and the donation process. How can I help you today?",
    suggestions: [
      "Am I eligible to donate?",
      "How to schedule appointment?",
      "What to expect during donation?",
      "Find blood drives near me",
    ],
  },
  eligibility: {
    content:
      "To be eligible for blood donation, you generally need to:\n\n• Be at least 17 years old (16 with parental consent in some states)\n• Weigh at least 110 pounds\n• Be in good health\n• Wait at least 8 weeks between whole blood donations\n\nWould you like me to help you check your specific eligibility?",
    suggestions: [
      "Check my eligibility",
      "What medications disqualify me?",
      "How long between donations?",
    ],
  },
  scheduling: {
    content:
      "Scheduling an appointment is easy! You can:\n\n1. Browse available blood drives in your area\n2. Select a convenient time slot\n3. Complete your donor information\n4. Receive confirmation and calendar reminder\n\nWould you like me to help you find drives near you?",
    suggestions: [
      "Find nearby drives",
      "Cancel appointment",
      "Reschedule appointment",
    ],
  },
  process: {
    content:
      "Here's what to expect during donation:\n\n1. **Registration** (5-10 min): Review info and mini-health screening\n2. **Health History** (10-15 min): Brief questionnaire with staff\n3. **Donation** (8-10 min): The actual blood collection\n4. **Recovery** (10-15 min): Rest and refreshments\n\nTotal time is usually 45-60 minutes. Any specific concerns?",
    suggestions: [
      "What should I eat before?",
      "Can I exercise after?",
      "Will it hurt?",
    ],
  },
  preparation: {
    content:
      "To prepare for your donation:\n\n**Before donating:**\n• Eat a healthy meal and stay hydrated\n• Get a good night's sleep\n• Bring a valid ID\n• Wear comfortable clothing\n\n**After donating:**\n• Rest for 10-15 minutes\n• Drink plenty of fluids\n• Avoid heavy lifting for a few hours\n• Eat iron-rich foods",
    suggestions: ["What to bring?", "Foods to avoid?", "Side effects?"],
  },
  rewards: {
    content:
      "As a donor, you'll earn points and badges:\n\n• **Points**: 100 points per donation\n• **Badges**: Special achievements for milestones\n• **Levels**: Bronze, Silver, Gold, Platinum, Diamond\n• **Benefits**: Priority booking, exclusive events, recognition\n\nYour contributions save lives and earn rewards!",
    suggestions: [
      "View my rewards",
      "How to earn more points?",
      "Available benefits?",
    ],
  },
  default: {
    content:
      "I'm here to help with blood donation questions! I can assist with:\n\n• Eligibility requirements\n• Scheduling appointments\n• Donation process and preparation\n• Finding blood drives\n• Rewards and recognition\n\nWhat would you like to know?",
    suggestions: [
      "Am I eligible?",
      "Schedule appointment",
      "Donation process",
      "Find drives",
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

  const generateBotResponse = (userMessage: string) => {
    const message = userMessage.toLowerCase();

    if (
      message.includes("eligib") ||
      message.includes("qualify") ||
      message.includes("requirements")
    ) {
      return botResponses.eligibility;
    } else if (
      message.includes("schedul") ||
      message.includes("appointment") ||
      message.includes("book")
    ) {
      return botResponses.scheduling;
    } else if (
      message.includes("process") ||
      message.includes("expect") ||
      message.includes("what happens")
    ) {
      return botResponses.process;
    } else if (
      message.includes("prepare") ||
      message.includes("before") ||
      message.includes("eat") ||
      message.includes("drink")
    ) {
      return botResponses.preparation;
    } else if (
      message.includes("reward") ||
      message.includes("points") ||
      message.includes("badge") ||
      message.includes("level")
    ) {
      return botResponses.rewards;
    } else if (
      message.includes("hi") ||
      message.includes("hello") ||
      message.includes("help")
    ) {
      return botResponses.greeting;
    } else {
      return botResponses.default;
    }
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    addUserMessage(inputValue);
    setInputValue("");
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(
      () => {
        const response = generateBotResponse(inputValue);
        setIsTyping(false);
        addBotMessage(response.content, response.suggestions);
      },
      1000 + Math.random() * 1000,
    );
  };

  const handleSuggestionClick = (suggestion: string) => {
    addUserMessage(suggestion);
    setIsTyping(true);

    setTimeout(() => {
      const response = generateBotResponse(suggestion);
      setIsTyping(false);
      addBotMessage(response.content, response.suggestions);
    }, 800);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 rounded-full bg-hope-red hover:bg-hope-red/90 shadow-lg"
          size="lg"
        >
          <MessageCircle className="w-8 h-8" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 h-[500px] max-w-[90vw] max-h-[80vh]">
      <Card className="border-0 shadow-2xl h-full flex flex-col">
        <CardHeader className="bg-hope-red text-white rounded-t-lg">
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
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                        message.type === "user" ? "bg-hope-red" : "bg-gray-100"
                      }`}
                    >
                      {message.type === "user" ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-hope-red" />
                      )}
                    </div>
                    <div
                      className={`px-3 py-2 rounded-lg ${
                        message.type === "user"
                          ? "bg-hope-red text-white"
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
                    <Bot className="w-4 h-4 text-hope-red" />
                  </div>
                  <div className="bg-gray-100 px-3 py-2 rounded-lg">
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
          <div className="border-t p-4">
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
                onClick={handleSendMessage}
                className="bg-hope-red hover:bg-hope-red/90"
                disabled={!inputValue.trim() || isTyping}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Ask about eligibility, scheduling, or the donation process
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
