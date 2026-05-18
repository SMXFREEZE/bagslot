"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, MapPin, Calendar, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CityAutocomplete } from "@/components/city-autocomplete";
import { cn } from "@/lib/utils";

export function HeroSearch({ className }: { className?: string }) {
  const router = useRouter();
  const [state, setState] = useState({ from: "", to: "", date: "", weight: "" });
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(state)) if (v) params.set(k, v);
    router.push(`/search?${params.toString()}`);
  };
  return (
    <form
      onSubmit={submit}
      className={cn(
        "card-surface group flex flex-col gap-1 p-1.5 md:flex-row md:items-center md:divide-x md:divide-border",
        className,
      )}
    >
      <Field icon={<MapPin className="h-4 w-4" />} label="From">
        <CityAutocomplete
          value={state.from}
          onChange={(v) => setState((s) => ({ ...s, from: v }))}
          placeholder="Any city"
          className="border-0 bg-transparent px-1 shadow-none focus-visible:ring-0"
        />
      </Field>
      <Field icon={<MapPin className="h-4 w-4" />} label="To">
        <CityAutocomplete
          value={state.to}
          onChange={(v) => setState((s) => ({ ...s, to: v }))}
          placeholder="Anywhere"
          className="border-0 bg-transparent px-1 shadow-none focus-visible:ring-0"
        />
      </Field>
      <Field icon={<Calendar className="h-4 w-4" />} label="After">
        <Input
          type="date"
          className="border-0 bg-transparent px-1 shadow-none focus-visible:ring-0"
          value={state.date}
          onChange={(e) => setState((s) => ({ ...s, date: e.target.value }))}
        />
      </Field>
      <Field icon={<Package className="h-4 w-4" />} label="Min kg">
        <Input
          type="number"
          step="0.5"
          min="0.5"
          className="border-0 bg-transparent px-1 shadow-none focus-visible:ring-0"
          placeholder="1"
          value={state.weight}
          onChange={(e) => setState((s) => ({ ...s, weight: e.target.value }))}
        />
      </Field>
      <div className="p-2 md:pl-3">
        <Button type="submit" size="lg" className="w-full md:w-auto">
          <Search className="h-4 w-4" /> Search
        </Button>
      </div>
    </form>
  );
}

function Field({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-1 items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-secondary/60 md:rounded-none md:px-4">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-secondary text-foreground">
        {icon}
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        {children}
      </div>
    </label>
  );
}
