import Link from "next/link";
import { Search as SearchIcon, Plane } from "lucide-react";
import { Card } from "@/components/ui/card";
import { TripCard } from "@/components/trip-card";
import { EmptyState } from "@/components/empty-state";
import { SearchFilters } from "./filters";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Trip, Profile } from "@/lib/types/db";

export const metadata = { title: "Find a trip" };

interface SearchParams {
  from?: string;
  to?: string;
  date?: string;
  weight?: string;
  max_price?: string;
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const supabase = await createSupabaseServerClient();
  const today = new Date().toISOString().slice(0, 10);

  let query = supabase
    .from("trips")
    .select("*")
    .eq("status", "active")
    .gte("departure_date", sp.date ?? today)
    .order("departure_date", { ascending: true })
    .limit(50);

  if (sp.from) query = query.ilike("departure_city", `%${sp.from}%`);
  if (sp.to) query = query.ilike("destination_city", `%${sp.to}%`);
  if (sp.weight) query = query.gte("available_weight_kg", Number(sp.weight));
  if (sp.max_price) query = query.lte("minimum_price", Number(sp.max_price));

  const { data: tripsData } = await query;
  const trips = (tripsData ?? []) as Trip[];

  let travelers: Record<string, Profile> = {};
  if (trips.length) {
    const ids = Array.from(new Set(trips.map((t) => t.traveler_id)));
    const { data: profData } = await supabase.from("profiles").select("*").in("id", ids);
    travelers = Object.fromEntries(((profData as Profile[]) ?? []).map((p) => [p.id, p]));
  }

  return (
    <div className="container-page py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Find a trip</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Verified travelers with empty suitcase space — going your way.
        </p>
      </div>

      <Card className="p-4">
        <SearchFilters defaults={sp} />
      </Card>

      <div className="mt-6">
        {trips.length === 0 ? (
          <EmptyState
            icon={SearchIcon}
            title="No trips match your search"
            description="Try widening the dates or removing filters. Or post your own trip."
            actionLabel="Post a trip"
            actionHref="/trips/new"
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {trips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                traveler={travelers[trip.traveler_id] ?? {
                  id: trip.traveler_id,
                  full_name: "Traveler",
                  avatar_url: null,
                  rating_average: 0,
                  rating_count: 0,
                  verification_status: "unverified",
                }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="mt-10 rounded-2xl border border-dashed border-border bg-card/50 p-6 text-center">
        <Plane className="mx-auto h-6 w-6 text-brand-600" />
        <h3 className="mt-3 text-base font-semibold">Don't see your route?</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Post your route as a sender and we'll notify you when a traveler matches.
        </p>
        <div className="mt-3">
          <Link href="/requests/new" className="text-sm font-medium text-brand-700 hover:underline">
            Post a request →
          </Link>
        </div>
      </div>
    </div>
  );
}
