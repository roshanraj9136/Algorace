import { useAuth } from "@/hooks/useAuth";
import { useGetFeaturedProblems, useListMyMatches, useGetActiveStats } from "@workspace/api-client-react";
import { Navbar } from "@/components/Navbar";
import { MatchCard } from "@/components/MatchCard";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { FriendsSidebar } from "@/components/FriendsSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Trophy, Users, Swords, Play, Code2, Flame } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: featuredProblems = [] } = useGetFeaturedProblems();
  const { data: recentMatches = [] } = useListMyMatches();
  const { data: stats } = useGetActiveStats();

  const winRate = user ? (user.wins + user.losses > 0 ? (user.wins / (user.wins + user.losses) * 100).toFixed(1) : "0") : "0";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 py-6 sm:py-8 space-y-6 sm:space-y-8">
        <section className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center justify-between">
          <div className="space-y-1 sm:space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" data-testid="text-welcome">Welcome back, {user?.name}!</h1>
            <p className="text-muted-foreground text-sm sm:text-base">Ready to climb the ranks today?</p>
          </div>
          <Link href="/lobby">
            <Button size="lg" className="w-full sm:w-auto h-14 sm:h-16 px-6 sm:px-8 text-base sm:text-lg font-bold gap-3 shadow-[0_0_20px_rgba(0,212,255,0.3)] hover:shadow-[0_0_30px_rgba(0,212,255,0.5)] transition-all" data-testid="button-quick-play">
              <Play className="fill-current" />
              QUICK PLAY
            </Button>
          </Link>
        </section>

        <section className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <StatCard title="Rating" value={user?.elo || 0} icon={<Trophy className="text-elo w-4 h-4 sm:w-5 sm:h-5" />} data-testid="stat-elo" />
          <StatCard title="Wins" value={user?.wins || 0} icon={<Flame className="text-success w-4 h-4 sm:w-5 sm:h-5" />} data-testid="stat-wins" />
          <StatCard title="Losses" value={user?.losses || 0} icon={<Swords className="text-destructive w-4 h-4 sm:w-5 sm:h-5" />} data-testid="stat-losses" />
          <StatCard title="Win Rate" value={`${winRate}%`} icon={<Code2 className="text-primary w-4 h-4 sm:w-5 sm:h-5" />} data-testid="stat-winrate" />
          <StatCard title="Active" value={stats?.activePlayers || 0} icon={<Users className="text-primary w-4 h-4 sm:w-5 sm:h-5" />} data-testid="stat-active" />
          <StatCard title="Matches" value={stats?.totalMatches || 0} icon={<Swords className="text-primary w-4 h-4 sm:w-5 sm:h-5" />} data-testid="stat-total" />
        </section>

        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                <Flame className="text-destructive" />
                Featured Problems
              </h2>
              <Link href="/problems" className="text-sm text-primary hover:underline" data-testid="link-all-problems">View all</Link>
            </div>
            <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
              {featuredProblems.map((problem) => (
                <Card key={problem.id} className="hover:border-primary/50 transition-colors" data-testid={`card-problem-${problem.id}`}>
                  <CardContent className="p-3 sm:p-4 flex flex-col gap-2 sm:gap-3">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-sm sm:text-base truncate">{problem.title}</h3>
                      <DifficultyBadge difficulty={problem.difficulty} />
                    </div>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {problem.tags.map(tag => (
                        <span key={tag} className="text-[9px] sm:text-[10px] uppercase tracking-wider px-1.5 sm:px-2 py-0.5 bg-muted rounded border border-border">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <Link href={`/problems/${problem.id}`}>
                      <Button variant="secondary" size="sm" className="w-full" data-testid={`button-practice-${problem.id}`}>Practice</Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <FriendsSidebar />
            <div className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                <History className="text-primary" />
                Recent Matches
              </h2>
              {recentMatches.length > 0 ? (
                recentMatches.slice(0, 5).map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg text-sm">
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

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  "data-testid"?: string;
}

function StatCard({ title, value, icon, "data-testid": testId }: StatCardProps) {
  return (
    <Card data-testid={testId}>
      <CardContent className="p-3 sm:p-4 flex flex-col items-center justify-center text-center gap-0.5 sm:gap-1">
        <div className="p-1.5 sm:p-2 bg-muted rounded-full mb-0.5 sm:mb-1">
          {icon}
        </div>
        <p className="text-[10px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wider">{title}</p>
        <p className="text-base sm:text-xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

function History(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l4 2" />
    </svg>
  );
}
