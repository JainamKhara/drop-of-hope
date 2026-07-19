import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import ChatbotWidget from "@/components/ChatbotWidget";
import { PaginationControls } from "@/components/PaginationControls";
import {
  Heart,
  Plus,
  MessageCircle,
  ThumbsUp,
  Share2,
  Users,
  Award,
  TrendingUp,
  Send,
  Star,
  Trophy,
  Crown,
  Loader2,
  CheckCircle2 as CheckCircle,
} from "lucide-react";
import { format } from "date-fns";
import { communityService, donorService } from "@/lib/db-services";
import { useHybridAuth } from "@/contexts/HybridAuthContext";
import { useToast } from "@/hooks/use-toast";

const BLOOD_TYPE_DESCRIPTIONS: Record<string, string> = {
  "O+": "Universal donors for positive blood types",
  "O-": "Universal donors — most needed!",
  "A+": "Second most common blood type",
  "A-": "Can donate to A and AB types",
  "B+": "Can donate to B+ and AB+",
  "B-": "Can donate to B and AB types",
  "AB+": "Universal recipients",
  "AB-": "Can receive from all negative types",
};

const getBloodTypeColor = (bloodType: string) => {
  const colors: Record<string, string> = {
    "O+": "bg-red-100 text-red-800",
    "O-": "bg-red-200 text-red-900",
    "A+": "bg-blue-100 text-blue-800",
    "A-": "bg-blue-200 text-blue-900",
    "B+": "bg-green-100 text-green-800",
    "B-": "bg-green-200 text-green-900",
    "AB+": "bg-amber-100 text-amber-800",
    "AB-": "bg-amber-200 text-amber-900",
  };
  return colors[bloodType] || "bg-gray-100 text-gray-800";
};

const getLevelIcon = (level: number) => {
  if (level >= 6) return <Crown className="w-4 h-4" />;
  if (level >= 5) return <Star className="w-4 h-4" />;
  if (level >= 4) return <Award className="w-4 h-4" />;
  if (level >= 3) return <Trophy className="w-4 h-4" />;
  return <Heart className="w-4 h-4" />;
};

const getLevelLabel = (level: number) => {
  if (level >= 6) return "Legend";
  if (level >= 5) return "Diamond";
  if (level >= 4) return "Platinum";
  if (level >= 3) return "Gold";
  if (level >= 2) return "Silver";
  return "Bronze";
};

const getLevelColor = (level: number) => {
  if (level >= 6) return "text-orange-600";
  if (level >= 5) return "text-blue-600";
  if (level >= 4) return "text-gray-500";
  if (level >= 3) return "text-yellow-600";
  return "text-[hsl(0,80%,50%)]";
};

