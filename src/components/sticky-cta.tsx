"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/**
 * Mobile-only sticky CTA. Sits above the bottom nav.
 * Use on detail/booking pages where there's a primary action.
 */
export function StickyCTA({
  label,
  href,
  className,
  variant = "default",
}: {
  label: string;
  href: string;
  className?: string;
  variant?: "default" | "outline";
}) {
  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-14 z-30 border-t border-border bg-background/95 px-4 py-3 backdrop-blur-xl md:hidden",
        className,
      )}
    >
      <Button asChild size="lg" className="w-full" variant={variant}>
        <Link href={href}>
          {label} <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}
