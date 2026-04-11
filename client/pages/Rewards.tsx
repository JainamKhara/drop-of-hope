import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Heart,
  ArrowLeft,
  Award,
  Star,
  Trophy,
  Crown,
  Medal,
  Gift,
  Target,
  TrendingUp,
  Users,
  Zap,
  RefreshCw,
  Share2,
} from "lucide-react";
import { useHybridAuth } from "@/contexts/HybridAuthContext";
import {
  rewardService,
  donorService,
  appointmentService,
} from "@/lib/db-services";

// Badge definitions (static config — earned status comes from DB)
const badgeDefinitions = [
  {
    name: "First Drop",
    description: "Complete your first blood donation",
    icon: Heart,
    rarity: "common",
    points: 50,
  },
  {
    name: "Regular Donor",
    description: "Complete 5 blood donations",
    icon: Award,
    rarity: "common",
    points: 100,
  },
  {
    name: "Hero",
    description: "Complete 10 blood donations",
    icon: Medal,
    rarity: "rare",
    points: 200,
  },
  {
    name: "Life Saver",
    description: "Impact 30+ lives through donations",
    icon: Star,
    rarity: "rare",
    points: 250,
  },
  {
    name: "Streak Master",
    description: "Complete 5 consecutive donations",
    icon: Zap,
    rarity: "epic",
    points: 300,
  },
  {
    name: "Champion",
    description: "Complete 20 blood donations",
    icon: Trophy,
    rarity: "epic",
    points: 500,
  },
  {
    name: "Legendary Donor",
    description: "Complete 50 blood donations",
    icon: Crown,
    rarity: "legendary",
    points: 1000,
  },
];

// Level system
const levels = [
  {
    name: "Bronze",
    minPoints: 0,
    maxPoints: 499,
    color: "#CD7F32",
    benefits: ["Basic profile", "Donation tracking"],
  },
  {
    name: "Silver",
    minPoints: 500,
    maxPoints: 999,
    color: "#C0C0C0",
    benefits: ["Priority booking", "Special events"],
  },
  {
    name: "Gold",
    minPoints: 1000,
    maxPoints: 1499,
    color: "#FFD700",
    benefits: ["VIP treatment", "Exclusive drives", "Recognition"],
  },
  {
    name: "Platinum",
    minPoints: 1500,
    maxPoints: 2499,
    color: "#E5E4E2",
    benefits: ["Personal coordinator", "Special rewards"],
  },
  {
    name: "Diamond",
    minPoints: 2500,
    maxPoints: 4999,
    color: "#B9F2FF",
    benefits: ["Lifetime recognition", "Ambassador program"],
  },
  {
    name: "Legend",
    minPoints: 5000,
    maxPoints: Infinity,
    color: "#FF6347",
    benefits: ["Hall of Fame", "Mentorship opportunities"],
  },
];

