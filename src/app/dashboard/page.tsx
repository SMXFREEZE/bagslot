import Link from "next/link";
import { Plane, Package, MessageSquare, Wallet, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardMetricCard } from "@/components/dashboard-metric-card";
import { BookingStatusBadge } from "@/components/booking-status-badge";
import { EmptyState } from "@/components/empty-state";
import { requireProfile } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatCurrency, formatShortDate } from "@/lib/utils";
import type { Booking, Trip, ItemRequest } from "@/lib/types/db";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const profile = await requireProfile();
  const supabase = await createSupabaseServerClient();

  const [{ data: travelerTrips }, { data: travelerBookings }, { data: senderBookings }] = await Promise.all([
    supabase.from("trips").select("*").eq("traveler_id", profile.id).order("departure_date", { ascending: true }),
    supabase.from("bookings").select("*").eq("traveler_id", profile.id).order("created_at", { ascending: false }).limit(10),
    supabase.from("bookings").select("*").eq("sender_id", profile.id).order("created_at", { ascending: false }).limit(10),
  ]);

  const upcomingTrips = (travelerTrips as Trip[] | null)?.filter((t) => t.status === "active") ?? [];
  const tBookings = (travelerBookings as Booking[] | null) ?? [];
  const sBookings = (senderBookings as Booking[] | null) ?? [];

  const allBookings = [...tBookings, ...sBookings];
  const completedAsTraveler = tBookings.filter((b) => b.status === "completed");
  const totalEarned = completedAsTraveler.reduce((s, b) => s + Number(b.traveler_payout), 0);

  return (
    <div className="container-page py-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Welcome, {profile.full_name?.split(" ")[0] ?? "there"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Here's what's happening with your trips and requests.</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm"><Link href="/search">Find a trip</Link></Button>
          <Button asChild size="sm"><Link href="/trips/new">Post a trip</Link></Button>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardMetricCard label="Upcoming trips" value={upcomingTrips.length} icon={Plane} tone="brand" />
        <DashboardMetricCard label="Active bookings" value={allBookings.filter((b) => !["completed", "cancelled", "rejected"].includes(b.status)).length} icon={Package} tone="default" />
        <DashboardMetricCard label="Completed" value={allBookings.filter((b) => b.status === "completed").length} icon={MessageSquare} tone="success" />
        <DashboardMetricCard label="Earned (paid out)" value={formatCurrency(totalEarned)} icon={Wallet} tone="brand" hint="Across completed bookings" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Your trips</h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/traveler">See all <ArrowRight className="h-3 w-3" /></Link>
            </Button>
          </div>
          {upcomingTrips.length === 0 ? (
            <div className="mt-4">
              <EmptyState icon={Plane} title="No upcoming trips" description="Post a trip to start earning from empty space." actionLabel="Post a trip" actionHref="/trips/new" />
            </div>
          ) : (
            <ul className="mt-3 divide-y divide-border">
              {upcomingTrips.slice(0, 4).map((t) => (
                <li key={t.id} className="py-3">
                  <Link href={`/trips/${t.id}`} className="flex items-center justify-between hover:underline">
                    <div>
                      <div className="font-medium">{t.departure_city} → {t.destination_city}</div>
                      <div className="text-xs text-muted-foreground">{formatShortDate(t.departure_date)} · {t.available_weight_kg} kg free</div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Recent bookings</h2>
            <div className="flex gap-2">
              <Button asChild variant="ghost" size="sm"><Link href="/dashboard/sender">As sender</Link></Button>
              <Button asChild variant="ghost" size="sm"><Link href="/dashboard/traveler">As traveler</Link></Button>
            </div>
          </div>
          {allBookings.length === 0 ? (
            <div className="mt-4">
              <EmptyState icon={Package} title="No bookings yet" description="Find a trip and send something, or wait for requests on your trips." actionLabel="Find a trip" actionHref="/search" />
            </div>
          ) : (
            <ul className="mt-3 divide-y divide-border">
              {allBookings.slice(0, 6).map((b) => (
                <li key={b.id} className="py-3">
                  <Link href={`/bookings/${b.id}`} className="flex items-center justify-between hover:underline">
                    <div>
                      <div className="font-medium">Booking #{b.id.slice(0, 8)}</div>
                      <div className="text-xs text-muted-foreground">{formatCurrency(Number(b.agreed_price))} · {b.traveler_id === profile.id ? "as traveler" : "as sender"}</div>
                    </div>
                    <BookingStatusBadge status={b.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
