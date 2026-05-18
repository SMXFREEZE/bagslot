import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function RatingStars({
  rating,
  count,
  size = 14,
  className,
  showCount = true,
}: {
  rating: number;
  count?: number;
  size?: number;
  className?: string;
  showCount?: boolean;
}) {
  const value = Math.max(0, Math.min(5, rating));
  return (
    <span className={cn("inline-flex items-center gap-1 text-sm text-muted-foreground", className)}>
      <Star className="fill-amber-400 text-amber-400" style={{ width: size, height: size }} />
      <span className="font-medium text-foreground">{value > 0 ? value.toFixed(1) : "New"}</span>
      {showCount && count !== undefined && count > 0 && (
        <span className="text-xs">({count})</span>
      )}
    </span>
  );
}