export default function Rewards() {
  const { donorProfile } = useHybridAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  // Live data from DB
  const [earnedBadges, setEarnedBadges] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [completedDonations, setCompletedDonations] = useState(0);

  // Derived donor stats from donorProfile
  const currentPoints = donorProfile?.points || 0;
  const totalDonations = completedDonations;
  const livesImpacted = totalDonations * 3;

  useEffect(() => {
    if (donorProfile?.id) {
      loadRewardsData();
    } else {
      setLoading(false);
    }
  }, [donorProfile]);

  const loadRewardsData = async () => {
    if (!donorProfile?.id) return;
    try {
      setLoading(true);

      const [badgesResult, leaderboardResult, appointmentsResult] =
        await Promise.allSettled([
          rewardService.getByDonor(donorProfile.id),
          rewardService.getLeaderboard(10),
          appointmentService.getByDonor(donorProfile.id, "completed"),
        ]);

      // Process badges
      if (badgesResult.status === "fulfilled" && badgesResult.value.data) {
        setEarnedBadges(badgesResult.value.data);
      }

      // Process leaderboard
      if (
        leaderboardResult.status === "fulfilled" &&
        leaderboardResult.value.data
      ) {
        setLeaderboard(leaderboardResult.value.data);
      }

      // Process completed donations count
      if (
        appointmentsResult.status === "fulfilled" &&
        appointmentsResult.value.data
      ) {
        setCompletedDonations(appointmentsResult.value.data.length);
      }
    } catch (error) {
      console.error("Error loading rewards data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Merge badge definitions with earned data
  const earnedBadgeNames = new Set(earnedBadges.map((b: any) => b.badge_name));
  const mergedBadges = badgeDefinitions.map((badge) => {
    const earned = earnedBadges.find((b: any) => b.badge_name === badge.name);
    return {
      ...badge,
      earned: !!earned,
      earnedDate: earned?.earned_at || null,
    };
  });

  const currentLevel =
    levels.find(
      (level) =>
        currentPoints >= level.minPoints && currentPoints <= level.maxPoints,
    ) || levels[0];

  const nextLevel = levels.find((level) => level.minPoints > currentPoints);

  const progress = nextLevel
    ? ((currentPoints - currentLevel.minPoints) /
        (nextLevel.minPoints - currentLevel.minPoints)) *
      100
    : 100;

  const pointsToNextLevel = nextLevel ? nextLevel.minPoints - currentPoints : 0;

  // Find current user rank in leaderboard
  const currentUserRank =
    leaderboard.findIndex((user: any) => user.id === donorProfile?.id) + 1;

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "rare":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "epic":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "legendary":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getLevelName = (points: number) => {
    const level = levels.find(
      (l) => points >= l.minPoints && points <= l.maxPoints,
    );
    return level?.name || "Bronze";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-[hsl(0,80%,50%)] mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Loading your rewards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[hsl(0,0%,6%)]">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[hsl(0,80%,50%)] mb-4">
            Rewards & Achievements
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Earn points, unlock badges, and climb the leaderboard as you save
            lives
          </p>
        </div>

        {/* Level Progress Card */}
        <Card className="border-2 border-[hsl(0,80%,50%)] rounded-sm mb-8">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                  style={{ backgroundColor: currentLevel?.color }}
                >
                  <Trophy className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-[hsl(0,80%,50%)]">
                    {currentLevel?.name} Level
                  </h2>
                  <p className="text-muted-foreground">
                    {currentPoints} points • {totalDonations} donations
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-[hsl(0,80%,50%)]">
                  {livesImpacted}
                </div>
                <div className="text-sm text-muted-foreground">
                  Lives Impacted
                </div>
              </div>
            </div>

            {nextLevel && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">
                    Progress to {nextLevel.name}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {pointsToNextLevel} points needed
                  </span>
                </div>
                <Progress value={progress} className="h-3" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="badges">Badges</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            <TabsTrigger value="rewards">Rewards Store</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Recent Achievements */}
              <Card className="border-2 border-[hsl(0,80%,50%)] rounded-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="w-5 h-5" />
                    <span>Recent Achievements</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mergedBadges.filter((badge) => badge.earned).slice(-3)
                      .length === 0 ? (
                      <p className="text-muted-foreground text-sm">
                        No achievements yet. Start donating to earn badges!
                      </p>
                    ) : (
                      mergedBadges
                        .filter((badge) => badge.earned)
                        .slice(-3)
                        .map((badge, idx) => (
                          <div
                            key={idx}
                            className="flex items-center space-x-3 p-3 bg-[hsl(0,0%,98%)] dark:bg-[hsl(14,100%,50%)] rounded-sm"
                          >
                            <div className="w-10 h-10 bg-[hsl(0,80%,50%)] rounded-full flex items-center justify-center">
                              <badge.icon className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{badge.name}</p>
                              <p className="text-xs text-muted-foreground">
                                +{badge.points} points
                              </p>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="border-2 border-[hsl(0,80%,50%)] rounded-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5" />
                    <span>Your Impact</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center p-3 bg-[hsl(0,0%,98%)] dark:bg-[hsl(14,100%,50%)] rounded-sm">
                      <div className="text-2xl font-bold text-[hsl(0,80%,50%)]">
                        {totalDonations}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total Donations
                      </div>
                    </div>
                    <div className="text-center p-3 bg-[hsl(0,0%,98%)] dark:bg-[hsl(14,100%,50%)] rounded-sm">
                      <div className="text-2xl font-bold text-[hsl(0,80%,50%)]">
                        {currentPoints}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total Points
                      </div>
                    </div>
                    <div className="text-center p-3 bg-[hsl(0,0%,98%)] dark:bg-[hsl(14,100%,50%)] rounded-sm">
                      <div className="text-2xl font-bold text-[hsl(0,80%,50%)]">
                        {currentUserRank > 0 ? `#${currentUserRank}` : "—"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Leaderboard Rank
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Next Goals */}
              <Card className="border-2 border-[hsl(0,80%,50%)] rounded-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="w-5 h-5" />
                    <span>Next Goals</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mergedBadges
                      .filter((badge) => !badge.earned)
                      .slice(0, 3)
                      .map((badge, idx) => (
                        <div
                          key={idx}
                          className="p-3 border border-dashed border-muted rounded-sm"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                              <badge.icon className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-muted-foreground">
                                {badge.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {badge.points} points
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Badges Tab */}
          <TabsContent value="badges" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mergedBadges.map((badge, idx) => (
                <Card
                  key={idx}
                  className={`border-2 border-[hsl(0,80%,50%)] rounded-sm ${badge.earned ? "" : "opacity-60"}`}
                >
                  <CardContent className="p-6 text-center">
                    <div
                      className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
                        badge.earned ? "bg-[hsl(0,80%,50%)]" : "bg-muted"
                      }`}
                    >
                      <badge.icon
                        className={`w-10 h-10 ${badge.earned ? "text-white" : "text-muted-foreground"}`}
                      />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{badge.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {badge.description}
                    </p>
                    <Badge className={getRarityColor(badge.rarity)}>
                      {badge.rarity.charAt(0).toUpperCase() +
                        badge.rarity.slice(1)}
                    </Badge>
                    <div className="mt-3">
                      <span className="text-sm font-medium text-[hsl(0,80%,50%)]">
                        +{badge.points} points
                      </span>
                    </div>
                    {badge.earned && badge.earnedDate && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Earned {new Date(badge.earnedDate).toLocaleDateString()}
                      </p>
                    )}
                    {badge.earned && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3 w-full border-[hsl(0,80%,50%)]/20 text-[hsl(0,80%,50%)] hover:bg-[hsl(0,80%,50%)] hover:text-white"
                        onClick={async () => {
                          const text = `I just earned the "${badge.name}" badge on Drop of Hope! 🩸 Every drop counts. #DropOfHope #BloodDonation`;
                          if (navigator.share) {
                            await navigator.share({
                              title: "Drop of Hope Badge",
                              text,
                            });
                          } else {
                            await navigator.clipboard.writeText(text);
                            alert("Share text copied to clipboard!");
                          }
                        }}
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share Badge
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="space-y-6 mt-6">
            <Card className="border-2 border-[hsl(0,80%,50%)] rounded-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Top Donors</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaderboard.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No leaderboard data available yet.
                    </p>
                  ) : (
                    leaderboard.map((user: any, index: number) => {
                      const rank = index + 1;
                      const isCurrentUser = user.id === donorProfile?.id;
                      return (
                        <div
                          key={user.id}
                          className={`flex items-center justify-between p-4 rounded-sm ${
                            isCurrentUser
                              ? "bg-[hsl(0,80%,50%)]/10 border-2 border-[hsl(0,80%,50%)]"
                              : "bg-[hsl(0,0%,98%)] dark:bg-[hsl(14,100%,50%)]"
                          }`}
                        >
                          <div className="flex items-center space-x-4">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                                rank <= 3
                                  ? "bg-[hsl(0,80%,50%)] text-white"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {rank <= 3 ? (
                                rank === 1 ? (
                                  <Crown className="w-5 h-5" />
                                ) : rank === 2 ? (
                                  <Medal className="w-5 h-5" />
                                ) : (
                                  <Award className="w-5 h-5" />
                                )
                              ) : (
                                rank
                              )}
                            </div>
                            <div>
                              <p className="font-semibold">
                                {user.name}
                                {isCurrentUser ? " (You)" : ""}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Level {user.level || 1}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-[hsl(0,80%,50%)]">
                              {user.points || 0}
                            </div>
                            <Badge className="mt-1">
                              {getLevelName(user.points || 0)}
                            </Badge>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rewards Store Tab */}
          <TabsContent value="rewards" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="border-2 border-[hsl(0,80%,50%)] rounded-sm">
                <CardContent className="p-6 text-center">
                  <Gift className="w-16 h-16 text-[hsl(0,80%,50%)] mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Coming Soon!</h3>
                  <p className="text-muted-foreground mb-4">
                    Redeem your points for exclusive rewards, merchandise, and
                    experiences.
                  </p>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>• Exclusive Drop of Hope merchandise</p>
                    <p>• Local restaurant gift cards</p>
                    <p>• Health and wellness experiences</p>
                    <p>• Charitable donations in your name</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
