"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  /** Show the iOS-style back chevron + label on the left */
  backHref?: string;
  backLabel?: string;
  /** Optional right-side action */
  right?: React.ReactNode;
  /** Large-title pattern: shrinks to compact when user scrolls past 36px */
  largeTitle?: boolean;
  /** Optional subtitle below the large title */
  subtitle?: string;
}

/**
 * iOS-style navigation bar. On mobile, when `largeTitle` is true, the title
 * starts BIG (34pt) and shrinks to a compact centered title once the user
 * scrolls past it — exactly like Settings.app and Messages.app.
 */
export function IosNavBar({
  title,
  backHref,
  backLabel = "Back",
  right,
  largeTitle = true,
  subtitle,
}: Props) {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!largeTitle) return;
    const onScroll = () => setScrolled(window.scrollY > 36);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [largeTitle]);

  return (
    <>
      <div
        className={cn(
          "sticky top-0 z-30 -mx-5 flex h-12 items-center justify-between px-3 transition-colors duration-200 sm:-mx-8",
          scrolled || !largeTitle
            ? "border-b border-[hsl(var(--ios-separator))] bg-[hsl(var(--ios-grouped-bg))]/85 backdrop-blur-xl"
            : "border-b border-transparent bg-transparent",
        )}
      >
        <div className="flex flex-1 items-center">
          {backHref ? (
            <Link
              href={backHref}
              className="flex h-11 items-center gap-0.5 rounded-lg px-2 text-[17px] text-foreground active:opacity-60"
            >
              <ChevronLeft className="h-5 w-5 stroke-[2.25]" />
              <span className="-ml-0.5">{backLabel}</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => router.back()}
              className="flex h-11 items-center gap-0.5 rounded-lg px-2 text-[17px] text-foreground active:opacity-60"
              aria-label="Back"
            >
              <ChevronLeft className="h-5 w-5 stroke-[2.25]" />
            </button>
          )}
        </div>
        <div
          className={cn(
            "ios-headline transition-opacity",
            scrolled ? "opacity-100" : "opacity-0",
          )}
        >
          {title}
        </div>
        <div className="flex flex-1 items-center justify-end gap-1">{right}</div>
      </div>

      {largeTitle && (
        <div className="px-1 pt-2 pb-4">
          <h1 className="ios-title-large">{title}</h1>
          {subtitle && <p className="ios-footnote mt-1">{subtitle}</p>}
        </div>
      )}
    </>
  );
}
