import { useParams, useLocation } from "wouter";
import {
  useGetProfile,
  useGetEloHistory,
  useGetUserMatches,
  useListFriends,
  useSendFriendRequest,
  useChallengeFriend,
  useRemoveFriend,
  getListFriendsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Navbar } from "@/components/Navbar";
import { RatingBadge } from "@/components/RatingBadge";
import { MatchCard } from "@/components/MatchCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { Trophy, Swords, Calendar, TrendingUp, Flame, UserPlus, UserMinus } from "lucide-react";
import { format } from "date-fns";

export default function ProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const id = parseInt(userId);
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profile } = useGetProfile(id);
  const { data: eloHistory = [] } = useGetEloHistory(id);
  const { data: matches = [] } = useGetUserMatches(id);
  const { data: friends = [] } = useListFriends();

  const { mutate: sendRequest, isPending: isSendingRequest } = useSendFriendRequest();
  const { mutate: challengeFriend, isPending: isChallenging } = useChallengeFriend();
  const { mutate: removeFriend, isPending: isRemoving } = useRemoveFriend();

  if (!profile) return null;

  const isSelf = user?.id === id;
  const isFriend = friends.some((f) => f.userId === id);

  const handleAddFriend = () => {
    sendRequest(
      { data: { userId: id } },
      {
        onSuccess: () => toast({ title: "Friend request sent" }),
        onError: (err) => {
          const apiError = err as { data?: { error?: string } };
          toast({
            title: "Error",
            description: apiError.data?.error || "Failed to send request",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleChallenge = () => {
    challengeFriend(
      { userId: id, data: {} },
      {
        onSuccess: (match) => {
          toast({ title: "Challenge sent", description: "Waiting for them to accept..." });
          setLocation(`/race/${match.id}`);
        },
        onError: (err) => {
          const apiError = err as { data?: { error?: string } };
          toast({
            title: "Error",
            description: apiError.data?.error || "Failed to challenge",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleRemoveFriend = () => {
    removeFriend(
      { userId: id },
      {
        onSuccess: () => {
          toast({ title: "Friend removed" });
          void queryClient.invalidateQueries({ queryKey: getListFriendsQueryKey() });
        },
      }
    );
  };

  const chartData = eloHistory.map((entry, index) => ({
    name: index,
    elo: entry.newElo,
    date: format(new Date(entry.createdAt), "MMM d, HH:mm"),
  }));

  const initials = profile.name.split(" ").map(n => n[0]).join("").toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <Card className="border-primary/20 bg-primary/5 overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent" />
          <CardContent className="relative pt-0 px-8 pb-8 flex flex-col md:flex-row items-center md:items-end gap-6 -mt-12">
            <Avatar className="w-32 h-32 border-4 border-background text-3xl font-bold bg-primary text-primary-foreground">
              <AvatarFallback className="bg-primary text-primary-foreground">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center md:text-left pb-2 space-y-1">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                <h1 className="text-3xl font-bold" data-testid="text-username">{profile.name}</h1>
                <RatingBadge rating={profile.elo} className="w-fit self-center md:self-auto px-4 py-1" />
              </div>
              <div className="flex items-center justify-center md:justify-start gap-4 text-muted-foreground text-sm">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Joined {format(new Date(profile.createdAt), "MMMM yyyy")}
                </span>
                <span className="flex items-center gap-1">
                  <Swords className="w-4 h-4" />
                  {profile.totalMatches} matches played
                </span>
              </div>
            </div>
            {!isSelf && (
              <div className="flex flex-col sm:flex-row gap-2 pb-2">
                {isFriend ? (
                  <>
                    <Button
                      size="lg"
                      className="gap-2"
                      onClick={handleChallenge}
                      disabled={isChallenging}
                      data-testid="button-challenge-friend"
                    >
                      <Swords className="w-4 h-4" />
                      Challenge Friend
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="gap-2"
                      onClick={handleRemoveFriend}
                      disabled={isRemoving}
                      data-testid="button-remove-friend"
                    >
                      <UserMinus className="w-4 h-4" />
                      Unfriend
                    </Button>
                  </>
                ) : (
                  <Button
                    size="lg"
                    variant="outline"
                    className="gap-2"
                    onClick={handleAddFriend}
                    disabled={isSendingRequest}
                    data-testid="button-add-friend"
                  >
                    <UserPlus className="w-4 h-4" />
                    Add Friend
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <section className="grid md:grid-cols-4 gap-4">
          <StatBox title="Wins" value={profile.wins} icon={<Flame className="text-success" />} data-testid="stat-wins" />
          <StatBox title="Losses" value={profile.losses} icon={<Swords className="text-destructive" />} data-testid="stat-losses" />
          <StatBox title="Win Rate" value={`${profile.winRate}%`} icon={<Trophy className="text-elo" />} data-testid="stat-winrate" />
          <StatBox title="Current Rating" value={profile.elo} icon={<TrendingUp className="text-primary" />} data-testid="stat-elo" />
        </section>

        <div className="grid lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="text-primary" />
                Rating Progression
              </CardTitle>
              <CardDescription>Your rating history over time</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorElo" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      hide 
                    />
                    <YAxis 
                      domain={['dataMin - 50', 'dataMax + 50']} 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                      labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
                      itemStyle={{ color: 'hsl(var(--primary))' }}
                      formatter={(value: number) => [value, "Rating"]}
                      labelFormatter={(label, payload) => payload[0]?.payload?.date || ""}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="elo" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorElo)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Play more matches to see your rating progress
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2 px-2">
              <Swords className="text-primary" />
              Match History
            </h2>
            <div className="space-y-3 h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-muted">
              {matches.length > 0 ? (
                matches.map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                  No matches played yet
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

interface StatBoxProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  "data-testid"?: string;
}

function StatBox({ title, value, icon, "data-testid": testId }: StatBoxProps) {
  return (
    <Card data-testid={testId}>
      <CardContent className="p-4 flex items-center gap-4">
        <div className="p-3 bg-muted rounded-xl">
          {icon}
        </div>
        <div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
