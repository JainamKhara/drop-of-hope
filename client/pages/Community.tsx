import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import ChatbotWidget from "@/components/ChatbotWidget";
import {
  Heart,
  ArrowLeft,
  Plus,
  MessageCircle,
  ThumbsUp,
  Share2,
  Users,
  Calendar,
  Award,
  TrendingUp,
  Camera,
  Send,
  MapPin,
  Clock,
  Star,
  Trophy,
  Crown,
} from "lucide-react";
import { format } from "date-fns";

// Mock community data
const communityPosts = [
  {
    id: "1",
    author: {
      id: "1",
      name: "Sarah Johnson",
      avatar: null,
      bloodType: "A+",
      level: "Gold",
      donations: 15,
    },
    content:
      "🩸 Just completed my 15th blood donation at City Hospital! Feeling amazing knowing I've helped save 45 lives. The staff was incredible as always. Who's joining me for the next drive? #BloodDonation #DropOfHope",
    image: null,
    likes: 24,
    comments: 8,
    shares: 3,
    timestamp: "2024-12-12T10:30:00Z",
    isLiked: false,
    badges: ["Hero", "Frequent Donor"],
  },
  {
    id: "2",
    author: {
      id: "2",
      name: "Michael Chen",
      avatar: null,
      bloodType: "O-",
      level: "Platinum",
      donations: 22,
    },
    content:
      "Amazing turnout at yesterday's university blood drive! 47 new donors joined our community. Special thanks to the volunteers who made this possible. Together we're making a difference! 💪",
    image: null,
    likes: 31,
    comments: 12,
    shares: 7,
    timestamp: "2024-12-11T16:45:00Z",
    isLiked: true,
    badges: ["Champion", "Community Leader"],
  },
  {
    id: "3",
    author: {
      id: "3",
      name: "Dr. Emily Rodriguez",
      avatar: null,
      bloodType: "B+",
      level: "Diamond",
      donations: 35,
    },
    content:
      "PSA: We're critically low on O- blood at our hospital. If you're an O- donor and eligible, please consider scheduling an appointment this week. Every donation can save up to 3 lives! 🚨",
    image: null,
    likes: 67,
    comments: 23,
    shares: 18,
    timestamp: "2024-12-11T09:15:00Z",
    isLiked: false,
    badges: ["Medical Professional", "Legend"],
  },
];

const bloodTypeGroups = [
  {
    type: "O+",
    members: 1247,
    description: "Universal donors for positive blood types",
  },
  { type: "O-", members: 324, description: "Universal donors - most needed!" },
  { type: "A+", members: 892, description: "Can donate to A+ and AB+" },
  { type: "A-", members: 267, description: "Can donate to A and AB types" },
  { type: "B+", members: 445, description: "Can donate to B+ and AB+" },
  { type: "B-", members: 156, description: "Can donate to B and AB types" },
  { type: "AB+", members: 198, description: "Universal recipients" },
  {
    type: "AB-",
    members: 89,
    description: "Can receive from all negative types",
  },
];

const leaderboard = [
  {
    rank: 1,
    name: "Sarah Thompson",
    donations: 48,
    points: 4800,
    badge: "Legend",
  },
  {
    rank: 2,
    name: "Michael Chen",
    donations: 42,
    points: 4200,
    badge: "Diamond",
  },
  {
    rank: 3,
    name: "Dr. Emily Rodriguez",
    donations: 38,
    points: 3800,
    badge: "Diamond",
  },
  {
    rank: 4,
    name: "John Smith",
    donations: 34,
    points: 3400,
    badge: "Platinum",
  },
  {
    rank: 5,
    name: "Maria Garcia",
    donations: 29,
    points: 2900,
    badge: "Platinum",
  },
];

