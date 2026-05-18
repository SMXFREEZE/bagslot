import Link from "next/link";
import { Plane } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookingStatusBadge } from "@/components/booking-status-badge";
import { EmptyState } from "@/components/empty-state";
import { requireProfile } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatCurrency, formatShortDate } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { Trip, Booking } from "@/lib/types/db";

export const metadata = { title: "Traveler dashboard" };

export default async function TravelerDashboard() {
  const profile = await requireProfile();
  const supabase = await createSupabaseServerClient();
  const [{ data: tripsData }, { data: bookingsData }] = await Promise.all([
    supabase.from("trips").select("*").eq("traveler_id", profile.id).order("departure_date", { ascending: true }),
    supabase.from("bookings").select("*").eq("traveler_id", profile.id).order("created_at", { ascending: false }),
  ]);

  const trips = (tripsData as Trip[]) ?? [];
  const bookings = (bookingsData as Booking[]) ?? [];

  return (
    <div className="container-page py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Traveler dashboard</h1>
        <Button asChild><Link href="/trips/new">Post a trip</Link></Button>
      </div>

      <Tabs defaultValue="trips" className="mt-6">
        <TabsList>
          <TabsTrigger value="trips">My trips ({trips.length})</TabsTrigger>
          <TabsTrigger value="bookings">Incoming bookings ({bookings.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="trips">
          {trips.length === 0 ? (
            <EmptyState icon={Plane} title="No trips yet" description="Post a trip and senders will find you." actionLabel="Post a trip" actionHref="/trips/new" />
          ) : (
            <div className="grid gap-3">
              {trips.map((t) => (
                <Card key={t.id} className="p-5">
                  <Link href={`/trips/${t.id}`} className="flex items-center justify-between hover:underline">
                    <div>
                      <div className="font-semibold">{t.departure_city} → {t.destination_city}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatShortDate(t.departure_date)} · {t.available_weight_kg} kg · {formatCurrency(t.price_per_kg)}/kg
                      </div>
                    </div>
                    <span className="text-xs uppercase text-muted-foreground">{t.status}</span>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="bookings">
          {bookings.length === 0 ? (
            <EmptyState icon={Plane} title="No bookings yet" description="When senders request to use your space, you'll see them here." />
          ) : (
            <div className="grid gap-3">
              {bookings.map((b) => (
                <Card key={b.id} className="p-5">
                  <Link href={`/bookings/${b.id}`} className="flex items-center justify-between hover:underline">
                    <div>
                      <div className="font-medium">Booking #{b.id.slice(0, 8)}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatCurrency(Number(b.agreed_price))} · payout {formatCurrency(Number(b.traveler_payout))}
                      </div>
                    </div>
                    <BookingStatusBadge status={b.status} />
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
