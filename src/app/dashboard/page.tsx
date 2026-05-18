import Link from "next/link";
import {
  Plane, Package, MessageSquare, Wallet, ArrowRight, Plus,
  Search, Inbox, Clock, ShieldCheck,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookingStatusBadge } from "@/components/booking-status-badge";
import { EmptyState } from "@/components/empty-state";
import { UserAvatar } from "@/components/user-avatar";
import { requireProfile } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatCurrency, formatShortDate, relativeTime } from "@/lib/utils";
import type { Booking, Trip, Notification } from "@/lib/types/db";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const profile = await requireProfile();
  const supabase = await createSupabaseServerClient();

  const [{ data: travelerTrips }, { data: travelerBookings }, { data: senderBookings }, { data: notifications }] = await Promise.all([
    supabase.from("trips").select("*").eq("traveler_id", profile.id).order("departure_date", { ascending: true }),
    supabase.from("bookings").select("*").eq("traveler_id", profile.id).order("created_at", { ascending: false }).limit(10),
    supabase.from("bookings").select("*").eq("sender_id", profile.id).order("created_at", { ascending: false }).limit(10),
    supabase.from("notifications").select("*").eq("user_id", profile.id).order("created_at", { ascending: false }).limit(5),
  ]);

  const upcomingTrips = (travelerTrips as Trip[] | null)?.filter((t) => t.status === "active") ?? [];
  const tBookings = (travelerBookings as Booking[] | null) ?? [];
  const sBookings = (senderBookings as Booking[] | null) ?? [];
  const allBookings = [...tBookings, ...sBookings].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
  const inbox = (notifications as Notification[] | null) ?? [];

  const today = new Date().toISOString().slice(0, 10);
  const todayBookings = allBookings.filter((b) => {
    const trip = upcomingTrips.find((t) => t.id === b.trip_id);
    return trip?.departure_date === today;
  });
  const incomingRequests = tBookings.filter((b) => b.status === "requested");
  const activeBookings = allBookings.filter((b) => !["completed", "cancelled", "rejected"].includes(b.status));
  const completedAsTraveler = tBookings.filter((b) => b.status === "completed");
  const totalEarned = completedAsTraveler.reduce((s, b) => s + Number(b.traveler_payout), 0);

  return (
    <div className="container-page py-6 md:py-10">
      {/* ============================ HEADER ============================ */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 md:mb-8">
        <div className="flex items-center gap-3">
          <UserAvatar name={profile.full_name} url={profile.avatar_url} className="h-11 w-11" />
          <div>
            <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
              Hi, {profile.full_name?.split(" ")[0] ?? "there"}.
            </h1>
            <p className="text-xs text-muted-foreground md:text-sm">
              {activeBookings.length} active · {upcomingTrips.length} upcoming trip{upcomingTrips.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm"><Link href="/search"><Search className="h-4 w-4" /> Find a trip</Link></Button>
          <Button asChild size="sm"><Link href="/trips/new"><Plus className="h-4 w-4" /> Post a trip</Link></Button>
        </div>
      </div>

      {/* ============================ ACTION CARDS ============================ */}
      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <ActionCard
          icon={Inbox}
          tone="amber"
          label="Incoming requests"
          value={incomingRequests.length}
          hint={incomingRequests.length ? "Tap to review →" : "No new requests"}
          href={incomingRequests.length ? `/bookings/${incomingRequests[0]?.id}` : "/dashboard/traveler"}
        />
        <ActionCard
          icon={Clock}
          label="Today's handoffs"
          value={todayBookings.length}
          hint={todayBookings.length ? "Active today" : "Nothing today"}
          href="/dashboard/traveler"
        />
        <ActionCard
          icon={Package}
          label="Active bookings"
          value={activeBookings.length}
          hint="In progress"
          href="/dashboard/sender"
        />
        <ActionCard
          icon={Wallet}
          tone="emerald"
          label="Earned (paid out)"
          value={formatCurrency(totalEarned)}
          hint={`${completedAsTraveler.length} completed`}
          href="/dashboard/traveler"
        />
      </div>

      {/* ============================ THREE COLUMN ============================ */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* My trips */}
        <Card className="p-5 lg:p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">My trips</h2>
            <Link href="/dashboard/traveler" className="text-xs text-muted-foreground hover:text-foreground">All →</Link>
          </div>
          {upcomingTrips.length === 0 ? (
            <div className="mt-4">
              <EmptyState icon={Plane} title="No upcoming trips" description="Post a trip to start earning." actionLabel="Post a trip" actionHref="/trips/new" />
            </div>
          ) : (
            <ul className="mt-3 divide-y divide-border">
              {upcomingTrips.slice(0, 5).map((t) => (
                <li key={t.id} className="py-2.5">
                  <Link href={`/trips/${t.id}`} className="group flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{t.departure_city} → {t.destination_city}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatShortDate(t.departure_date)} · {t.available_weight_kg} kg
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Recent bookings */}
        <Card className="p-5 lg:p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Recent bookings</h2>
            <div className="flex gap-2 text-xs">
              <Link href="/dashboard/sender" className="text-muted-foreground hover:text-foreground">Sender</Link>
              <Link href="/dashboard/traveler" className="text-muted-foreground hover:text-foreground">Traveler</Link>
            </div>
          </div>
          {allBookings.length === 0 ? (
            <div className="mt-4">
              <EmptyState icon={Package} title="No bookings yet" description="Find a trip and send your first item." actionLabel="Find a trip" actionHref="/search" />
            </div>
          ) : (
            <ul className="mt-3 divide-y divide-border">
              {allBookings.slice(0, 5).map((b) => (
                <li key={b.id} className="py-2.5">
                  <Link href={`/bookings/${b.id}`} className="group flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">#{b.id.slice(0, 8)}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatCurrency(Number(b.agreed_price))} · {b.traveler_id === profile.id ? "as traveler" : "as sender"}
                      </div>
                    </div>
                    <BookingStatusBadge status={b.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Inbox preview */}
        <Card className="p-5 lg:p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Inbox</h2>
            <Link href="/notifications" className="text-xs text-muted-foreground hover:text-foreground">All →</Link>
          </div>
          {inbox.length === 0 ? (
            <div className="mt-4">
              <EmptyState icon={MessageSquare} title="Inbox zero" description="You'll see booking updates and messages here." />
            </div>
          ) : (
            <ul className="mt-3 divide-y divide-border">
              {inbox.slice(0, 5).map((n) => (
                <li key={n.id} className="py-2.5">
                  {n.link_url ? (
                    <Link href={n.link_url} className="group block">
                      <NotifRow n={n} />
                    </Link>
                  ) : (
                    <NotifRow n={n} />
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-sand-50/60 p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-foreground text-background">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <div>
              <div className="text-sm font-semibold">Safety center</div>
              <div className="text-xs text-muted-foreground">
                Rules, prohibited items, and handoff procedures — review anytime.
              </div>
            </div>
          </div>
          <Button asChild variant="outline" size="sm"><Link href="/safety">Open safety center</Link></Button>
        </div>
      </div>
    </div>
  );
}

function ActionCard({
  icon: Icon, label, value, hint, href, tone = "default",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string; value: string | number; hint?: string; href: string;
  tone?: "default" | "amber" | "emerald";
}) {
  const toneClasses = {
    default: "bg-secondary text-foreground",
    amber: "bg-amber-50 text-amber-700",
    emerald: "bg-emerald-50 text-emerald-700",
  }[tone];
  return (
    <Link
      href={href}
      className="group flex flex-col gap-2 rounded-2xl border border-border bg-card p-4 transition hover:border-foreground hover:shadow-soft md:p-5"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
        <span className={`grid h-8 w-8 place-items-center rounded-lg ${toneClasses}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div className="text-2xl font-semibold tracking-tight">{value}</div>
      {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
    </Link>
  );
}

function NotifRow({ n }: { n: Notification }) {
  return (
    <div className="flex items-start gap-3">
      <span
        className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${n.read_at ? "bg-transparent" : "bg-foreground"}`}
      />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{n.title}</div>
        {n.body && <div className="line-clamp-1 text-xs text-muted-foreground">{n.body}</div>}
        <div className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">{relativeTime(n.created_at)}</div>
      </div>
    </div>
  );
}
