import Link from "next/link";
import { Search as SearchIcon, Plane, Filter, ArrowUpDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { TripCard } from "@/components/trip-card";
import { EmptyState } from "@/components/empty-state";
import { SearchFilters } from "./filters";
import { RouteAlertBanner } from "@/components/route-alert-banner";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import type { Trip, Profile } from "@/lib/types/db";

export const metadata = { title: "Find a trip" };

interface SearchParams {
  from?: string;
  to?: string;
  date?: string;
  weight?: string;
  max_price?: string;
  sort?: "date" | "price" | "rating";
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
    .gte("departure_date", sp.date ?? today);

  if (sp.from) query = query.ilike("departure_city", `%${sp.from}%`);
  if (sp.to) query = query.ilike("destination_city", `%${sp.to}%`);
  if (sp.weight) query = query.gte("available_weight_kg", Number(sp.weight));
  if (sp.max_price) query = query.lte("minimum_price", Number(sp.max_price));

  const sort = sp.sort ?? "date";
  if (sort === "price") query = query.order("minimum_price", { ascending: true });
  else if (sort === "rating") query = query.order("created_at", { ascending: false }); // rating sort happens client-side after profiles join
  else query = query.order("departure_date", { ascending: true });

  const { data: tripsData } = await query.limit(60);
  let trips = (tripsData ?? []) as Trip[];

  let travelers: Record<string, Profile> = {};
  if (trips.length) {
    const ids = Array.from(new Set(trips.map((t) => t.traveler_id)));
    const { data: profData } = await supabase.from("profiles").select("*").in("id", ids);
    travelers = Object.fromEntries(((profData as Profile[]) ?? []).map((p) => [p.id, p]));
  }

  if (sort === "rating") {
    trips = [...trips].sort((a, b) => (
      Number(travelers[b.traveler_id]?.rating_average ?? 0) -
      Number(travelers[a.traveler_id]?.rating_average ?? 0)
    ));
  }

  const activeFilterCount =
    (sp.from ? 1 : 0) + (sp.to ? 1 : 0) + (sp.date ? 1 : 0) + (sp.weight ? 1 : 0) + (sp.max_price ? 1 : 0);

  const user = await getCurrentUser();
  const hasFilter = Boolean(sp.from || sp.to || sp.date);

  return (
    <div>
      {/* ============================ STICKY SEARCH BAR ============================ */}
      <div className="sticky top-16 z-30 border-b border-border bg-background/95 backdrop-blur-xl">
        <div className="container-page py-3">
          <SearchFilters defaults={sp} />
        </div>
      </div>

      <div className="container-page py-6 md:py-8">
        {/* ============================ TOOLBAR ============================ */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
              {trips.length} {trips.length === 1 ? "trip" : "trips"} match your search
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {activeFilterCount > 0
                ? `${activeFilterCount} filter${activeFilterCount === 1 ? "" : "s"} applied`
                : "Showing all upcoming trips"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <SortDropdown current={sort} sp={sp} />
            <Link
              href="/search"
              className="hidden items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-sm font-medium transition hover:border-foreground md:inline-flex"
            >
              <Filter className="h-4 w-4" /> Reset
            </Link>
          </div>
        </div>

        {/* ============================ RESULTS ============================ */}
        {trips.length === 0 ? (
          <EmptyState
            icon={SearchIcon}
            title="No trips match your search"
            description="Try widening the dates or removing filters. Or post your own request and we'll notify you when a traveler matches."
            actionLabel="Post a trip"
            actionHref="/trips/new"
          />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
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

        {hasFilter && (
          <div className="mt-8">
            <RouteAlertBanner
              from={sp.from}
              to={sp.to}
              date={sp.date}
              weight={sp.weight}
              signedIn={!!user}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function SortDropdown({ current, sp }: { current: string; sp: SearchParams }) {
  const baseParams = (s: string) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) if (v && k !== "sort") p.set(k, String(v));
    p.set("sort", s);
    return p.toString();
  };
  const opts: { v: "date" | "price" | "rating"; label: string }[] = [
    { v: "date", label: "Soonest" },
    { v: "price", label: "Cheapest" },
    { v: "rating", label: "Best rated" },
  ];
  return (
    <div className="inline-flex items-center gap-1 rounded-xl border border-border bg-card p-1 text-xs font-medium">
      <ArrowUpDown className="ml-1.5 h-3 w-3 text-muted-foreground" />
      {opts.map((o) => (
        <Link
          key={o.v}
          href={`/search?${baseParams(o.v)}`}
          className={`rounded-lg px-2.5 py-1.5 transition ${current === o.v ? "bg-foreground text-background" : "hover:bg-secondary"}`}
        >
          {o.label}
        </Link>
      ))}
    </div>
  );
}
