import { ArrowRight, Plane } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  from: string;
  to: string;
  className?: string;
  withIcon?: boolean;
}

export function RouteBadge({ from, to, className, withIcon = true }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full bg-sand-100 px-3 py-1.5 text-sm font-medium text-foreground",
        className,
      )}
    >
      {withIcon && <Plane className="h-4 w-4 text-brand-600" />}
      <span className="truncate">{from}</span>
      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
      <span className="truncate">{to}</span>
    </span>
  );
}
