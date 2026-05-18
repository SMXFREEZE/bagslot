import { ShieldCheck } from "lucide-react";
import { SAFETY_RULES } from "@/lib/safety";

export function TrustChecklist({ compact = false }: { compact?: boolean }) {
  const items = compact ? SAFETY_RULES.slice(0, 4) : SAFETY_RULES;
  return (
    <ul className="space-y-2.5">
      {items.map((rule, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-foreground">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
          <span>{rule}</span>
        </li>
      ))}
    </ul>
  );
}
