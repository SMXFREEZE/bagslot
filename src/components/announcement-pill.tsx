import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  href: string;
  prefix: string;
  badge: string;
  className?: string;
}

export function AnnouncementPill({ href, prefix, badge, className }: Props) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-3 rounded-full border border-border/70 bg-card/85 px-4 py-2 text-sm shadow-sm backdrop-blur-md transition hover:shadow-md",
        className,
      )}
    >
      <span className="font-medium text-foreground">{prefix}</span>
      <span className="inline-flex items-center gap-1 rounded-full bg-foreground px-3 py-1 text-xs font-semibold text-background">
        {badge} <ArrowRight className="h-3 w-3" />
      </span>
    </Link>
  );
}
