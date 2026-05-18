import Image from "next/image";
import { notFound } from "next/navigation";
import {
  Plane, Calendar, Package, MapPin, ShieldCheck, ShieldAlert, ShieldX,
  Lock, EyeOff, Users, MessageSquare,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RatingStars } from "@/components/rating-stars";
import { UserAvatar } from "@/components/user-avatar";
import { VerificationBadge } from "@/components/verification-badge";
import { PriceCalculator } from "@/components/price-calculator";
import { StickyCTA } from "@/components/sticky-cta";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { formatDate, formatCurrency } from "@/lib/utils";
import { destinationImage } from "@/lib/city-images";
import type { Trip, Profile } from "@/lib/types/db";

export default async function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: tripData } = await supabase.from("trips").select("*").eq("id", id).maybeSingle();
  const trip = tripData as Trip | null;
  if (!trip) notFound();

  const { data: travelerData } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", trip.traveler_id)
    .maybeSingle();
  const traveler = travelerData as Profile | null;

  const user = await getCurrentUser();
  const isOwner = user?.id === trip.traveler_id;
  const canRequest = !!user && !isOwner;
  const image = destinationImage(trip.destination_city);
  const originImage = destinationImage(trip.departure_city);

  return (
    <>
      <div className="container-page max-w-6xl py-6 pb-32 md:py-10 md:pb-10">
        {/* ============================ HEADER ============================ */}
        <div className="mb-6 flex flex-col gap-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Plane className="h-3.5 w-3.5" />
            <span>{trip.airline ?? "Flight"}</span>
            {trip.flight_number && <span>· {trip.flight_number}</span>}
            <span>·</span>
            <span>{formatDate(trip.departure_date)}</span>
          </div>
          <h1 className="display flex flex-wrap items-baseline gap-x-3 text-3xl md:text-4xl">
            {trip.departure_city}
            <span className="text-muted-foreground">→</span>
            {trip.destination_city}
          </h1>
          <div className="text-sm text-muted-foreground">
            {trip.departure_country} → {trip.destination_country}
          </div>
        </div>

        {/* ============================ IMAGE BAND ============================ */}
        <div className="grid grid-cols-2 gap-2 overflow-hidden rounded-2xl">
          <div className="relative col-span-2 aspect-[16/9] md:col-span-1 md:aspect-[5/4]">
            <Image src={originImage} alt={trip.departure_city} fill className="object-cover" unoptimized sizes="(min-width: 768px) 50vw, 100vw" />
            <div className="absolute left-3 top-3 chip-outline bg-white/95">
              <MapPin className="h-3 w-3" /> Pickup · {trip.departure_city}
            </div>
          </div>
          <div className="relative col-span-2 aspect-[16/9] md:col-span-1 md:aspect-[5/4]">
            <Image src={image} alt={trip.destination_city} fill className="object-cover" unoptimized sizes="(min-width: 768px) 50vw, 100vw" />
            <div className="absolute left-3 top-3 chip-outline bg-white/95">
              <MapPin className="h-3 w-3" /> Handoff · {trip.destination_city}
            </div>
          </div>
        </div>

        {/* ============================ TWO COLUMN ============================ */}
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* ============================ LEFT ============================ */}
          <div className="space-y-8">
            {/* Traveler */}
            <Card className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <UserAvatar name={traveler?.full_name} url={traveler?.avatar_url} className="h-12 w-12" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-base font-semibold">{traveler?.full_name ?? "Traveler"}</span>
                      <VerificationBadge status={traveler?.verification_status ?? "unverified"} />
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-sm text-muted-foreground">
                      <RatingStars rating={Number(traveler?.rating_average ?? 0)} count={traveler?.rating_count} />
                      {traveler?.home_city && (
                        <>
                          <span>·</span>
                          <span>From {traveler.home_city}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              {traveler?.bio && (
                <p className="mt-4 text-sm text-foreground">{traveler.bio}</p>
              )}
            </Card>

            {/* Trip details */}
            <section>
              <h2 className="text-lg font-semibold tracking-tight">Trip details</h2>
              <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3">
                <Detail icon={Calendar} label="Departure" value={formatDate(trip.departure_date)} />
                <Detail icon={Calendar} label="Arrival" value={formatDate(trip.arrival_date)} />
                <Detail icon={Package} label="Free space" value={`${trip.available_weight_kg} kg`} />
                <Detail icon={MapPin} label="Pickup area" value={trip.pickup_area ?? "Flexible"} />
                <Detail icon={MapPin} label="Handoff area" value={trip.destination_handoff_area ?? "Flexible"} />
                <Detail icon={Plane} label="Airline" value={trip.airline ?? "—"} />
              </div>
              {trip.available_volume_description && (
                <div className="mt-3 rounded-xl border border-border bg-sand-50/70 px-4 py-3 text-sm text-foreground">
                  <span className="font-medium">Volume:</span> {trip.available_volume_description}
                </div>
              )}
              {trip.allowed_item_notes && (
                <div className="mt-2 rounded-xl border border-border bg-sand-50/70 px-4 py-3 text-sm text-foreground">
                  <span className="font-medium">Notes from {traveler?.full_name?.split(" ")[0] ?? "the traveler"}:</span>{" "}
                  {trip.allowed_item_notes}
                </div>
              )}
            </section>

            {/* Safety */}
            <section>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                <h2 className="text-lg font-semibold tracking-tight">Safety on this trip</h2>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <SafetyRow icon={ShieldCheck} title="ID-verified traveler" body="Identity confirmed before being allowed to post." />
                <SafetyRow icon={EyeOff} title="No sealed packages" body="Traveler inspects the item in front of you at pickup." />
                <SafetyRow icon={Lock} title="Payment held in escrow" body="Released only when delivery is confirmed by a one-time code." />
                <SafetyRow icon={Users} title="Both parties confirm handoff" body="Pickup and delivery codes prevent surprises on either side." />
              </div>
            </section>

            {/* Prohibited */}
            <section>
              <div className="flex items-center gap-2">
                <ShieldX className="h-4 w-4 text-red-600" />
                <h2 className="text-lg font-semibold tracking-tight">Prohibited items</h2>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm md:grid-cols-3">
                {[
                  "Sealed packages",
                  "Drugs & narcotics",
                  "Weapons & ammunition",
                  "Cash & bullion",
                  "ID documents & passports",
                  "Lithium batteries",
                ].map((c) => (
                  <div key={c} className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500" /> {c}
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Restricted items (medicine, liquids, food, animals) need traveler approval and may not clear customs.
              </p>
            </section>
          </div>

          {/* ============================ RIGHT (sticky on desktop) ============================ */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <Card className="p-5">
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-2xl font-semibold tracking-tight">
                    ${trip.price_per_kg}<span className="text-base font-normal text-muted-foreground">/kg</span>
                  </div>
                  <div className="text-xs text-muted-foreground">From {formatCurrency(trip.minimum_price)} per item</div>
                </div>
                <Badge variant="muted">
                  <Package className="h-3 w-3" /> {trip.available_weight_kg} kg free
                </Badge>
              </div>

              <div className="my-5 h-px bg-border" />

              <PriceCalculator
                tripId={trip.id}
                pricePerKg={Number(trip.price_per_kg)}
                minimumPrice={Number(trip.minimum_price)}
                availableKg={Number(trip.available_weight_kg)}
                canRequest={canRequest}
              />

              {isOwner && (
                <div className="mt-4 rounded-xl border border-dashed border-border bg-sand-50 px-3 py-2 text-xs text-muted-foreground">
                  This is your trip. Senders&apos; requests will appear in your dashboard.
                </div>
              )}
            </Card>

            <button
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card py-2.5 text-sm font-medium text-foreground transition hover:border-foreground"
              type="button"
              disabled
            >
              <MessageSquare className="h-4 w-4" /> Chat unlocked after booking
            </button>
          </div>
        </div>
      </div>

      {canRequest && (
        <StickyCTA label={`Request space · from $${trip.minimum_price}`} href={`/requests/new?trip=${trip.id}`} />
      )}
    </>
  );
}

function Detail({
  icon: Icon, label, value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className="mt-0.5 truncate text-sm font-medium">{value}</div>
    </div>
  );
}

function SafetyRow({
  icon: Icon, title, body,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string; body: string;
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-border bg-card p-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
      <div>
        <div className="text-sm font-medium">{title}</div>
        <p className="mt-0.5 text-xs text-muted-foreground">{body}</p>
      </div>
    </div>
  );
}

// suppress unused warning
void ShieldAlert;
