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
      <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold truncate">{match.problemTitle}</span>
            <DifficultyBadge difficulty={match.problemDifficulty as "easy" | "medium" | "hard"} />
          </div>
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <span>vs {match.opponentName || "Unknown"}</span>
            {match.opponentElo && <span className="text-elo">({match.opponentElo})</span>}
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-border/40">
          <div className="flex flex-col items-start sm:items-end gap-0.5">
            <div className={`flex items-center gap-1 font-bold text-xs sm:text-sm ${won ? 'text-success' : 'text-destructive'}`}>
              {won ? <Trophy className="w-3.5 h-3.5" /> : <History className="w-3.5 h-3.5" />}
              {won ? 'WON' : 'LOST'}
            </div>
            <div className={`text-xs ${eloChange >= 0 ? 'text-success' : 'text-destructive'}`}>
              {eloChange >= 0 ? '+' : ''}{eloChange} ELO
            </div>
          </div>
          <div className="text-[11px] text-muted-foreground text-right">
            {formatDistanceToNow(new Date(match.createdAt), { addSuffix: true })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
