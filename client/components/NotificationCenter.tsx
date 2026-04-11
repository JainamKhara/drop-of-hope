import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Bell,
  X,
  Check,
  Calendar,
  Heart,
  AlertTriangle,
  MessageCircle,
  Award,
  MapPin,
  Clock,
  Settings,
  CheckCircle,
  Info,
  AlertCircle,
} from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import { notificationService } from "@/lib/db-services";
import { supabase } from "@/lib/supabase";
import { useHybridAuth } from "@/contexts/HybridAuthContext";

interface Notification {
  id: string;
  type:
    | "appointment"
    | "reminder"
    | "achievement"
    | "community"
    | "urgent"
    | "info";
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  actionUrl?: string;
  priority: "low" | "medium" | "high";
}

// Default notifications when no database notifications exist
const defaultNotifications: Notification[] = [
  {
    id: "welcome-1",
    type: "info",
    title: "Welcome to Drop of Hope!",
    message:
      "Thank you for joining our blood donation community. Schedule your first donation today!",
    timestamp: new Date(),
    isRead: false,
    actionUrl: "/drives",
    priority: "low",
  },
];

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { donorProfile, isSignedIn } = useHybridAuth();
  const navigate = useNavigate();

  // Load notifications from database
  useEffect(() => {
    const loadNotifications = async () => {
      if (!donorProfile?.id) {
        setNotifications(defaultNotifications);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await notificationService.getByUser(
          donorProfile.clerk_user_id || "",
          donorProfile.id,
        );

        if (data && data.length > 0) {
          const formatted = data.map((n: any) => ({
            id: n.id,
            type: n.type || "info",
            title: n.title,
            message: n.message,
            timestamp: new Date(n.created_at),
            isRead: n.is_read || false,
            actionUrl: n.action_url,
            priority: n.priority || "low",
          }));
          setNotifications(formatted);
        } else {
          setNotifications(defaultNotifications);
        }
      } catch (err) {
        console.error("Error loading notifications:", err);
        setNotifications(defaultNotifications);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, [donorProfile]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = async (id: string) => {
    // Update local state immediately
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
    // Persist to database (don't await to keep UI responsive)
    if (!id.startsWith("welcome-")) {
      notificationService.markAsRead(id);
    }
  };

  const markAllAsRead = async () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
    // Mark all as read in database
    if (donorProfile?.id) {
      notificationService.markAllAsRead(
        donorProfile.clerk_user_id || "",
        donorProfile.id,
      );
    }
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id));
    // Delete from database if not a default notification
    if (!id.startsWith("welcome-")) {
      notificationService.delete(id);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "appointment":
        return <Calendar className="w-5 h-5 text-blue-600" />;
      case "reminder":
        return <Clock className="w-5 h-5 text-orange-600" />;
      case "achievement":
        return <Award className="w-5 h-5 text-yellow-600" />;
      case "community":
        return <MessageCircle className="w-5 h-5 text-green-600" />;
      case "urgent":
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case "info":
        return <Info className="w-5 h-5 text-blue-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge className="bg-red-100 text-red-800 text-xs">High</Badge>;
      case "medium":
        return (
          <Badge className="bg-orange-100 text-orange-800 text-xs">
            Medium
          </Badge>
        );
      case "low":
        return (
          <Badge className="bg-green-100 text-green-800 text-xs">Low</Badge>
        );
      default:
        return null;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    if (isToday(timestamp)) {
      return format(timestamp, "HH:mm");
    } else if (isYesterday(timestamp)) {
      return "Yesterday";
    } else {
      return format(timestamp, "MMM dd");
    }
  };

  const unreadNotifications = notifications.filter((n) => !n.isRead);
  const readNotifications = notifications.filter((n) => n.isRead);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-[hsl(0,80%,50%)] text-white text-xs rounded-full">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-96 p-0" align="end" sideOffset={5}>
        <Card className="border-2 border-[hsl(0,80%,50%)] shadow-none rounded-sm">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notifications</CardTitle>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Mark all read
                  </Button>
                )}
                <Button variant="ghost" size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3 rounded-none border-b">
              <TabsTrigger value="all" className="text-xs">
                All ({notifications.length})
              </TabsTrigger>
              <TabsTrigger value="unread" className="text-xs">
                Unread ({unreadCount})
              </TabsTrigger>
              <TabsTrigger value="important" className="text-xs">
                Important
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="m-0">
              <ScrollArea className="h-80">
                <div className="p-2">
                  {notifications.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 rounded-sm mb-2 border transition-colors ${
                          notification.isRead
                            ? "bg-gray-50 border-gray-100"
                            : "bg-white border-[hsl(0,80%,50%)]/20"
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            {getNotificationIcon(notification.type)}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-1">
                              <h4
                                className={`text-sm font-medium ${
                                  notification.isRead
                                    ? "text-gray-700"
                                    : "text-gray-900"
                                }`}
                              >
                                {notification.title}
                              </h4>
                              <div className="flex items-center space-x-1">
                                {getPriorityBadge(notification.priority)}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    deleteNotification(notification.id)
                                  }
                                  className="w-5 h-5 p-0 opacity-50 hover:opacity-100"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>

                            <p
                              className={`text-xs mb-2 ${
                                notification.isRead
                                  ? "text-gray-500"
                                  : "text-gray-700"
                              }`}
                            >
                              {notification.message}
                            </p>

                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">
                                {formatTimestamp(notification.timestamp)}
                              </span>

                              <div className="flex space-x-2">
                                {!notification.isRead && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => markAsRead(notification.id)}
                                    className="text-xs px-2 py-1 h-auto"
                                  >
                                    <Check className="w-3 h-3 mr-1" />
                                    Mark read
                                  </Button>
                                )}
                                {notification.actionUrl && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-xs px-2 py-1 h-auto"
                                    onClick={() => {
                                      markAsRead(notification.id);
                                      setIsOpen(false);
                                      // Navigate to actionUrl
                                    }}
                                  >
                                    View
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="unread" className="m-0">
              <ScrollArea className="h-80">
                <div className="p-2">
                  {unreadNotifications.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>All caught up!</p>
                    </div>
                  ) : (
                    unreadNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="p-3 rounded-sm mb-2 border bg-white border-[hsl(0,80%,50%)]/20"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            {getNotificationIcon(notification.type)}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-1">
                              <h4 className="text-sm font-medium text-gray-900">
                                {notification.title}
                              </h4>
                              <div className="flex items-center space-x-1">
                                {getPriorityBadge(notification.priority)}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    deleteNotification(notification.id)
                                  }
                                  className="w-5 h-5 p-0 opacity-50 hover:opacity-100"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>

                            <p className="text-xs text-gray-700 mb-2">
                              {notification.message}
                            </p>

                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">
                                {formatTimestamp(notification.timestamp)}
                              </span>

                              <div className="flex space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => markAsRead(notification.id)}
                                  className="text-xs px-2 py-1 h-auto"
                                >
                                  <Check className="w-3 h-3 mr-1" />
                                  Mark read
                                </Button>
                                {notification.actionUrl && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-xs px-2 py-1 h-auto"
                                    onClick={() => {
                                      markAsRead(notification.id);
                                      setIsOpen(false);
                                      // Navigate to actionUrl
                                    }}
                                  >
                                    View
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="important" className="m-0">
              <ScrollArea className="h-80">
                <div className="p-2">
                  {notifications.filter((n) => n.priority === "high").length ===
                  0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No important notifications</p>
                    </div>
                  ) : (
                    notifications
                      .filter((n) => n.priority === "high")
                      .map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-3 rounded-sm mb-2 border transition-colors ${
                            notification.isRead
                              ? "bg-gray-50 border-gray-100"
                              : "bg-white border-[hsl(0,80%,50%)]/20"
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                              {getNotificationIcon(notification.type)}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-1">
                                <h4
                                  className={`text-sm font-medium ${
                                    notification.isRead
                                      ? "text-gray-700"
                                      : "text-gray-900"
                                  }`}
                                >
                                  {notification.title}
                                </h4>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    deleteNotification(notification.id)
                                  }
                                  className="w-5 h-5 p-0 opacity-50 hover:opacity-100"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              </div>

                              <p
                                className={`text-xs mb-2 ${
                                  notification.isRead
                                    ? "text-gray-500"
                                    : "text-gray-700"
                                }`}
                              >
                                {notification.message}
                              </p>

                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">
                                  {formatTimestamp(notification.timestamp)}
                                </span>

                                <div className="flex space-x-2">
                                  {!notification.isRead && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        markAsRead(notification.id)
                                      }
                                      className="text-xs px-2 py-1 h-auto"
                                    >
                                      <Check className="w-3 h-3 mr-1" />
                                      Mark read
                                    </Button>
                                  )}
                                  {notification.actionUrl && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-xs px-2 py-1 h-auto"
                                      onClick={() => {
                                        markAsRead(notification.id);
                                        setIsOpen(false);
                                        // Navigate to actionUrl
                                      }}
                                    >
                                      View
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </Card>
      </PopoverContent>
    </Popover>
  );
}
