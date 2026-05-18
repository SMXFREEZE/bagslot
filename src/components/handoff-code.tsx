import { cn } from "@/lib/utils";

export function HandoffCode({ code, label, className }: { code: string; label: string; className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-dashed border-brand-300 bg-brand-50 p-4 text-center", className)}>
      <div className="text-xs font-medium uppercase tracking-wider text-brand-700/80">{label}</div>
      <div className="mt-2 font-mono text-3xl font-semibold tracking-[0.3em] text-brand-700">{code}</div>
    </div>
  );
}
