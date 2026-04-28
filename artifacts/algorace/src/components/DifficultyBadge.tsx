import { Badge } from "@/components/ui/badge";

interface DifficultyBadgeProps {
  difficulty: "easy" | "medium" | "hard";
  className?: string;
}

const colors = {
  easy: "bg-success/10 text-success border-success/50",
  medium: "bg-elo/10 text-elo border-elo/50",
  hard: "bg-destructive/10 text-destructive border-destructive/50",
};

export function DifficultyBadge({ difficulty, className }: DifficultyBadgeProps) {
  return (
    <Badge 
      variant="outline" 
      className={`${colors[difficulty]} capitalize ${className}`}
      data-testid={`badge-difficulty-${difficulty}`}
    >
      {difficulty}
    </Badge>
  );
}