export default function Community() {
  const { donorProfile } = useHybridAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("feed");
  const [newPost, setNewPost] = useState("");
  const [posts, setPosts] = useState<any[]>([]);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [bloodTypeGroups, setBloodTypeGroups] = useState<any[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [totalDonors, setTotalDonors] = useState(0);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [comments, setComments] = useState<Record<string, any[]>>({});
  const [commenting, setCommenting] = useState<Record<string, boolean>>({});
  const [newComments, setNewComments] = useState<Record<string, string>>({});
  const [joining, setJoining] = useState<string | null>(null);

  // Pagination state
  const [postsPage, setPostsPage] = useState(1);
  const [leaderboardPage, setLeaderboardPage] = useState(1);
  const itemsPerPage = 10;

  // Load posts + leaderboard + blood type groups
  useEffect(() => {
    const load = async () => {
      setPostsLoading(true);
      const [postsRes, leaderboardRes, groupsRes, countRes] = await Promise.all(
        [
          communityService.getPosts(30),
          donorService.getLeaderboard(10),
          communityService.getBloodTypeGroups(),
          donorService.getCount(),
        ],
      );

      if (postsRes.data) setPosts(postsRes.data);
      if (leaderboardRes.data) setLeaderboard(leaderboardRes.data);
      if (groupsRes.data) setBloodTypeGroups(groupsRes.data);
      if (countRes.count) setTotalDonors(countRes.count);
      setPostsLoading(false);
    };
    load();
  }, []);

  // Pagination logic
  const paginatedPosts = posts.slice((postsPage - 1) * itemsPerPage, postsPage * itemsPerPage);
  const postsTotalPages = Math.ceil(posts.length / itemsPerPage);

  const paginatedLeaderboard = leaderboard.slice((leaderboardPage - 1) * itemsPerPage, leaderboardPage * itemsPerPage);
  const leaderboardTotalPages = Math.ceil(leaderboard.length / itemsPerPage);

  const handleJoinGroup = async (bloodType: string) => {
    if (!donorProfile?.id) {
      toast({
        title: "Login Required",
        description: "Please log in to join a community group.",
        variant: "destructive",
      });
      return;
    }

    if (donorProfile.blood_type === bloodType) {
      toast({
        title: "Already a Member",
        description: `You are already a member of the ${bloodType} group!`,
      });
      return;
    }

    try {
      setJoining(bloodType);
      const { error } = await donorService.update(donorProfile.id, {
        blood_type: bloodType as any,
      });

      if (error) throw error;

      toast({
        title: "Group Joined!",
        description: `Welcome to the ${bloodType} community! Your profile has been updated.`,
      });

      // Refresh groups to see updated count
      const groupsRes = await communityService.getBloodTypeGroups();
      if (groupsRes.data) setBloodTypeGroups(groupsRes.data);
      
      // Update local donor profile if possible or just rely on re-fetch
      window.location.reload(); // Simplest way to update global state for now
    } catch (error) {
      console.error("Error joining group:", error);
      toast({
        title: "Error",
        description: "Failed to join the group. Please try again.",
        variant: "destructive",
      });
    } finally {
      setJoining(null);
    }
  };

  const toggleComments = async (postId: string) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(postId)) {
      newExpanded.delete(postId);
    } else {
      newExpanded.add(postId);
      // Load comments if not already loaded
      if (!comments[postId]) {
        try {
          const { data } = await communityService.getComments(postId);
          if (data) {
            setComments((prev) => ({ ...prev, [postId]: data }));
          }
        } catch (error) {
          console.error("Error loading comments:", error);
        }
      }
    }
    setExpandedComments(newExpanded);
  };

  const submitComment = async (postId: string) => {
    if (!donorProfile?.id) {
      toast({
        title: "Login Required",
        description: "Please log in to leave a comment.",
        variant: "destructive",
      });
      return;
    }

    const content = newComments[postId]?.trim();
    if (!content) return;

    try {
      setCommenting((prev) => ({ ...prev, [postId]: true }));
      const { data, error } = await communityService.addComment({
        post_id: postId,
        author_id: donorProfile.id,
        content: content,
      });

      if (error) throw error;

      // Update local comments
      const newCommentWithAuthor = {
        ...data,
        donors: {
          id: donorProfile.id,
          name: donorProfile.name,
          profile_pic_url: donorProfile.profile_pic_url,
        },
      };

      setComments((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []), newCommentWithAuthor],
      }));

      // Update comment count on post
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, comments_count: (p.comments_count || 0) + 1 }
            : p,
        ),
      );

      // Clear input
      setNewComments((prev) => ({ ...prev, [postId]: "" }));
    } catch (error: any) {
      console.error("Error adding comment:", error);
      
      let errorMessage = "Failed to add comment. Please try again.";
      if (error.code === "23503") {
        errorMessage = "Database constraint error: Your donor profile is not linked to the community users table. Please contact support.";
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setCommenting((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const handleLike = async (postId: string) => {
    if (!donorProfile?.id) {
      toast({
        title: "Sign in required",
        description: "Please sign in to like posts.",
        variant: "destructive",
      });
      return;
    }
    const wasLiked = likedPosts.has(postId);
    // Optimistic update
    setLikedPosts((prev) => {
      const next = new Set(prev);
      wasLiked ? next.delete(postId) : next.add(postId);
      return next;
    });
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              likes_count: wasLiked
                ? (p.likes_count || 1) - 1
                : (p.likes_count || 0) + 1,
            }
          : p,
      ),
    );
    await communityService.toggleLike(postId, donorProfile.id);
  };

  const handleNewPost = async () => {
    if (!newPost.trim()) return;
    if (!donorProfile?.id) {
      toast({
        title: "Sign in required",
        description: "Please sign in to post.",
        variant: "destructive",
      });
      return;
    }
    setPosting(true);
    const { data, error } = await communityService.createPost({
      author_id: donorProfile.id,
      content: newPost.trim(),
    });
    if (error) {
      toast({
        title: "Post failed",
        description: "Could not publish post. Try again.",
        variant: "destructive",
      });
    } else if (data) {
      // Prepend with current donor info for immediate render
      setPosts((prev) => [
        {
          ...data,
          donors: {
            id: donorProfile.id,
            name: donorProfile.name,
            blood_type: donorProfile.blood_type,
            level: donorProfile.level || 1,
            profile_pic_url: donorProfile.profile_pic_url,
            points: donorProfile.points || 0,
          },
        },
        ...prev,
      ]);
      setNewPost("");
      toast({
        title: "Posted!",
        description: "Your post is live in the community feed.",
      });
    }
    setPosting(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[hsl(0,0%,6%)]">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[hsl(0,80%,50%)] mb-4">
            Community
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Connect with fellow donors, share your journey, and inspire others
            to save lives
          </p>
        </div>

        {/* Community Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-2 border-[hsl(0,80%,50%)]">
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 text-[hsl(0,80%,50%)] mx-auto mb-2" />
              <div className="text-2xl font-bold text-[hsl(0,80%,50%)]">
                {totalDonors || "—"}
              </div>
              <div className="text-sm text-muted-foreground">
                Registered Donors
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 border-[hsl(0,80%,50%)]">
            <CardContent className="p-6 text-center">
              <Heart className="w-8 h-8 text-[hsl(0,80%,50%)] mx-auto mb-2 fill-current" />
              <div className="text-2xl font-bold text-[hsl(0,80%,50%)]">
                {totalDonors * 3 || "—"}
              </div>
              <div className="text-sm text-muted-foreground">
                Lives Impacted
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 border-[hsl(0,80%,50%)]">
            <CardContent className="p-6 text-center">
              <MessageCircle className="w-8 h-8 text-[hsl(0,80%,50%)] mx-auto mb-2" />
              <div className="text-2xl font-bold text-[hsl(0,80%,50%)]">
                {posts.length}
              </div>
              <div className="text-sm text-muted-foreground">
                Community Posts
              </div>
            </CardContent>
          </Card>
          <Card className="border-2 border-[hsl(0,80%,50%)]">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-[hsl(0,80%,50%)] mx-auto mb-2" />
              <div className="text-2xl font-bold text-[hsl(0,80%,50%)]">
                {leaderboard[0]?.points || "—"}
              </div>
              <div className="text-sm text-muted-foreground">Top Points</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="feed">Community Feed</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            <TabsTrigger value="groups">Blood Type Groups</TabsTrigger>
          </TabsList>

          {/* ── Community Feed Tab ── */}
          <TabsContent value="feed" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Feed */}
              <div className="lg:col-span-2 space-y-6">
                {/* Create Post */}
                <Card className="border-2 border-[hsl(0,80%,50%)]">
                  <CardHeader>
                    <CardTitle>Share Your Story</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder={
                        donorProfile
                          ? "Share your donation experience, encourage others, or ask questions..."
                          : "Sign in as a donor to post..."
                      }
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                      rows={3}
                      disabled={!donorProfile}
                    />
                    <div className="flex justify-end">
                      <Button
                        className="bg-[hsl(0,80%,50%)] hover:bg-[hsl(0,80%,50%)]/90 text-white"
                        onClick={handleNewPost}
                        disabled={!newPost.trim() || posting || !donorProfile}
                      >
                        {posting ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4 mr-2" />
                        )}
                        Post
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Posts Feed */}
                {postsLoading ? (
                  <div className="flex justify-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-[hsl(0,80%,50%)]" />
                  </div>
                ) : posts.length === 0 ? (
                  <Card className="border-2 border-[hsl(0,80%,50%)]">
                    <CardContent className="py-16 text-center">
                      <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <p className="font-medium">No posts yet</p>
                      <p className="text-sm text-muted-foreground">
                        Be the first to share your story!
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  paginatedPosts.map((post) => {
                    const author = post.donors || {};
                    const level = author.level || 1;
                    const isLiked = likedPosts.has(post.id);
                    return (
                      <Card key={post.id} className="border-2 border-[hsl(0,80%,50%)]">
                        <CardContent className="p-6">
                          {/* Post Header */}
                          <div className="flex items-start space-x-3 mb-4">
                            <Avatar className="w-12 h-12">
                              <AvatarImage
                                src={author.profile_pic_url || undefined}
                              />
                              <AvatarFallback className="bg-[hsl(0,80%,50%)] text-white">
                                {(author.name || "U")
                                  .substring(0, 2)
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center flex-wrap gap-2 mb-1">
                                <h3 className="font-semibold">
                                  {author.name || "Anonymous"}
                                </h3>
                                {author.blood_type && (
                                  <Badge
                                    className={getBloodTypeColor(
                                      author.blood_type,
                                    )}
                                  >
                                    {author.blood_type}
                                  </Badge>
                                )}
                                <div
                                  className={`flex items-center space-x-1 ${getLevelColor(level)}`}
                                >
                                  {getLevelIcon(level)}
                                  <span className="text-sm font-medium">
                                    {getLevelLabel(level)}
                                  </span>
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {post.created_at
                                  ? format(
                                      new Date(post.created_at),
                                      "MMM dd, yyyy • HH:mm",
                                    )
                                  : ""}
                              </p>
                            </div>
                          </div>

                          {/* Post Content */}
                          <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap mb-4">
                            {post.content}
                          </p>

                          <div className="h-px bg-border mb-4" />

                          {/* Post Actions */}
                          <div className="flex items-center space-x-6">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleLike(post.id)}
                              className={isLiked ? "text-[hsl(0,80%,50%)]" : ""}
                            >
                              <ThumbsUp
                                className={`w-4 h-4 mr-2 ${isLiked ? "fill-current" : ""}`}
                              />
                              {post.likes_count || 0}
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => toggleComments(post.id)}
                              className={expandedComments.has(post.id) ? "text-[hsl(0,80%,50%)]" : ""}
                            >
                              <MessageCircle className="w-4 h-4 mr-2" />
                              {post.comments_count || 0}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                navigator.share?.({
                                  text: post.content,
                                  url: window.location.href,
                                });
                              }}
                            >
                              <Share2 className="w-4 h-4 mr-2" />
                              Share
                            </Button>
                          </div>

                          {expandedComments.has(post.id) && (
                            <div className="mt-4 pt-4 border-t space-y-4">
                              <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                                {comments[post.id]?.length === 0 ? (
                                  <p className="text-sm text-center text-muted-foreground py-2">
                                    No comments yet. Be the first to reply!
                                  </p>
                                ) : (
                                  comments[post.id]?.map((comment) => (
                                    <div key={comment.id} className="flex gap-3">
                                      <Avatar className="w-8 h-8">
                                        <AvatarImage src={comment.donors?.profile_pic_url} />
                                        <AvatarFallback>
                                          {comment.donors?.name?.charAt(0) || "U"}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="bg-muted/30 dark:bg-slate-800/50 border border-border/50 rounded-lg p-3 flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                          <span className="text-xs font-semibold">
                                            {comment.donors?.name || "User"}
                                          </span>
                                          <span className="text-[10px] text-muted-foreground">
                                            {format(new Date(comment.created_at), "MMM d, h:mm a")}
                                          </span>
                                        </div>
                                        <p className="text-sm">{comment.content}</p>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>

                              <div className="flex gap-2 items-start pt-2">
                                <Avatar className="w-8 h-8 mt-1">
                                  <AvatarImage src={donorProfile?.profile_pic_url} />
                                  <AvatarFallback>
                                    {donorProfile?.name?.charAt(0) || "U"}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-2">
                                  <Textarea
                                    placeholder="Write a reply..."
                                    className="min-h-[80px] bg-background border-2 border-border/50 focus-visible:ring-[hsl(0,80%,50%)] resize-none"
                                    value={newComments[post.id] || ""}
                                    onChange={(e) =>
                                      setNewComments((prev) => ({
                                        ...prev,
                                        [post.id]: e.target.value,
                                      }))
                                    }
                                  />
                                  <div className="flex justify-end">
                                    <Button
                                      size="sm"
                                      disabled={!newComments[post.id]?.trim() || commenting[post.id]}
                                      onClick={() => submitComment(post.id)}
                                    >
                                      {commenting[post.id] ? (
                                        <Loader2 className="w-3 h-3 animate-spin mr-1" />
                                      ) : (
                                        <Send className="w-3 h-3 mr-1" />
                                      )}
                                      Reply
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })
                )}
                <PaginationControls 
                  currentPage={postsPage} 
                  totalPages={postsTotalPages} 
                  onPageChange={setPostsPage} 
                />
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {donorProfile && (
                  <Card className="border-2 border-[hsl(0,80%,50%)]">
                    <CardHeader>
                      <CardTitle>Your Impact</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-center p-3 bg-[hsl(0,0%,98%)] dark:bg-[hsl(0,0%,6%)] rounded-sm">
                        <div className="text-2xl font-bold text-[hsl(0,80%,50%)]">
                          {donorProfile.points || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Your Points
                        </div>
                      </div>
                      <div className="text-center p-3 bg-[hsl(0,0%,98%)] dark:bg-[hsl(0,0%,6%)] rounded-sm">
                        <div className="text-2xl font-bold text-[hsl(0,80%,50%)]">
                          {getLevelLabel(donorProfile.level || 1)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Your Level
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card className="border-2 border-[hsl(0,80%,50%)]">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <TrendingUp className="w-5 h-5" />
                      <span>Community</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {leaderboard.slice(0, 3).map((donor, i) => (
                      <div key={donor.id} className="flex items-center gap-3">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                            i === 0
                              ? "bg-amber-400 text-white"
                              : i === 1
                                ? "bg-slate-400 text-white"
                                : "bg-orange-400 text-white"
                          }`}
                        >
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {donor.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {donor.points} pts
                          </p>
                        </div>
                      </div>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-[hsl(0,80%,50%)]"
                      onClick={() => setActiveTab("leaderboard")}
                    >
                      View Full Leaderboard
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* ── Leaderboard Tab ── */}
          <TabsContent value="leaderboard" className="space-y-6 mt-6">
            <Card className="border-2 border-[hsl(0,80%,50%)]">
              <CardHeader>
                <CardTitle>Top Donors</CardTitle>
              </CardHeader>
              <CardContent>
                {leaderboard.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No donor data yet
                  </p>
                ) : (
                  <div className="space-y-4">
                    {paginatedLeaderboard.map((donor, index) => {
                      const rank = (leaderboardPage - 1) * itemsPerPage + index + 1;
                      return (
                        <div
                          key={donor.id}
                          className="flex items-center justify-between p-4 bg-[hsl(0,0%,98%)] dark:bg-[hsl(0,0%,6%)] rounded-sm"
                        >
                          <div className="flex items-center space-x-4">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                                rank === 1
                                  ? "bg-amber-400 text-white"
                                  : rank === 2
                                    ? "bg-slate-400 text-white"
                                    : rank === 3
                                      ? "bg-orange-400 text-white"
                                      : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {rank === 1 ? (
                                <Crown className="w-5 h-5" />
                              ) : rank === 2 ? (
                                <Award className="w-5 h-5" />
                              ) : rank === 3 ? (
                                <Trophy className="w-5 h-5" />
                              ) : (
                                rank
                              )}
                            </div>
                            <Avatar className="w-10 h-10">
                              <AvatarImage
                                src={donor.profile_pic_url || undefined}
                              />
                              <AvatarFallback className="bg-[hsl(0,80%,50%)] text-white text-sm">
                                {(donor.name || "U")
                                  .substring(0, 2)
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold">{donor.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {donor.points} points ·{" "}
                                <span className={getLevelColor(donor.level || 1)}>
                                  {getLevelLabel(donor.level || 1)}
                                </span>
                              </p>
                            </div>
                          </div>
                          {donor.blood_type && (
                            <Badge
                              className={getBloodTypeColor(donor.blood_type)}
                            >
                              {donor.blood_type}
                            </Badge>
                          )}
                        </div>
                      );
                    })}
                    <PaginationControls 
                      currentPage={leaderboardPage} 
                      totalPages={leaderboardTotalPages} 
                      onPageChange={setLeaderboardPage} 
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Blood Type Groups Tab ── */}
          <TabsContent value="groups" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {(bloodTypeGroups.length > 0
                ? bloodTypeGroups
                : Object.keys(BLOOD_TYPE_DESCRIPTIONS).map((t) => ({
                    type: t,
                    count: 0,
                  }))
              ).map((group: any) => (
                <Card
                  key={group.type}
                  className="border-2 border-[hsl(0,80%,50%)] hover:shadow-xl transition-shadow"
                >
                  <CardContent className="p-6 text-center">
                    <div
                      className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold ${getBloodTypeColor(group.type)}`}
                    >
                      {group.type}
                    </div>
                    <h3 className="font-semibold text-lg mb-1">
                      {group.count ?? group.members ?? 0} Members
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {BLOOD_TYPE_DESCRIPTIONS[group.type] || ""}
                    </p>
                    <Button 
                      variant={donorProfile?.blood_type === group.type ? "outline" : "default"}
                      className={`w-full ${donorProfile?.blood_type === group.type ? "border-[hsl(0,80%,50%)] text-[hsl(0,80%,50%)]" : "bg-[hsl(0,80%,50%)] hover:bg-[hsl(0,90%,45%)]"}`}
                      disabled={joining === group.type || donorProfile?.blood_type === group.type}
                      onClick={() => handleJoinGroup(group.type)}
                    >
                      {joining === group.type ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : donorProfile?.blood_type === group.type ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Joined
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Join Group
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <ChatbotWidget />
    </div>
  );
}
