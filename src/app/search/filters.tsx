"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CityAutocomplete } from "@/components/city-autocomplete";
import { Search } from "lucide-react";

export function SearchFilters({ defaults }: { defaults: { from?: string; to?: string; date?: string; weight?: string; max_price?: string } }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [state, setState] = useState({
    from: defaults.from ?? "",
    to: defaults.to ?? "",
    date: defaults.date ?? "",
    weight: defaults.weight ?? "",
    max_price: defaults.max_price ?? "",
  });

  const onChange = (k: keyof typeof state) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setState((s) => ({ ...s, [k]: e.target.value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(state)) {
      if (v) params.set(k, v);
    }
    startTransition(() => router.push(`/search?${params.toString()}`));
  };

  return (
    <form onSubmit={submit} className="grid grid-cols-1 gap-3 md:grid-cols-6">
      <div className="md:col-span-2">
        <Label htmlFor="from" className="text-xs">From</Label>
        <CityAutocomplete
          id="from"
          value={state.from}
          onChange={(v) => setState((s) => ({ ...s, from: v }))}
          placeholder="Any city"
        />
      </div>
      <div className="md:col-span-2">
        <Label htmlFor="to" className="text-xs">To</Label>
        <CityAutocomplete
          id="to"
          value={state.to}
          onChange={(v) => setState((s) => ({ ...s, to: v }))}
          placeholder="Any city"
        />
      </div>
      <div>
        <Label htmlFor="date" className="text-xs">After</Label>
        <Input id="date" type="date" value={state.date} onChange={onChange("date")} />
      </div>
      <div>
        <Label htmlFor="weight" className="text-xs">Min kg</Label>
        <Input id="weight" type="number" min="0.5" step="0.5" value={state.weight} onChange={onChange("weight")} />
      </div>
      <div className="md:col-span-5" />
      <Button type="submit" className="md:col-span-1">
        <Search className="h-4 w-4" /> Search
      </Button>
    </form>
  );
}
