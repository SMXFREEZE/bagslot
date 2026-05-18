"use client";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plane, MapPin, Calendar, Package, DollarSign } from "lucide-react";
import { createTrip } from "../actions";

export function NewTripForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={(fd) => {
        setError(null);
        startTransition(async () => {
          const res = await createTrip(fd);
          if (res && !res.ok && res.error) setError(res.error);
        });
      }}
      className="space-y-8"
    >
      <Section icon={MapPin} title="Where are you going?">
        <Field name="departure_city" label="Departure city *" placeholder="e.g. Montreal" required />
        <Field name="departure_country" label="Departure country *" placeholder="e.g. Canada" required />
        <Field name="destination_city" label="Destination city *" placeholder="e.g. Paris" required />
        <Field name="destination_country" label="Destination country *" placeholder="e.g. France" required />
      </Section>

      <Section icon={Calendar} title="When are you flying?">
        <Field name="departure_date" label="Departure date *" type="date" required />
        <Field name="arrival_date" label="Arrival date *" type="date" required />
        <Field name="airline" label="Airline" placeholder="e.g. Air France" />
        <Field name="flight_number" label="Flight number" placeholder="e.g. AF345" />
      </Section>

      <Section icon={Package} title="How much can you carry?">
        <Field name="available_weight_kg" label="Available weight (kg) *" type="number" min="0.5" step="0.5" required />
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="available_volume_description">Volume description</Label>
          <Input id="available_volume_description" name="available_volume_description" placeholder="e.g. About the size of a shoebox" />
        </div>
      </Section>

      <Section icon={DollarSign} title="How much do you want to charge?">
        <Field name="price_per_kg" label="Price per kg ($)" type="number" min="0" step="0.5" defaultValue="8" />
        <Field name="minimum_price" label="Minimum total ($)" type="number" min="5" step="1" defaultValue="5" />
      </Section>

      <Section icon={Plane} title="Pickup & handoff areas">
        <Field name="pickup_area" label="Pickup area (origin city)" placeholder="e.g. Downtown, near a metro" />
        <Field name="destination_handoff_area" label="Handoff area (destination)" placeholder="e.g. City center, day after arrival" />
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="allowed_item_notes">Notes (optional)</Label>
          <Textarea name="allowed_item_notes" id="allowed_item_notes" placeholder="What you're okay carrying, what you'd rather not." />
        </div>
      </Section>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="flex justify-end gap-3">
        <Button type="submit" size="lg" disabled={isPending}>
          {isPending ? "Posting…" : "Post trip"}
        </Button>
      </div>
    </form>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 text-foreground">
        <Icon className="h-4 w-4 text-brand-600" />
        <h2 className="text-base font-semibold">{title}</h2>
      </div>
      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function Field({
  name,
  label,
  ...props
}: { name: string; label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} {...props} />
    </div>
  );
}
