"use client";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plane, MapPin, Calendar, Package, DollarSign, ShieldCheck } from "lucide-react";
import { CityAutocomplete } from "@/components/city-autocomplete";
import { createTrip } from "../actions";

export function NewTripForm() {
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [departureCity, setDepartureCity] = useState("");
  const [departureCountry, setDepartureCountry] = useState("");
  const [destinationCity, setDestinationCity] = useState("");
  const [destinationCountry, setDestinationCountry] = useState("");

  return (
    <form
      action={(fd) => {
        if (!confirmed) {
          setError("Please confirm the safety rules before posting.");
          return;
        }
        setError(null);
        startTransition(async () => {
          const res = await createTrip(fd);
          if (res && !res.ok && res.error) setError(res.error);
        });
      }}
      className="space-y-5"
    >
      <Section icon={MapPin} title="Route" subtitle="Where are you flying?">
        <div className="space-y-1.5">
          <Label htmlFor="departure_city">From city *</Label>
          <CityAutocomplete
            id="departure_city"
            name="departure_city"
            value={departureCity}
            onChange={setDepartureCity}
            onCountryChange={setDepartureCountry}
            placeholder="e.g. Montreal"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="departure_country">From country *</Label>
          <Input
            id="departure_country"
            name="departure_country"
            value={departureCountry}
            onChange={(e) => setDepartureCountry(e.target.value)}
            placeholder="e.g. Canada"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="destination_city">To city *</Label>
          <CityAutocomplete
            id="destination_city"
            name="destination_city"
            value={destinationCity}
            onChange={setDestinationCity}
            onCountryChange={setDestinationCountry}
            placeholder="e.g. Paris"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="destination_country">To country *</Label>
          <Input
            id="destination_country"
            name="destination_country"
            value={destinationCountry}
            onChange={(e) => setDestinationCountry(e.target.value)}
            placeholder="e.g. France"
            required
          />
        </div>
      </Section>

      <Section icon={Calendar} title="Travel details" subtitle="Your flight info">
        <Field name="departure_date" label="Departure *" type="date" required />
        <Field name="arrival_date" label="Arrival *" type="date" required />
        <Field name="airline" label="Airline" placeholder="e.g. Air France" />
        <Field name="flight_number" label="Flight number" placeholder="e.g. AF345" />
      </Section>

      <Section icon={Package} title="Available space" subtitle="How much can you carry?">
        <Field name="available_weight_kg" label="Free weight (kg) *" type="number" min="0.5" step="0.5" required />
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="available_volume_description">Volume description</Label>
          <Input id="available_volume_description" name="available_volume_description" placeholder="e.g. About the size of a shoebox" />
        </div>
      </Section>

      <Section icon={DollarSign} title="Pricing" subtitle="Set your rate. Platform fee is 12%.">
        <Field name="price_per_kg" label="Price per kg ($)" type="number" min="0" step="0.5" defaultValue="8" />
        <Field name="minimum_price" label="Minimum total ($)" type="number" min="5" step="1" defaultValue="5" />
      </Section>

      <Section icon={Plane} title="Pickup & handoff" subtitle="Where will you meet senders and recipients?">
        <Field name="pickup_area" label="Pickup area (origin)" placeholder="e.g. Plateau Mont-Royal, near a metro" />
        <Field name="destination_handoff_area" label="Handoff area (destination)" placeholder="e.g. Le Marais, day after arrival" />
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="allowed_item_notes">Notes for senders</Label>
          <Textarea name="allowed_item_notes" id="allowed_item_notes" placeholder="What you're OK carrying. What you'd rather not." />
        </div>
      </Section>

      <Section icon={ShieldCheck} title="Safety confirmation" subtitle="The non-negotiables.">
        <div className="sm:col-span-2">
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-card p-4 transition hover:border-foreground">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-border text-foreground focus:ring-foreground"
            />
            <div className="text-sm">
              <div className="font-medium">I understand and agree</div>
              <p className="mt-1 text-muted-foreground">
                I will inspect every item before accepting it. I will not carry sealed packages,
                prohibited items, or anything that violates my airline&apos;s baggage rules or the
                destination country&apos;s customs.
              </p>
            </div>
          </label>
        </div>
      </Section>

      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <div className="sticky bottom-16 z-10 -mx-4 border-t border-border bg-background/95 px-4 py-3 backdrop-blur md:static md:mx-0 md:border-0 md:bg-transparent md:p-0">
        <Button type="submit" size="lg" className="w-full md:w-auto" disabled={isPending}>
          {isPending ? "Posting…" : "Post trip"}
        </Button>
      </div>
    </form>
  );
}

function Section({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
      <div className="flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-secondary text-foreground">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <h2 className="text-base font-semibold">{title}</h2>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">{children}</div>
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
