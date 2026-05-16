import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";

interface RatingBadgeProps {
  rating: number;
  className?: string;
}

export function RatingBadge({ rating, className }: RatingBadgeProps) {
  return (
    <Badge 
      variant="outline" 
      className={`bg-elo/10 text-elo border-elo/50 flex items-center gap-1 font-bold ${className}`}
      data-testid={`badge-rating-${rating}`}
    >
      <Trophy className="w-3 h-3" />
      {rating}
    </Badge>
  );
}
