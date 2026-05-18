import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface Props {
  from: string;
  to: string;
  count?: number;
  fromPrice?: number;
}

export function FeaturedRouteCard({ from, to, count, fromPrice }: Props) {
  const href = `/search?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
  return (
    <Link
      href={href}
      className="group flex items-center justify-between gap-3 rounded-full border border-border bg-card px-4 py-2 text-sm transition hover:border-foreground hover:shadow-soft"
    >
      <span className="flex items-center gap-2">
        <span className="font-medium">{from}</span>
        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground" />
        <span className="font-medium">{to}</span>
      </span>
      <span className="text-xs text-muted-foreground">
        {count !== undefined && <>{count} {count === 1 ? "trip" : "trips"}</>}
        {fromPrice !== undefined && <> · from ${fromPrice}</>}
      </span>
    </Link>
  );
}
