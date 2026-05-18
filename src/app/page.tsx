import Link from "next/link";
import Image from "next/image";
import {
  Search, Plane, ShieldCheck, ArrowRight, Sparkles, Package,
  Wallet, MessageSquare, CheckCircle2, Globe2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TripCard } from "@/components/trip-card";
import { HeroSearch } from "@/components/hero-search";
import { Marquee } from "@/components/marquee";
import { StatRow } from "@/components/stat-row";
import { CityCard } from "@/components/city-card";
import { TestimonialCard } from "@/components/testimonial-card";
import { Faq } from "@/components/faq";
import { TrustChecklist } from "@/components/trust-checklist";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Trip, Profile } from "@/lib/types/db";
import { destinationImage, FEATURED_CITIES } from "@/lib/city-images";

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

  const routeChips = [
    "Montreal → Paris", "NYC → London", "LA → Tokyo", "Toronto → Lisbon",
    "SF → Mexico City", "Berlin → Istanbul", "Singapore → Bangkok", "Dubai → Mumbai",
    "Boston → Madrid", "Seattle → Vancouver", "Miami → Bogotá", "Sydney → Auckland",
  ];

  return (
    <>
      {/* ============================== HERO ============================== */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-sand-50 via-background to-background">
        <div className="dotgrid pointer-events-none absolute inset-0 opacity-[0.25]" />
        <div className="absolute inset-x-0 top-0 mx-auto h-[480px] max-w-5xl bg-gradient-to-b from-brand-50/80 via-brand-50/20 to-transparent blur-3xl" />

        <div className="container-page relative pt-16 pb-16 md:pt-24 md:pb-24">
          <div className="mx-auto max-w-3xl text-center">
            <span className="chip-outline">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              Peer-to-peer baggage marketplace
            </span>
            <h1 className="display mt-6 text-5xl text-foreground sm:text-6xl md:text-7xl">
              Find someone <span className="text-brand-700">already flying</span> there.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
              BagSlot lets you send small items with verified travelers who already have empty
              suitcase space. Cheaper than couriers. Built around handoffs you actually trust.
            </p>
          </div>

          <div className="mx-auto mt-10 max-w-4xl">
            <HeroSearch />
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-brand-600" /> Escrowed payment</span>
              <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-brand-600" /> ID-verified travelers</span>
              <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-brand-600" /> No sealed packages — ever</span>
            </div>
          </div>

          <div className="mt-12">
            <Marquee
              items={routeChips.map((r) => (
                <span
                  key={r}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-2 text-sm font-medium text-foreground backdrop-blur"
                >
                  <Plane className="h-3.5 w-3.5 text-brand-600" /> {r}
                </span>
              ))}
            />
          </div>
        </div>
      </section>

      {/* ============================== STATS ============================== */}
      <section className="border-b border-border bg-background">
        <div className="container-page py-12">
          <StatRow
            stats={[
              { label: "Travelers waitlisted", value: "10k+" },
              { label: "Routes covered", value: "120+" },
              { label: "Avg saved vs courier", value: "73%" },
              { label: "On-time delivery", value: "98.4%" },
            ]}
          />
        </div>
      </section>

      {/* ============================== HOW IT WORKS ============================== */}
      <section className="border-b border-border bg-sand-50/60">
        <div className="container-page py-20">
          <div className="mx-auto max-w-2xl text-center">
            <span className="chip">How it works</span>
            <h2 className="display mt-4 text-3xl md:text-4xl">
              Three steps. No middleman. No mystery fees.
            </h2>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              { n: "01", icon: Search, title: "Find a trip", body: "Search by route, date, and weight. Verified travelers only. From $5." },
              { n: "02", icon: Package, title: "Submit your item", body: "Describe it, snap a photo. Our safety checker flags anything risky before the traveler reviews." },
              { n: "03", icon: ShieldCheck, title: "Handoff, paid out", body: "Pay into escrow. Funds release when the recipient confirms delivery with a one-time code." },
            ].map((step) => (
              <Card key={step.n} className="group relative overflow-hidden p-7 transition hover:border-brand-300 hover:shadow-soft">
                <div className="flex items-center justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-700 transition group-hover:bg-brand-600 group-hover:text-white">
                    <step.icon className="h-5 w-5" />
                  </span>
                  <span className="font-mono text-sm text-muted-foreground">{step.n}</span>
                </div>
                <h3 className="mt-6 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ============================== LIVE TRIPS ============================== */}
      <section className="border-b border-border bg-background">
        <div className="container-page py-20">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xl">
              <span className="chip"><Plane className="h-3 w-3" /> Trips heading out soon</span>
              <h2 className="display mt-4 text-3xl md:text-4xl">Empty suitcase space, going your way.</h2>
              <p className="mt-2 text-muted-foreground">Browse upcoming flights. Tap a trip to submit an item request.</p>
            </div>
            <Button asChild variant="outline" className="self-start md:self-auto">
              <Link href="/search">See all routes <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>

          {trips.length === 0 ? (
            <Card className="mt-8 p-12 text-center">
              <Plane className="mx-auto h-7 w-7 text-brand-600" />
              <h3 className="mt-4 text-lg font-semibold">Be the first to post a trip</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                The marketplace is growing. Post your route — senders will find you.
              </p>
              <Button asChild className="mt-5">
                <Link href="/trips/new">Post a trip</Link>
              </Button>
            </Card>
          ) : (
            <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
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

      {/* ============================== CITY SPOTLIGHTS ============================== */}
      <section className="border-b border-border bg-sand-50/60">
        <div className="container-page py-20">
          <div className="mx-auto max-w-2xl text-center">
            <span className="chip"><Globe2 className="h-3 w-3" /> Popular destinations</span>
            <h2 className="display mt-4 text-3xl md:text-4xl">Cities people are flying to this month.</h2>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURED_CITIES.map((c) => (
              <CityCard
                key={c.city}
                city={c.city}
                country={c.country}
                image={destinationImage(c.city)}
                trips={Math.floor(Math.random() * 12) + 2}
                fromPrice={5}
                href={`/search?to=${encodeURIComponent(c.city)}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ============================== TRAVELERS / SENDERS SPLIT ============================== */}
      <section className="border-b border-border bg-background">
        <div className="container-page py-20">
          <div className="grid gap-6 lg:grid-cols-2">
            <SplitCard
              kind="traveler"
              eyebrow="For travelers"
              title="Earn from space you already have."
              body="Already flying? Post your trip in 60 seconds. Approve only the items you want to carry. Get paid the moment the recipient confirms delivery."
              ctaLabel="Post a trip"
              ctaHref="/trips/new"
              imageUrl="https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1400&q=70&auto=format&fit=crop"
              bullets={[
                "Set your own price per kg",
                "Decide what you'll carry",
                "12% platform fee, no hidden costs",
              ]}
            />
            <SplitCard
              kind="sender"
              eyebrow="For senders"
              title="Send small items for less."
              body="Find verified travelers going your way. Pay only when the booking is accepted. Track every handoff with one-time codes."
              ctaLabel="Find a trip"
              ctaHref="/search"
              imageUrl="https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=1400&q=70&auto=format&fit=crop"
              bullets={[
                "From $5 per item",
                "Funds held in escrow",
                "Safety checker runs before submission",
              ]}
            />
          </div>
        </div>
      </section>

      {/* ============================== TESTIMONIALS ============================== */}
      <section className="border-b border-border bg-sand-50/60">
        <div className="container-page py-20">
          <div className="mx-auto max-w-2xl text-center">
            <span className="chip"><MessageSquare className="h-3 w-3" /> Loved by early users</span>
            <h2 className="display mt-4 text-3xl md:text-4xl">Real handoffs. Real reviews.</h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <TestimonialCard
              name="Léa M."
              role="Sent a gift Paris → Montreal"
              quote="My grandmother's medication finally got to her on time. Way cheaper than DHL and the traveler sent a photo on arrival."
              avatar="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=70&auto=format&fit=crop"
            />
            <TestimonialCard
              name="Daniel R."
              role="Traveler · 14 trips"
              quote="I fly NYC to London every other week. BagSlot turned the empty kilos in my suitcase into around $400 a month."
              avatar="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=70&auto=format&fit=crop"
            />
            <TestimonialCard
              name="Priya S."
              role="Sent documents SF → Mumbai"
              quote="The handoff codes are the killer feature. No sketchy meetups, no second-guessing — the moment my dad got the envelope, I knew."
              avatar="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=70&auto=format&fit=crop"
            />
          </div>
        </div>
      </section>

      {/* ============================== TRUST ============================== */}
      <section className="border-b border-border bg-background">
        <div className="container-page py-20">
          <div className="grid gap-12 lg:grid-cols-5 lg:items-center">
            <div className="lg:col-span-2">
              <span className="chip"><ShieldCheck className="h-3 w-3" /> Trust by design</span>
              <h2 className="display mt-4 text-3xl md:text-4xl">Not a courier. A handoff network.</h2>
              <p className="mt-4 text-muted-foreground">
                BagSlot isn't shipping software pretending to be a marketplace. Every traveler
                inspects every item. Every payment sits in escrow. Every handoff is verified by a
                one-time code. Safety is the product.
              </p>
              <div className="mt-6 flex gap-3">
                <Button asChild>
                  <Link href="/safety">Read the rules <ArrowRight className="h-4 w-4" /></Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/signup">Create an account</Link>
                </Button>
              </div>
            </div>
            <Card className="p-8 lg:col-span-3">
              <TrustChecklist />
            </Card>
          </div>
        </div>
      </section>

      {/* ============================== PRICING TRANSPARENCY ============================== */}
      <section className="border-b border-border bg-sand-50/60">
        <div className="container-page py-20">
          <div className="mx-auto max-w-2xl text-center">
            <span className="chip"><Wallet className="h-3 w-3" /> Pricing</span>
            <h2 className="display mt-4 text-3xl md:text-4xl">No subscription. No surprise fees.</h2>
            <p className="mt-3 text-muted-foreground">
              BagSlot takes 12% of each booking — that's it. The traveler keeps the rest. The
              sender always sees the full breakdown before paying.
            </p>
          </div>
          <div className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-3">
            <PricingTile label="Minimum booking" value="$5" hint="per item" />
            <PricingTile label="Platform fee" value="12%" hint="capped, no extras" />
            <PricingTile label="Traveler payout" value="88%" hint="released on delivery" />
          </div>
        </div>
      </section>

      {/* ============================== FAQ ============================== */}
      <section className="border-b border-border bg-background">
        <div className="container-page py-20">
          <div className="mx-auto max-w-3xl">
            <div className="text-center">
              <span className="chip">FAQ</span>
              <h2 className="display mt-4 text-3xl md:text-4xl">The questions we hear most.</h2>
            </div>
            <div className="mt-10">
              <Faq
                items={[
                  { q: "Is BagSlot a shipping company?", a: "No. BagSlot is a peer-to-peer marketplace. Verified travelers carry items in their own existing luggage. We don't operate vehicles, warehouses, or couriers." },
                  { q: "What items are not allowed?", a: "Drugs, weapons, cash, ID documents, sealed/unopened packages, batteries, liquids over airline limits, food, and animals. Our safety checker flags risky items in real time." },
                  { q: "How does payment work?", a: "Senders pay into escrow when the traveler accepts. The money is held until the recipient confirms delivery with a one-time code. Then it's released to the traveler minus a 12% platform fee." },
                  { q: "What if something goes wrong?", a: "Either side can open a dispute from the booking page. Funds stay in escrow during review. We side with the verified handoff record (codes + photos + chat history)." },
                  { q: "Do you support international flights?", a: "Yes — that's the whole point. Just remember that you are responsible for customs and your airline's baggage rules. We surface declarations and value warnings before you book." },
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ============================== CTA ============================== */}
      <section className="relative overflow-hidden bg-brand-700 text-white">
        <div className="grain pointer-events-none absolute inset-0 opacity-40 mix-blend-overlay" />
        <div className="container-page relative grid items-center gap-10 py-20 md:grid-cols-2 md:py-24">
          <div>
            <h2 className="display text-3xl md:text-5xl">
              Your suitcase isn't full.<br /> Someone needs the space.
            </h2>
            <p className="mt-4 max-w-xl text-brand-50/90">
              Post your trip or send your first item in under a minute. No subscription.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row md:justify-end">
            <Button asChild size="lg" variant="secondary" className="bg-white text-brand-700 hover:bg-white/90">
              <Link href="/trips/new"><Plane className="h-4 w-4" /> Post a trip</Link>
            </Button>
            <Button asChild size="lg" className="border border-white/30 bg-transparent text-white hover:bg-white/10">
              <Link href="/search"><Search className="h-4 w-4" /> Find a trip</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ============================== FOOTER ============================== */}
      <footer className="border-t border-border bg-background">
        <div className="container-page flex flex-col items-center justify-between gap-4 py-8 text-sm text-muted-foreground md:flex-row">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-600 text-white">
              <Plane className="h-3.5 w-3.5" />
            </span>
            <span className="font-medium text-foreground">BagSlot</span>
            <span>— Find someone already flying there.</span>
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

function SplitCard({
  kind, eyebrow, title, body, ctaLabel, ctaHref, imageUrl, bullets,
}: {
  kind: "traveler" | "sender";
  eyebrow: string; title: string; body: string;
  ctaLabel: string; ctaHref: string;
  imageUrl: string; bullets: string[];
}) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="relative aspect-[16/9] w-full">
        <Image
          src={imageUrl}
          alt=""
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-black/40 to-transparent" />
        <span className="absolute left-5 top-5 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-foreground shadow-sm">
          {eyebrow}
        </span>
      </div>
      <div className="p-7">
        <h3 className="display text-2xl md:text-3xl">{title}</h3>
        <p className="mt-3 text-muted-foreground">{body}</p>
        <ul className="mt-5 space-y-2">
          {bullets.map((b) => (
            <li key={b} className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-brand-600" /> {b}
            </li>
          ))}
        </ul>
        <Button asChild className="mt-6">
          <Link href={ctaHref}>{ctaLabel} <ArrowRight className="h-4 w-4" /></Link>
        </Button>
      </div>
    </Card>
  );
}

function PricingTile({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <Card className="p-6 text-center">
      <div className="font-mono text-3xl font-semibold tracking-tight">{value}</div>
      <div className="mt-1 text-sm font-medium">{label}</div>
      <div className="mt-0.5 text-xs text-muted-foreground">{hint}</div>
    </Card>
  );
}
