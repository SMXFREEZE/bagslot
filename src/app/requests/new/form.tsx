"use client";
import { useState, useTransition, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PriceChip } from "@/components/price-chip";
import { ProhibitedWarning, BlockedWarning } from "@/components/prohibited-warning";
import { checkSafety } from "@/lib/safety";
import { quote } from "@/lib/pricing";
import { createItemRequest } from "../actions";
import type { Trip } from "@/lib/types/db";

export function NewRequestForm({ trip }: { trip: Trip }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [weight, setWeight] = useState<string>("0.5");
  const [value, setValue] = useState<string>("0");
  const [error, setError] = useState<string | null>(null);
  const [serverSafety, setServerSafety] = useState<{ status: string; reasons: string[] } | null>(null);
  const [isPending, startTransition] = useTransition();

  const safety = useMemo(
    () => checkSafety({ name, description, value: Number(value) }),
    [name, description, value],
  );

  const q = useMemo(
    () => quote(Number(weight) || 0, Number(trip.price_per_kg), Number(trip.minimum_price)),
    [weight, trip.price_per_kg, trip.minimum_price],
  );

  const overWeight = Number(weight) > Number(trip.available_weight_kg);

  return (
    <form
      action={(fd) => {
        fd.set("trip_id", trip.id);
        setError(null);
        setServerSafety(null);
        startTransition(async () => {
          const res = await createItemRequest(fd);
          if (res && !res.ok) {
            setError(res.error ?? "Something went wrong.");
            if (res.safety) setServerSafety(res.safety);
          }
        });
      }}
      className="space-y-6"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="item_name">What are you sending? *</Label>
          <Input
            id="item_name"
            name="item_name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. A pair of running shoes"
            required
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="item_description">Describe it</Label>
          <Textarea
            id="item_description"
            name="item_description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What it is, what's inside, why you're sending it."
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="item_weight_kg">Weight (kg) *</Label>
          <Input
            id="item_weight_kg"
            name="item_weight_kg"
            type="number"
            min="0.1"
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            required
          />
          {overWeight && (
            <p className="text-xs text-red-600">Heavier than the trip's available {trip.available_weight_kg} kg.</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="item_value">Estimated value ($)</Label>
          <Input
            id="item_value"
            name="item_value"
            type="number"
            min="0"
            step="10"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="item_size_description">Size</Label>
          <Input id="item_size_description" name="item_size_description" placeholder="Approx. dimensions" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="item_category">Category</Label>
          <Input id="item_category" name="item_category" placeholder="e.g. clothing, electronics, gift" />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="pickup_deadline">Need it picked up by</Label>
          <Input id="pickup_deadline" name="pickup_deadline" type="date" />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="delivery_notes">Delivery notes</Label>
          <Textarea id="delivery_notes" name="delivery_notes" placeholder="Who picks it up, where, special handling." />
        </div>
      </div>

      {safety.status === "flagged" && <ProhibitedWarning reasons={safety.reasons} />}
      {safety.status === "blocked" && <BlockedWarning reasons={safety.reasons} />}
      {serverSafety && serverSafety.status === "blocked" && <BlockedWarning reasons={serverSafety.reasons} />}

      <div className="rounded-2xl border border-border bg-sand-50 p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Suggested price</span>
          <PriceChip amount={q.total} />
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>Platform fee (12%)</span>
          <span>${q.fee.toFixed(2)}</span>
        </div>
        <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
          <span>Traveler payout</span>
          <span>${q.payout.toFixed(2)}</span>
        </div>
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={isPending || safety.status === "blocked" || overWeight}>
          {isPending ? "Submitting…" : "Submit request"}
        </Button>
      </div>
    </form>
  );
}
