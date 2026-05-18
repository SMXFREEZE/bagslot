"use client";
import { useState, useMemo } from "react";
import { ArrowRight, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { quote } from "@/lib/pricing";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

interface Props {
  tripId: string;
  pricePerKg: number;
  minimumPrice: number;
  availableKg: number;
  canRequest: boolean;
}

export function PriceCalculator({ tripId, pricePerKg, minimumPrice, availableKg, canRequest }: Props) {
  const [weight, setWeight] = useState("1");
  const w = Number(weight) || 0;
  const q = useMemo(() => quote(w, pricePerKg, minimumPrice), [w, pricePerKg, minimumPrice]);
  const overWeight = w > availableKg;

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="calc-weight" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Item weight
        </label>
        <div className="mt-1.5 flex items-center gap-2">
          <div className="relative flex-1">
            <Package className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="calc-weight"
              type="number"
              min="0.1"
              step="0.1"
              max={availableKg}
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="pl-10 pr-12 text-base font-medium"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              kg
            </span>
          </div>
          <div className="flex gap-1">
            {[0.5, 1, 2, 3].filter((v) => v <= availableKg).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setWeight(String(v))}
                className="rounded-lg border border-border bg-card px-2.5 py-2 text-xs font-medium transition hover:border-foreground"
              >
                {v} kg
              </button>
            ))}
          </div>
        </div>
        {overWeight && (
          <p className="mt-2 text-xs text-red-600">
            This trip only has {availableKg} kg available.
          </p>
        )}
      </div>

      <div className="space-y-1.5 rounded-xl border border-border bg-sand-50 px-4 py-3 text-sm">
        <Row label={`${w} kg × $${pricePerKg}/kg`} value={`$${(w * pricePerKg).toFixed(2)}`} />
        <Row label={`Minimum ($${minimumPrice})`} value={w * pricePerKg < minimumPrice ? "applied" : "—"} muted />
        <Row label="Platform fee (12%)" value={`$${q.fee.toFixed(2)}`} muted />
        <div className="my-2 h-px bg-border" />
        <Row label="You pay" value={formatCurrency(q.total)} strong />
        <Row label="Traveler gets" value={formatCurrency(q.payout)} muted />
      </div>

      <Button asChild size="lg" className="w-full" disabled={!canRequest || overWeight}>
        <Link href={canRequest ? `/requests/new?trip=${tripId}&weight=${w}` : `/login?next=/trips/${tripId}`}>
          {canRequest ? "Request this space" : "Sign in to request"} <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
      <p className="text-center text-[11px] text-muted-foreground">
        Free to request. You only pay if the traveler accepts.
      </p>
    </div>
  );
}

function Row({ label, value, strong, muted }: { label: string; value: string; strong?: boolean; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={muted ? "text-muted-foreground" : ""}>{label}</span>
      <span className={strong ? "font-semibold" : ""}>{value}</span>
    </div>
  );
}
