import Link from "next/link";
import { Plane, ShieldCheck, ArrowRight, Package, Lock, EyeOff, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TripCard } from "@/components/trip-card";
import { HeroSearch } from "@/components/hero-search";
import { FeaturedRouteCard } from "@/components/featured-route-card";
import { AnnouncementPill } from "@/components/announcement-pill";
import { FadeIn } from "@/components/fade-in";
import { TiltCard } from "@/components/tilt-card";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Trip, Profile } from "@/lib/types/db";
import { VantaClouds2Lazy as VantaClouds2 } from "@/components/vanta-clouds2";

const FEATURED_ROUTES = [
  { from: "Montreal", to: "Paris" },
  { from: "Toronto", to: "Casablanca" },
  { from: "New York", to: "London" },
  { from: "Vancouver", to: "Tokyo" },
  { from: "Waterloo", to: "Montreal" },
];

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

  const tripCount = trips.length;

  return (
    <>
      {/* ============================== PRODUCT-FIRST HERO ============================== */}
      <section className="relative overflow-hidden border-b border-border bg-background">
        <VantaClouds2 className="absolute inset-0 -z-0" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[55%] bg-gradient-to-b from-background/80 via-background/40 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-background via-background/85 to-transparent" />

        <div className="container-page relative z-10 pt-12 pb-12 md:pt-20 md:pb-20">
          <div className="mx-auto max-w-3xl text-center">
            <FadeIn delay={0}>
              <AnnouncementPill
                href="/search"
                prefix={tripCount > 0 ? `${tripCount} trips heading out this week` : "BagSlot is live"}
                badge="Find a trip"
              />
            </FadeIn>

            <FadeIn delay={0.1}>
              <h1
                className="display mt-8 text-balance text-foreground"
                style={{
                  fontSize: "clamp(2.5rem, 6vw, 4.75rem)",
                  lineHeight: 1.04,
                  letterSpacing: "-0.04em",
                  fontWeight: 700,
                }}
              >
                Find someone <em className="font-serif italic">already flying</em> there.
              </h1>
            </FadeIn>

            <FadeIn delay={0.2}>
              <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground md:text-lg">
                Send small items with verified travelers who already have empty suitcase space.
                From $5. Payment protected until delivery.
              </p>
            </FadeIn>

            <FadeIn delay={0.3}>
              <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button asChild size="lg" className="shadow-ink">
                  <Link href="/search"><Search className="h-4 w-4" /> Find a trip</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="#how-it-works">See how it works</Link>
                </Button>
              </div>
            </FadeIn>
          </div>

          <FadeIn delay={0.45} className="mx-auto mt-12 max-w-4xl">
            <HeroSearch />
          </FadeIn>

          <FadeIn delay={0.55}>
            <ul className="mx-auto mt-5 flex max-w-3xl flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
              <li className="flex items-center gap-1.5"><Lock className="h-3.5 w-3.5" /> Payment held until delivery</li>
              <li className="flex items-center gap-1.5"><EyeOff className="h-3.5 w-3.5" /> No sealed packages — ever</li>
              <li className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> ID-verified travelers</li>
            </ul>
          </FadeIn>

          <FadeIn delay={0.7} className="mx-auto mt-10 max-w-5xl">
            <div className="mb-3 text-center text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Trending routes
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {FEATURED_ROUTES.map((r) => (
                <FeaturedRouteCard key={`${r.from}-${r.to}`} from={r.from} to={r.to} />
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ============================== HOW IT WORKS (grid texture + 3D tilt cards) ============================== */}
      <section
        id="how-it-works"
        className="relative overflow-hidden border-b border-border bg-background scroll-mt-24"
      >
        <div className="linegrid pointer-events-none absolute inset-0 opacity-30" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />

        <div className="container-page relative py-16 md:py-24">
          <FadeIn from="bottom" initial={false}>
            <div className="mx-auto max-w-2xl text-center">
              <span className="chip">How it works</span>
              <h2 className="display mt-4 text-3xl md:text-4xl">
                Three steps. No middleman. No mystery fees.
              </h2>
            </div>
          </FadeIn>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              { n: "01", title: "Find a trip", body: "Search by route, date, and weight. Verified travelers only. From $5." },
              { n: "02", title: "Submit your item", body: "Describe it, snap a photo. Our safety checker flags anything risky before the traveler reviews." },
              { n: "03", title: "Handoff, paid out", body: "Pay into escrow. Funds release when the recipient confirms delivery with a one-time code." },
            ].map((step, i) => (
              <TiltCard key={step.n} delay={0.1 + i * 0.1}>
                <div className="card-surface flex h-full flex-col p-7">
                  <div className="font-mono text-xs text-muted-foreground">{step.n}</div>
                  <h3 className="mt-3 text-lg font-semibold">{step.title}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{step.body}</p>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* ============================== LIVE TRIPS ============================== */}
      <section className="border-b border-border bg-background">
        <div className="container-page py-12 md:py-16">
          <FadeIn from="bottom" initial={false}>
            <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="display text-2xl md:text-3xl">Trips heading out soon</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Real travelers, real routes. Tap a trip to request space.
                </p>
              </div>
              <Button asChild variant="ghost" size="sm" className="self-start md:self-auto">
                <Link href="/search">See all <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </div>
          </FadeIn>

          {trips.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card/40 p-10 text-center">
              <Plane className="mx-auto h-6 w-6 text-foreground" />
              <h3 className="mt-3 text-base font-semibold">Be the first to post a trip</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Senders are searching every day. Post yours and start earning.
              </p>
              <Button asChild className="mt-4">
                <Link href="/trips/new">Post a trip</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {trips.map((trip, i) => (
                <FadeIn key={trip.id} initial={false} delay={i * 0.05}>
                  <TripCard
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
                </FadeIn>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ============================== TWO-PATH BAND (with tilt) ============================== */}
      <section className="border-b border-border bg-sand-50/60">
        <div className="container-page grid gap-4 py-12 md:grid-cols-2 md:py-16">
          <TiltCard delay={0} intensity={4}>
            <PathCard
              icon={Search}
              title="Send something"
              body="Find a trusted traveler going your way. Pay only when they accept."
              ctaHref="/search"
              ctaLabel="Find a trip"
            />
          </TiltCard>
          <TiltCard delay={0.1} intensity={4}>
            <PathCard
              icon={Plane}
              title="Earn from your trip"
              body="Already flying? Turn empty kilos into $80 – $400 per trip."
              ctaHref="/trips/new"
              ctaLabel="Post a trip"
            />
          </TiltCard>
        </div>
      </section>

      {/* ============================== SAFETY STRIP ============================== */}
      <section className="border-b border-border bg-background">
        <div className="container-page py-12 md:py-14">
          <div className="grid gap-4 md:grid-cols-3">
            <FadeIn initial={false} delay={0}>
              <SafetyCell
                icon={ShieldCheck}
                title="No sealed packages"
                body="Travelers must inspect every item before pickup. No exceptions."
              />
            </FadeIn>
            <FadeIn initial={false} delay={0.1}>
              <SafetyCell
                icon={Lock}
                title="Escrowed payments"
                body="Funds are held until the recipient confirms delivery with a one-time code."
              />
            </FadeIn>
            <FadeIn initial={false} delay={0.2}>
              <SafetyCell
                icon={Package}
                title="Prohibited items blocked"
                body="Our safety checker flags risky items in real time, before the traveler sees them."
              />
            </FadeIn>
          </div>
          <div className="mt-6 text-center">
            <Link href="/safety" className="text-sm font-medium text-foreground underline-offset-4 hover:underline">
              Read the full safety rules →
            </Link>
          </div>
        </div>
      </section>

      {/* ============================== FOOTER ============================== */}
      <footer className="bg-background">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-8 text-sm text-muted-foreground md:flex-row">
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 place-items-center rounded-md bg-foreground text-background">
              <Plane className="h-3 w-3" />
            </span>
            <span className="font-medium text-foreground">BagSlot</span>
            <span className="hidden md:inline">· Find someone already flying there.</span>
          </div>
          <div className="flex items-center gap-5">
            <Link href="/safety" className="hover:text-foreground">Safety</Link>
            <Link href="/search" className="hover:text-foreground">Search</Link>
            <Link href="/trips/new" className="hover:text-foreground">Post a trip</Link>
          </div>
        </div>
      </footer>
    </>
  );
}

function PathCard({
  icon: Icon, title, body, ctaHref, ctaLabel,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string; body: string; ctaHref: string; ctaLabel: string;
}) {
  return (
    <Link
      href={ctaHref}
      className="group flex h-full flex-col gap-3 rounded-2xl border border-border bg-card p-6 transition hover:border-foreground hover:shadow-soft"
    >
      <Icon className="h-5 w-5 text-foreground" />
      <div>
        <div className="text-lg font-semibold tracking-tight">{title}</div>
        <p className="mt-1 text-sm text-muted-foreground">{body}</p>
      </div>
      <div className="mt-2 flex items-center gap-1.5 text-sm font-medium">
        {ctaLabel}
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}

function SafetyCell({
  icon: Icon, title, body,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string; body: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Icon className="h-4 w-4 text-foreground" />
      <div className="text-sm font-semibold">{title}</div>
      <p className="text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
