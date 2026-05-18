import Link from "next/link";
import { Search, Plane, ShieldCheck, ArrowRight, Sparkles, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TripCard } from "@/components/trip-card";
import { TrustChecklist } from "@/components/trust-checklist";
import { Card } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Trip, Profile } from "@/lib/types/db";

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();
  const today = new Date().toISOString().slice(0, 10);
  const { data: tripsData } = await supabase
    .from("trips")
    .select("*")
    .eq("status", "active")
    .gte("departure_date", today)
    .order("departure_date", { ascending: true })
    .limit(6);
  const trips = (tripsData ?? []) as Trip[];

  let travelers: Record<string, Profile> = {};
  if (trips.length) {
    const ids = Array.from(new Set(trips.map((t) => t.traveler_id)));
    const { data: profData } = await supabase.from("profiles").select("*").in("id", ids);
    travelers = Object.fromEntries(((profData as Profile[]) ?? []).map((p) => [p.id, p]));
  }

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-sand-50 via-background to-brand-50/60">
        <div className="container-page grid items-center gap-12 py-16 md:grid-cols-2 md:py-24">
          <div className="animate-fade-in">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/70 px-3 py-1 text-xs font-medium text-brand-700 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" /> Peer-to-peer baggage marketplace
            </span>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Find someone <span className="text-brand-700">already flying</span> there.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              BagSlot connects senders with travelers who have empty suitcase space.
              Small items. Verified travelers. Safer handoffs.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/search">
                  <Search className="h-4 w-4" /> Find a trip
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/trips/new">
                  <Plane className="h-4 w-4" /> Post a trip
                </Link>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-brand-600" /> No sealed packages</span>
              <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-brand-600" /> ID verified travelers</span>
              <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-brand-600" /> Escrowed payment</span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 -z-10 rounded-[2rem] bg-gradient-to-tr from-brand-100/60 to-transparent blur-2xl" />
            <Card className="overflow-hidden p-0">
              <div className="bg-brand-700 px-6 py-4 text-white">
                <div className="text-xs uppercase tracking-wider text-brand-100">Live route</div>
                <div className="mt-1 text-xl font-semibold">Montreal → Paris</div>
                <div className="text-sm text-brand-100">Air France · Jun 12</div>
              </div>
              <div className="space-y-3 p-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Available weight</span>
                  <span className="font-semibold">4 kg</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">From</span>
                  <span className="font-semibold">$5</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Traveler</span>
                  <span className="font-semibold">ID verified</span>
                </div>
                <Button asChild className="mt-4 w-full">
                  <Link href="/search">
                    Browse trips <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="container-page py-16">
        <div className="grid gap-8 md:grid-cols-3">
          {[
            { icon: Search, title: "Search trips", body: "Find a verified traveler going your way. Filter by route, dates, weight, and price." },
            { icon: Package, title: "Submit your item", body: "Describe it, upload photos. Our safety checker flags anything risky before it's reviewed by the traveler." },
            { icon: ShieldCheck, title: "Pay safely, hand off in person", body: "Payment is held until the recipient confirms delivery with a one-time code. Then we release funds." },
          ].map(({ icon: Icon, title, body }, i) => (
            <Card key={i} className="p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{body}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Live trips */}
      <section className="border-t border-border bg-sand-50/60">
        <div className="container-page py-16">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">Trips heading out soon</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Use empty suitcase space from travelers going your way.
              </p>
            </div>
            <Button asChild variant="ghost">
              <Link href="/search">See all <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>

          {trips.length === 0 ? (
            <Card className="mt-6 p-10 text-center">
              <Plane className="mx-auto h-8 w-8 text-brand-600" />
              <h3 className="mt-3 text-base font-semibold">Be the first to post a trip</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                The marketplace is new and growing. Post a trip — senders will find you.
              </p>
              <Button asChild className="mt-4">
                <Link href="/trips/new">Post a trip</Link>
              </Button>
            </Card>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
      </section>

      {/* Trust */}
      <section className="container-page py-16">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Built for trust, not for logistics</h2>
            <p className="mt-3 text-muted-foreground">
              BagSlot is not a courier company. It's a lightweight marketplace for empty suitcase space
              between verified people already travelling. Safety is the product.
            </p>
            <div className="mt-5">
              <Button asChild variant="outline">
                <Link href="/safety">Read our safety rules <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
          <Card className="p-6">
            <TrustChecklist />
          </Card>
        </div>
      </section>
    </>
  );
}
