"use client";
import { useState, useTransition } from "react";
import { Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/toast";
import { haptic } from "@/lib/native";
import { createRouteAlert } from "@/app/search/alerts/actions";

interface Props {
  from?: string;
  to?: string;
  date?: string;
  weight?: string;
  signedIn: boolean;
}

/**
 * "No trips match — get notified when a traveler posts this route" banner.
 * Saves the current search as a route_alert. The server-side trigger fires
 * a notification (in-app + email) the next time a matching trip is posted.
 */
export function RouteAlertBanner({ from, to, date, weight, signedIn }: Props) {
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  if (!from && !to && !date) return null;

  const submit = () => {
    if (!signedIn) {
      toast.error("Sign in to save alerts.", { description: "We'll email you when a match is posted." });
      return;
    }
    const fd = new FormData();
    if (from) fd.set("from_city", from);
    if (to) fd.set("to_city", to);
    if (date) fd.set("earliest_date", date);
    if (weight) fd.set("min_weight_kg", weight);
    startTransition(async () => {
      const res = await createRouteAlert(fd);
      if (res.ok) {
        setSaved(true);
        void haptic("success");
        toast.success("Alert saved.", {
          description: "We'll notify you the moment a matching trip is posted.",
        });
      } else {
        toast.error(res.error ?? "Failed to save alert.");
      }
    });
  };

  return (
    <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-border bg-sand-50/60 p-5 md:flex-row md:items-center">
      <div className="flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-foreground text-background">
          {saved ? <Check className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
        </span>
        <div>
          <div className="text-sm font-semibold">
            {saved ? "You'll be the first to know." : "Save this search as an alert"}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {saved
              ? "We'll email + push you the moment a matching trip is posted."
              : `Get notified when a traveler posts ${from ? `from ${from}` : "from anywhere"} ${to ? `to ${to}` : ""} ${date ? `after ${date}` : ""}.`}
          </p>
        </div>
      </div>
      {!saved && (
        <Button onClick={submit} disabled={pending} size="sm" className="self-end md:self-auto">
          {pending ? "Saving…" : "Save alert"}
        </Button>
      )}
    </div>
  );
}
