import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function DashboardMetricCard({
  label,
  value,
  icon: Icon,
  hint,
  tone = "default",
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  hint?: string;
  tone?: "default" | "brand" | "success" | "warning";
}) {
  return (
    <div className="card-surface flex flex-col gap-2 p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
        <span
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-xl",
            tone === "brand" && "bg-brand-50 text-brand-700",
            tone === "success" && "bg-emerald-50 text-emerald-700",
            tone === "warning" && "bg-amber-50 text-amber-700",
            tone === "default" && "bg-muted text-foreground",
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div className="text-2xl font-semibold tracking-tight">{value}</div>
      {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}
