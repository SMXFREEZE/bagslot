import Link from "next/link";
import { notFound } from "next/navigation";
import { Plane, Calendar, Package, MapPin, ShieldCheck, MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PriceChip } from "@/components/price-chip";
import { RatingStars } from "@/components/rating-stars";
import { UserAvatar } from "@/components/user-avatar";
import { VerificationBadge } from "@/components/verification-badge";
import { TrustChecklist } from "@/components/trust-checklist";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { formatDate, formatCurrency } from "@/lib/utils";
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

  return (
    <div className="container-page max-w-5xl py-8">
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Plane className="h-4 w-4 text-brand-600" />
                  {trip.airline ?? "Flight"} {trip.flight_number ? `· ${trip.flight_number}` : ""}
                </div>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight">
                  {trip.departure_city} → {trip.destination_city}
                </h1>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {trip.departure_country} → {trip.destination_country}
                </p>
              </div>
              <PriceChip from={trip.minimum_price} />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Stat icon={Calendar} label="Departure" value={formatDate(trip.departure_date)} />
              <Stat icon={Calendar} label="Arrival" value={formatDate(trip.arrival_date)} />
              <Stat icon={Package} label="Free space" value={`${trip.available_weight_kg} kg`} />
              {trip.pickup_area && <Stat icon={MapPin} label="Pickup area" value={trip.pickup_area} />}
              {trip.destination_handoff_area && <Stat icon={MapPin} label="Handoff" value={trip.destination_handoff_area} />}
              <Stat icon={ShieldCheck} label="Price / kg" value={formatCurrency(trip.price_per_kg)} />
            </div>

            {trip.available_volume_description && (
              <div className="mt-6 rounded-xl bg-sand-50 p-4 text-sm text-foreground">
                <span className="font-medium">Volume:</span> {trip.available_volume_description}
              </div>
            )}
            {trip.allowed_item_notes && (
              <div className="mt-3 rounded-xl bg-sand-50 p-4 text-sm text-foreground">
                <span className="font-medium">Notes from the traveler:</span> {trip.allowed_item_notes}
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="text-base font-semibold">Safety on this trip</h2>
            <div className="mt-3">
              <TrustChecklist compact />
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Traveler</h2>
            <div className="mt-3 flex items-center gap-3">
              <UserAvatar name={traveler?.full_name} url={traveler?.avatar_url} className="h-12 w-12" />
              <div className="min-w-0">
                <div className="truncate font-semibold">{traveler?.full_name ?? "Traveler"}</div>
                <RatingStars
                  rating={Number(traveler?.rating_average ?? 0)}
                  count={traveler?.rating_count}
                />
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <VerificationBadge status={traveler?.verification_status ?? "unverified"} />
              {traveler?.home_city && <Badge variant="muted">From {traveler.home_city}</Badge>}
            </div>
            {traveler?.bio && (
              <p className="mt-3 text-sm text-muted-foreground">{traveler.bio}</p>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="text-base font-semibold">Send an item with this trip</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Describe your item. We'll run a safety check, then the traveler reviews and accepts.
            </p>
            {isOwner ? (
              <div className="mt-4 rounded-xl bg-sand-50 p-3 text-sm text-muted-foreground">
                This is your trip. Senders' requests will appear in your dashboard.
              </div>
            ) : user ? (
              <Button asChild size="lg" className="mt-4 w-full">
                <Link href={`/requests/new?trip=${trip.id}`}>
                  <MessageSquare className="h-4 w-4" /> Request to send
                </Link>
              </Button>
            ) : (
              <Button asChild size="lg" className="mt-4 w-full">
                <Link href={`/login?next=/trips/${trip.id}`}>Sign in to request</Link>
              </Button>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="space-y-0.5">
      <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}
