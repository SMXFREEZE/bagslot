import { Check } from "lucide-react";
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
  const isErrorState = current === -1 || current === 99;

  return (
    <ol className="relative flex items-start justify-between gap-1">
      {/* Track */}
      <div className="absolute left-4 right-4 top-3.5 h-0.5 bg-border" />
      <div
        className={cn(
          "absolute left-4 top-3.5 h-0.5 transition-all duration-500",
          isErrorState ? "bg-red-500" : "bg-foreground",
        )}
        style={{
          width: isErrorState
            ? "100%"
            : current >= 0
              ? `calc(${(Math.min(current, STEPS.length - 1) / (STEPS.length - 1)) * 100}% - ${current >= STEPS.length - 1 ? "2rem" : "0px"})`
              : "0%",
        }}
      />

      {STEPS.map((step) => {
        const done = !isErrorState && current >= ORDER[step.key];
        const isCurrent = !isErrorState && current === ORDER[step.key];
        return (
          <li key={step.key} className="relative z-10 flex flex-1 flex-col items-center gap-2 text-center">
            <div
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full border-2 transition",
                done
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-background text-muted-foreground",
                isCurrent && "ring-4 ring-foreground/10",
              )}
            >
              {done ? <Check className="h-3.5 w-3.5 stroke-[3]" /> : <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />}
            </div>
            <div
              className={cn(
                "text-[10px] font-medium uppercase tracking-wider",
                done ? "text-foreground" : "text-muted-foreground",
                isCurrent && "text-foreground",
              )}
            >
              {step.label}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
