import { formatCurrency, cn } from "@/lib/utils";

interface Props {
  from?: number;
  amount?: number;
  className?: string;
  label?: string;
}

export function PriceChip({ from, amount, className, label }: Props) {
  const value = amount ?? from ?? 0;
  return (
    <span
      className={cn(
        "inline-flex items-baseline gap-1 rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700",
        className,
      )}
    >
      {from !== undefined && <span className="text-xs font-medium text-brand-700/70">From</span>}
      {formatCurrency(value)}
      {label && <span className="text-xs font-medium text-brand-700/70">{label}</span>}
    </span>
  );
}