export default function Community() {
  const [activeTab, setActiveTab] = useState("feed");
  const [newPost, setNewPost] = useState("");
  const [posts, setPosts] = useState(communityPosts);

  const handleLike = (postId: string) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
              isLiked: !post.isLiked,
            }
          : post,
      ),
    );
  };

  const handleNewPost = () => {
    if (!newPost.trim()) return;

    const newPostObj = {
      id: Date.now().toString(),
      author: {
        id: "current-user",
        name: "John Doe",
        avatar: null,
        bloodType: "A+",
        level: "Gold",
        donations: 12,
      },
      content: newPost,
      image: null,
      likes: 0,
      comments: 0,
      shares: 0,
      timestamp: new Date().toISOString(),
      isLiked: false,
      badges: ["Regular Donor"],
    };

    setPosts([newPostObj, ...posts]);
    setNewPost("");
  };

  const getBloodTypeColor = (bloodType: string) => {
    const colors: { [key: string]: string } = {
      "O+": "bg-red-100 text-red-800",
      "O-": "bg-red-200 text-red-900",
      "A+": "bg-blue-100 text-blue-800",
      "A-": "bg-blue-200 text-blue-900",
      "B+": "bg-green-100 text-green-800",
      "B-": "bg-green-200 text-green-900",
      "AB+": "bg-purple-100 text-purple-800",
      "AB-": "bg-purple-200 text-purple-900",
    };
    return colors[bloodType] || "bg-gray-100 text-gray-800";
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case "Legend":
        return <Crown className="w-4 h-4" />;
      case "Diamond":
        return <Star className="w-4 h-4" />;
      case "Platinum":
        return <Award className="w-4 h-4" />;
      case "Gold":
        return <Trophy className="w-4 h-4" />;
      default:
        return <Heart className="w-4 h-4" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "Legend":
        return "text-orange-600";
      case "Diamond":
        return "text-blue-600";
      case "Platinum":
        return "text-gray-600";
      case "Gold":
        return "text-yellow-600";
      default:
        return "text-hope-red";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-hope-pink to-white dark:from-hope-coral dark:to-background">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-hope-red mb-4">Community</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Connect with fellow donors, share your journey, and inspire others
            to save lives
          </p>
        </div>

        {/* Community Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 text-hope-red mx-auto mb-2" />
              <div className="text-2xl font-bold text-hope-red">5,243</div>
              <div className="text-sm text-muted-foreground">
                Active Members
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <Heart className="w-8 h-8 text-hope-red mx-auto mb-2 fill-current" />
              <div className="text-2xl font-bold text-hope-red">38,541</div>
              <div className="text-sm text-muted-foreground">
                Lives Impacted
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <MessageCircle className="w-8 h-8 text-hope-red mx-auto mb-2" />
              <div className="text-2xl font-bold text-hope-red">1,847</div>
              <div className="text-sm text-muted-foreground">
                Posts This Month
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-hope-red mx-auto mb-2" />
              <div className="text-2xl font-bold text-hope-red">+15%</div>
              <div className="text-sm text-muted-foreground">
                Growth This Month
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="feed">Community Feed</TabsTrigger>
            <TabsTrigger value="groups">Blood Type Groups</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
          </TabsList>

          {/* Community Feed Tab */}
          <TabsContent value="feed" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Feed */}
              <div className="lg:col-span-2 space-y-6">
                {/* Create Post */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Share Your Story</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder="Share your donation experience, encourage others, or ask questions..."
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                      rows={3}
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Camera className="w-4 h-4 mr-2" />
                          Photo
                        </Button>
                        <Button variant="outline" size="sm">
                          <MapPin className="w-4 h-4 mr-2" />
                          Location
                        </Button>
                      </div>
                      <Button
                        className="bg-hope-red hover:bg-hope-red/90"
                        onClick={handleNewPost}
                        disabled={!newPost.trim()}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Post
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Posts Feed */}
                {posts.map((post) => (
                  <Card key={post.id} className="border-0 shadow-lg">
                    <CardContent className="p-6">
                      {/* Post Header */}
                      <div className="flex items-start space-x-3 mb-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={post.author.avatar || undefined} />
                          <AvatarFallback className="bg-hope-red text-white">
                            {post.author.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold">
                              {post.author.name}
                            </h3>
                            <Badge
                              className={getBloodTypeColor(
                                post.author.bloodType,
                              )}
                            >
                              {post.author.bloodType}
                            </Badge>
                            <div
                              className={`flex items-center space-x-1 ${getLevelColor(post.author.level)}`}
                            >
                              {getLevelIcon(post.author.level)}
                              <span className="text-sm font-medium">
                                {post.author.level}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span>{post.author.donations} donations</span>
                            <span>
                              {format(
                                new Date(post.timestamp),
                                "MMM dd, yyyy • HH:mm",
                              )}
                            </span>
                          </div>
                          {post.badges.length > 0 && (
                            <div className="flex space-x-1 mt-1">
                              {post.badges.map((badge, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {badge}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Post Content */}
                      <div className="mb-4">
                        <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                          {post.content}
                        </p>
                        {post.image && (
                          <img
                            src={post.image}
                            alt="Post image"
                            className="mt-3 rounded-lg w-full max-h-96 object-cover"
                          />
                        )}
                      </div>

                      <Separator className="mb-4" />

                      {/* Post Actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex space-x-6">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLike(post.id)}
                            className={post.isLiked ? "text-hope-red" : ""}
                          >
                            <ThumbsUp
                              className={`w-4 h-4 mr-2 ${post.isLiked ? "fill-current" : ""}`}
                            />
                            {post.likes}
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MessageCircle className="w-4 h-4 mr-2" />
                            {post.comments}
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Share2 className="w-4 h-4 mr-2" />
                            {post.shares}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Trending Topics */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="w-5 h-5" />
                      <span>Trending</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">#BloodDonation</span>
                      <span className="text-xs text-muted-foreground">
                        284 posts
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">#DropOfHope</span>
                      <span className="text-xs text-muted-foreground">
                        156 posts
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">#SaveLives</span>
                      <span className="text-xs text-muted-foreground">
                        98 posts
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">#FirstDonation</span>
                      <span className="text-xs text-muted-foreground">
                        67 posts
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Your Impact</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-center p-3 bg-hope-pink dark:bg-hope-coral rounded-lg">
                      <div className="text-2xl font-bold text-hope-red">12</div>
                      <div className="text-sm text-muted-foreground">
                        Your Donations
                      </div>
                    </div>
                    <div className="text-center p-3 bg-hope-pink dark:bg-hope-coral rounded-lg">
                      <div className="text-2xl font-bold text-hope-red">36</div>
                      <div className="text-sm text-muted-foreground">
                        Lives You've Saved
                      </div>
                    </div>
                    <div className="text-center p-3 bg-hope-pink dark:bg-hope-coral rounded-lg">
                      <div className="text-2xl font-bold text-hope-red">
                        1,200
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Community Points
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Blood Type Groups Tab */}
          <TabsContent value="groups" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {bloodTypeGroups.map((group) => (
                <Card
                  key={group.type}
                  className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                >
                  <CardContent className="p-6 text-center">
                    <div
                      className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold ${getBloodTypeColor(group.type)}`}
                    >
                      {group.type}
                    </div>
                    <h3 className="font-semibold text-lg mb-2">
                      {group.members} Members
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {group.description}
                    </p>
                    <Button size="sm" className="w-full">
                      <Users className="w-4 h-4 mr-2" />
                      Join Group
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="space-y-6 mt-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Top Donors This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leaderboard.map((user) => (
                    <div
                      key={user.rank}
                      className="flex items-center justify-between p-4 bg-hope-pink dark:bg-hope-coral rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                            user.rank <= 3
                              ? "bg-hope-red text-white"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {user.rank <= 3 ? (
                            user.rank === 1 ? (
                              <Crown className="w-5 h-5" />
                            ) : user.rank === 2 ? (
                              <Award className="w-5 h-5" />
                            ) : (
                              <Trophy className="w-5 h-5" />
                            )
                          ) : (
                            user.rank
                          )}
                        </div>
                        <div>
                          <p className="font-semibold">{user.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {user.donations} donations • {user.points} points
                          </p>
                        </div>
                      </div>
                      <Badge>{user.badge}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-hope-red rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2">
                        Community Blood Drive
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Join fellow donors for our monthly community drive
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span>Dec 15, 2024</span>
                        <span>10:00 AM - 4:00 PM</span>
                      </div>
                      <Button size="sm" className="mt-3">
                        Join Event
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2">New Donor Workshop</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Learn about the donation process and meet other donors
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span>Dec 20, 2024</span>
                        <span>6:00 PM - 7:30 PM</span>
                      </div>
                      <Button size="sm" className="mt-3" variant="outline">
                        Learn More
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* AI Chatbot */}
      <ChatbotWidget />
    </div>
  );
}
