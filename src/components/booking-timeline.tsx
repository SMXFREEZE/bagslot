import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BookingStatus } from "@/lib/types/db";

const STEPS: { key: BookingStatus; label: string }[] = [
  { key: "requested", label: "Requested" },
  { key: "accepted", label: "Accepted" },
  { key: "paid", label: "Paid" },
  { key: "picked_up", label: "Picked up" },
  { key: "delivered", label: "Delivered" },
  { key: "completed", label: "Completed" },
];

const ORDER: Record<BookingStatus, number> = {
  requested: 0,
  accepted: 1,
  rejected: 1,
  payment_pending: 1,
  paid: 2,
  picked_up: 3,
  in_transit: 3,
  delivered: 4,
  completed: 5,
  disputed: 99,
  cancelled: -1,
};

export function BookingTimeline({ status }: { status: BookingStatus }) {
  const current = ORDER[status];
  return (
    <ol className="flex items-center justify-between gap-2">
      {STEPS.map((step, i) => {
        const done = current >= ORDER[step.key] && current !== -1 && current !== 99;
        return (
          <li key={step.key} className="flex flex-1 flex-col items-center gap-2 text-center">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border-2 transition",
                done
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-border bg-card text-muted-foreground",
              )}
            >
              {done ? <Check className="h-4 w-4" /> : <Circle className="h-3 w-3" />}
            </div>
            <div className={cn("text-xs font-medium", done ? "text-foreground" : "text-muted-foreground")}>
              {step.label}
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn("absolute hidden h-0.5 w-full", done && "bg-brand-600")} />
            )}
          </li>
        );
      })}
    </ol>
  );
}
