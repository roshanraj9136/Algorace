import { Card, CardContent } from "@/components/ui/card";
import { MatchSummary } from "@workspace/api-client-react";
import { DifficultyBadge } from "./DifficultyBadge";
import { formatDistanceToNow } from "date-fns";
import { Trophy, History } from "lucide-react";

interface MatchCardProps {
  match: MatchSummary;
}

export function MatchCard({ match }: MatchCardProps) {
  const won = match.won;
  const eloChange = match.eloChange || 0;

  return (
    <Card className="hover:bg-accent/50 transition-colors" data-testid={`card-match-${match.id}`}>
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{match.problemTitle}</span>
            <DifficultyBadge difficulty={match.problemDifficulty as "easy" | "medium" | "hard"} />
          </div>
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <span>vs {match.opponentName || "Unknown"}</span>
            {match.opponentElo && <span className="text-elo">({match.opponentElo})</span>}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end gap-1">
            <div className={`flex items-center gap-1 font-bold ${won ? 'text-success' : 'text-destructive'}`}>
              {won ? <Trophy className="w-4 h-4" /> : <History className="w-4 h-4" />}
              {won ? 'WON' : 'LOST'}
            </div>
            <div className={`text-sm ${eloChange >= 0 ? 'text-success' : 'text-destructive'}`}>
              {eloChange >= 0 ? '+' : ''}{eloChange} ELO
            </div>
          </div>
          <div className="text-xs text-muted-foreground text-right w-24">
            {formatDistanceToNow(new Date(match.createdAt), { addSuffix: true })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
