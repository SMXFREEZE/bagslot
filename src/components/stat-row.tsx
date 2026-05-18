import { cn } from "@/lib/utils";

interface Stat { label: string; value: string }

export function StatRow({ stats, className }: { stats: Stat[]; className?: string }) {
  return (
    <div className={cn("grid grid-cols-2 gap-x-8 gap-y-6 md:grid-cols-4", className)}>
      {stats.map((s) => (
        <div key={s.label}>
          <div className="font-mono text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            {s.value}
          </div>
          <div className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}
