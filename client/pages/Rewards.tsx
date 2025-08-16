import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, ArrowLeft, Award, Star, Trophy, Crown, Medal, Gift, Target, TrendingUp, Users, Zap } from 'lucide-react';

// Mock user data
const mockUserProgress = {
  currentLevel: 'Gold',
  currentPoints: 1200,
  pointsToNextLevel: 300,
  totalDonations: 12,
  livesImpacted: 36,
  consecutiveDonations: 4,
  memberSince: '2022-01-15'
};

// Badge definitions
const badges = [
  {
    id: 1,
    name: 'First Drop',
    description: 'Complete your first blood donation',
    icon: Heart,
    earned: true,
    earnedDate: '2022-01-20',
    rarity: 'common',
    points: 50
  },
  {
    id: 2,
    name: 'Regular Donor',
    description: 'Complete 5 blood donations',
    icon: Award,
    earned: true,
    earnedDate: '2022-08-15',
    rarity: 'common',
    points: 100
  },
  {
    id: 3,
    name: 'Hero',
    description: 'Complete 10 blood donations',
    icon: Medal,
    earned: true,
    earnedDate: '2023-06-10',
    rarity: 'rare',
    points: 200
  },
  {
    id: 4,
    name: 'Life Saver',
    description: 'Impact 30+ lives through donations',
    icon: Star,
    earned: true,
    earnedDate: '2024-09-20',
    rarity: 'rare',
    points: 250
  },
  {
    id: 5,
    name: 'Streak Master',
    description: 'Complete 5 consecutive donations',
    icon: Zap,
    earned: false,
    earnedDate: null,
    rarity: 'epic',
    points: 300
  },
  {
    id: 6,
    name: 'Champion',
    description: 'Complete 20 blood donations',
    icon: Trophy,
    earned: false,
    earnedDate: null,
    rarity: 'epic',
    points: 500
  },
  {
    id: 7,
    name: 'Legendary Donor',
    description: 'Complete 50 blood donations',
    icon: Crown,
    earned: false,
    earnedDate: null,
    rarity: 'legendary',
    points: 1000
  }
];

// Level system
const levels = [
  { name: 'Bronze', minPoints: 0, maxPoints: 499, color: '#CD7F32', benefits: ['Basic profile', 'Donation tracking'] },
  { name: 'Silver', minPoints: 500, maxPoints: 999, color: '#C0C0C0', benefits: ['Priority booking', 'Special events'] },
  { name: 'Gold', minPoints: 1000, maxPoints: 1499, color: '#FFD700', benefits: ['VIP treatment', 'Exclusive drives', 'Recognition'] },
  { name: 'Platinum', minPoints: 1500, maxPoints: 2499, color: '#E5E4E2', benefits: ['Personal coordinator', 'Special rewards'] },
  { name: 'Diamond', minPoints: 2500, maxPoints: 4999, color: '#B9F2FF', benefits: ['Lifetime recognition', 'Ambassador program'] },
  { name: 'Legend', minPoints: 5000, maxPoints: Infinity, color: '#FF6347', benefits: ['Hall of Fame', 'Mentorship opportunities'] }
];

// Leaderboard data
const leaderboard = [
  { rank: 1, name: 'Sarah Johnson', points: 2850, donations: 35, badge: 'Diamond' },
  { rank: 2, name: 'Michael Chen', points: 2640, donations: 33, badge: 'Diamond' },
  { rank: 3, name: 'Emily Davis', points: 2100, donations: 26, badge: 'Platinum' },
  { rank: 4, name: 'John Doe', points: 1200, donations: 12, badge: 'Gold', isCurrentUser: true },
  { rank: 5, name: 'Anna Wilson', points: 1150, donations: 11, badge: 'Gold' },
  { rank: 6, name: 'David Brown', points: 950, donations: 9, badge: 'Silver' },
  { rank: 7, name: 'Lisa Garcia', points: 820, donations: 8, badge: 'Silver' },
  { rank: 8, name: 'Robert Miller', points: 750, donations: 7, badge: 'Silver' }
];

