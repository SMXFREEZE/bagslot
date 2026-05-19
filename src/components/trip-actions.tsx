"use client";
import { CalendarPlus, Share2, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { shareUrl, haptic } from "@/lib/native";
import { toast } from "@/components/toast";

interface Props {
  tripId: string;
  route: string;
  fullUrl: string;
}

export function TripActions({ tripId, route, fullUrl }: Props) {
  const [copied, setCopied] = useState(false);

  const onShare = async () => {
    void haptic("light");
    await shareUrl({
      title: "BagSlot — " + route,
      text: `Check this trip on BagSlot: ${route}`,
      url: fullUrl,
    });
    // Fallback: copy to clipboard if Web Share isn't available
    if (typeof window === "undefined") return;
    const nav = window.navigator as unknown as { share?: unknown; clipboard?: { writeText: (s: string) => Promise<void> } };
    if (nav.share) return; // Web Share already handled by shareUrl()
    if (!nav.clipboard) return;
    try {
      await nav.clipboard.writeText(fullUrl);
      setCopied(true);
      toast.success("Link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy link");
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button asChild variant="outline" size="sm">
        <a
          href={`/api/trips/${tripId}/calendar.ics`}
          download
          onClick={() => void haptic("light")}
        >
          <CalendarPlus className="h-4 w-4" /> Add to calendar
        </a>
      </Button>
      <Button variant="outline" size="sm" onClick={onShare}>
        {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
        {copied ? "Copied" : "Share"}
      </Button>
    </div>
  );
}
