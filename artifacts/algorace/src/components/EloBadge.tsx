import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";

interface EloBadgeProps {
  elo: number;
  className?: string;
}

export function EloBadge({ elo, className }: EloBadgeProps) {
  return (
    <Badge 
      variant="outline" 
      className={`bg-elo/10 text-elo border-elo/50 flex items-center gap-1 font-bold ${className}`}
      data-testid={`badge-elo-${elo}`}
    >
      <Trophy className="w-3 h-3" />
      {elo}
    </Badge>
  );
}
