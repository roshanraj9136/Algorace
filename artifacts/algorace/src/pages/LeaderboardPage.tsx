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
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Global Leaderboard</h1>
          <p className="text-muted-foreground text-lg">The world's fastest coders, ranked by rating</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {leaderboard.slice(0, 3).map((entry, index) => (
            <TopCoderCard key={entry.userId} entry={entry} rank={index + 1} />
          ))}
        </div>

        <Card>
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
    1: <Crown className="w-8 h-8 text-yellow-500" />,
    2: <Medal className="w-8 h-8 text-slate-400" />,
    3: <Medal className="w-8 h-8 text-orange-600" />,
  };

  return (
    <Card className={`relative overflow-hidden border-2 ${colors[rank as 1|2|3]}`} data-testid={`card-top-${rank}`}>
      <div className="absolute top-0 right-0 p-4 opacity-10 scale-150">
        {icons[rank as 1|2|3]}
      </div>
      <CardHeader className="text-center pb-2">
        <div className="flex justify-center mb-2">
          {icons[rank as 1|2|3]}
        </div>
        <CardTitle className="text-2xl">
          <Link href={`/profile/${entry.userId}`} className="hover:text-primary transition-colors">
            {entry.name}
          </Link>
        </CardTitle>
        <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Rank #{rank}</div>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <RatingBadge rating={entry.elo} className="text-lg py-1 px-3" />
        <div className="grid grid-cols-2 gap-8 w-full text-center">
          <div>
            <div className="text-2xl font-bold text-success">{entry.wins}</div>
            <div className="text-[10px] uppercase text-muted-foreground">Wins</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{entry.winRate}%</div>
            <div className="text-[10px] uppercase text-muted-foreground">Rate</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