export default function Rewards() {
  const [activeTab, setActiveTab] = useState('overview');

  const currentLevel = levels.find(level => 
    mockUserProgress.currentPoints >= level.minPoints && 
    mockUserProgress.currentPoints <= level.maxPoints
  );

  const nextLevel = levels.find(level => level.minPoints > mockUserProgress.currentPoints);

  const progress = nextLevel ? 
    ((mockUserProgress.currentPoints - currentLevel!.minPoints) / (nextLevel.minPoints - currentLevel!.minPoints)) * 100 : 100;

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'rare': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'epic': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'legendary': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

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
              <span className="text-xl font-bold text-hope-red">Drop of Hope</span>
            </Link>
            <Button variant="outline" asChild>
              <Link to="/dashboard">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-hope-red mb-4">Rewards & Achievements</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Earn points, unlock badges, and climb the leaderboard as you save lives
          </p>
        </div>

        {/* Level Progress Card */}
        <Card className="border-0 shadow-xl mb-8">
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
                  <h2 className="text-3xl font-bold text-hope-red">{currentLevel?.name} Level</h2>
                  <p className="text-muted-foreground">
                    {mockUserProgress.currentPoints} points • {mockUserProgress.totalDonations} donations
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-hope-red">{mockUserProgress.livesImpacted}</div>
                <div className="text-sm text-muted-foreground">Lives Impacted</div>
              </div>
            </div>

            {nextLevel && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Progress to {nextLevel.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {mockUserProgress.pointsToNextLevel} points needed
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
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="w-5 h-5" />
                    <span>Recent Achievements</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {badges.filter(badge => badge.earned).slice(-3).map((badge) => (
                      <div key={badge.id} className="flex items-center space-x-3 p-3 bg-hope-pink dark:bg-hope-coral rounded-lg">
                        <div className="w-10 h-10 bg-hope-red rounded-full flex items-center justify-center">
                          <badge.icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{badge.name}</p>
                          <p className="text-xs text-muted-foreground">+{badge.points} points</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5" />
                    <span>Your Impact</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center p-3 bg-hope-pink dark:bg-hope-coral rounded-lg">
                      <div className="text-2xl font-bold text-hope-red">{mockUserProgress.totalDonations}</div>
                      <div className="text-sm text-muted-foreground">Total Donations</div>
                    </div>
                    <div className="text-center p-3 bg-hope-pink dark:bg-hope-coral rounded-lg">
                      <div className="text-2xl font-bold text-hope-red">{mockUserProgress.consecutiveDonations}</div>
                      <div className="text-sm text-muted-foreground">Current Streak</div>
                    </div>
                    <div className="text-center p-3 bg-hope-pink dark:bg-hope-coral rounded-lg">
                      <div className="text-2xl font-bold text-hope-red">#{leaderboard.findIndex(user => user.isCurrentUser) + 1}</div>
                      <div className="text-sm text-muted-foreground">Leaderboard Rank</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Next Goals */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="w-5 h-5" />
                    <span>Next Goals</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {badges.filter(badge => !badge.earned).slice(0, 3).map((badge) => (
                      <div key={badge.id} className="p-3 border border-dashed border-muted rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                            <badge.icon className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-muted-foreground">{badge.name}</p>
                            <p className="text-xs text-muted-foreground">{badge.points} points</p>
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
              {badges.map((badge) => (
                <Card key={badge.id} className={`border-0 shadow-lg ${badge.earned ? '' : 'opacity-60'}`}>
                  <CardContent className="p-6 text-center">
                    <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
                      badge.earned ? 'bg-hope-red' : 'bg-muted'
                    }`}>
                      <badge.icon className={`w-10 h-10 ${badge.earned ? 'text-white' : 'text-muted-foreground'}`} />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{badge.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{badge.description}</p>
                    <Badge className={getRarityColor(badge.rarity)}>
                      {badge.rarity.charAt(0).toUpperCase() + badge.rarity.slice(1)}
                    </Badge>
                    <div className="mt-3">
                      <span className="text-sm font-medium text-hope-red">+{badge.points} points</span>
                    </div>
                    {badge.earned && badge.earnedDate && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Earned {new Date(badge.earnedDate).toLocaleDateString()}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="space-y-6 mt-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Top Donors</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaderboard.map((user) => (
                    <div key={user.rank} className={`flex items-center justify-between p-4 rounded-lg ${
                      user.isCurrentUser ? 'bg-hope-red/10 border-2 border-hope-red' : 'bg-hope-pink dark:bg-hope-coral'
                    }`}>
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                          user.rank <= 3 ? 'bg-hope-red text-white' : 'bg-muted text-muted-foreground'
                        }`}>
                          {user.rank <= 3 ? (
                            user.rank === 1 ? <Crown className="w-5 h-5" /> :
                            user.rank === 2 ? <Medal className="w-5 h-5" /> :
                            <Award className="w-5 h-5" />
                          ) : (
                            user.rank
                          )}
                        </div>
                        <div>
                          <p className="font-semibold">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.donations} donations</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-hope-red">{user.points}</div>
                        <Badge className="mt-1">{user.badge}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rewards Store Tab */}
          <TabsContent value="rewards" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Rewards would be loaded from backend */}
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <Gift className="w-16 h-16 text-hope-red mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Coming Soon!</h3>
                  <p className="text-muted-foreground mb-4">
                    Redeem your points for exclusive rewards, merchandise, and experiences.
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
