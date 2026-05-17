import { useGetLeaderboard } from "@workspace/api-client-react";
import { Navbar } from "@/components/Navbar";
import { RatingBadge } from "@/components/RatingBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { Trophy, Medal, Crown } from "lucide-react";

export default function LeaderboardPage() {
  const { data: leaderboard = [], isLoading } = useGetLeaderboard();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-6 sm:py-8 space-y-6 sm:space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">Global Leaderboard</h1>
          <p className="text-muted-foreground text-sm sm:text-lg">The world's fastest coders, ranked by rating</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {leaderboard.slice(0, 3).map((entry, index) => (
            <TopCoderCard key={entry.userId} entry={entry} rank={index + 1} />
          ))}
        </div>

        {/* Desktop table */}
        <Card className="hidden sm:block">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Rank</TableHead>
                  <TableHead>Coder</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Matches</TableHead>
                  <TableHead>Wins</TableHead>
                  <TableHead>Losses</TableHead>
                  <TableHead className="text-right">Win Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><div className="h-4 w-8 bg-muted animate-pulse rounded" /></TableCell>
                      <TableCell><div className="h-4 w-40 bg-muted animate-pulse rounded" /></TableCell>
                      <TableCell><div className="h-6 w-16 bg-muted animate-pulse rounded" /></TableCell>
                      <TableCell><div className="h-4 w-12 bg-muted animate-pulse rounded" /></TableCell>
                      <TableCell><div className="h-4 w-8 bg-muted animate-pulse rounded" /></TableCell>
                      <TableCell><div className="h-4 w-8 bg-muted animate-pulse rounded" /></TableCell>
                      <TableCell><div className="h-4 w-12 bg-muted animate-pulse rounded ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : (
                  leaderboard.slice(3).map((entry) => (
                    <TableRow key={entry.userId} className="hover:bg-accent/50 transition-colors" data-testid={`row-rank-${entry.rank}`}>
                      <TableCell className="font-mono text-muted-foreground">#{entry.rank}</TableCell>
                      <TableCell className="font-semibold">
                        <Link href={`/profile/${entry.userId}`} className="hover:text-primary transition-colors" data-testid={`link-coder-${entry.userId}`}>
                          {entry.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <RatingBadge rating={entry.elo} />
                      </TableCell>
                      <TableCell>{entry.totalMatches}</TableCell>
                      <TableCell className="text-success">{entry.wins}</TableCell>
                      <TableCell className="text-destructive">{entry.losses}</TableCell>
                      <TableCell className="text-right font-medium">{entry.winRate}%</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Mobile card list */}
        <div className="sm:hidden space-y-3">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="h-12 bg-muted animate-pulse rounded" />
                </CardContent>
              </Card>
            ))
          ) : (
            leaderboard.slice(3).map((entry) => (
              <Card key={entry.userId} className="hover:border-primary/30 transition-colors" data-testid={`row-rank-${entry.rank}`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-muted-foreground text-sm font-bold w-8 shrink-0">#{entry.rank}</span>
                    <div className="flex-1 min-w-0">
                      <Link href={`/profile/${entry.userId}`} className="font-semibold hover:text-primary transition-colors truncate block" data-testid={`link-coder-${entry.userId}`}>
                        {entry.name}
                      </Link>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="text-success">{entry.wins}W</span>
                        <span className="text-destructive">{entry.losses}L</span>
                        <span>{entry.winRate}%</span>
                      </div>
                    </div>
                    <RatingBadge rating={entry.elo} />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

type TopCoderEntry = {
  userId: number;
  name: string;
  elo: number;
  wins: number;
  winRate: number;
};

function TopCoderCard({ entry, rank }: { entry: TopCoderEntry; rank: number }) {
  const colors = {
    1: "border-yellow-500 bg-yellow-500/5",
    2: "border-slate-400 bg-slate-400/5",
    3: "border-orange-600 bg-orange-600/5",
  };
  
  const icons = {
    1: <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500" />,
    2: <Medal className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400" />,
    3: <Medal className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />,
  };

  return (
    <Card className={`relative overflow-hidden border-2 ${colors[rank as 1|2|3]}`} data-testid={`card-top-${rank}`}>
      <div className="absolute top-0 right-0 p-4 opacity-10 scale-150">
        {icons[rank as 1|2|3]}
      </div>
      <CardHeader className="text-center pb-2 px-4 sm:px-6">
        <div className="flex justify-center mb-2">
          {icons[rank as 1|2|3]}
        </div>
        <CardTitle className="text-lg sm:text-2xl truncate">
          <Link href={`/profile/${entry.userId}`} className="hover:text-primary transition-colors">
            {entry.name}
          </Link>
        </CardTitle>
        <div className="text-xs sm:text-sm font-bold text-muted-foreground uppercase tracking-widest">Rank #{rank}</div>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-3 sm:gap-4 px-4 sm:px-6">
        <RatingBadge rating={entry.elo} className="text-base sm:text-lg py-1 px-3" />
        <div className="grid grid-cols-2 gap-4 sm:gap-8 w-full text-center">
          <div>
            <div className="text-xl sm:text-2xl font-bold text-success">{entry.wins}</div>
            <div className="text-[10px] uppercase text-muted-foreground">Wins</div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold">{entry.winRate}%</div>
            <div className="text-[10px] uppercase text-muted-foreground">Rate</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
