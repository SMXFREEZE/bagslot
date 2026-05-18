import { Card } from "@/components/ui/card";
import { DashboardMetricCard } from "@/components/dashboard-metric-card";
import { BookingStatusBadge } from "@/components/booking-status-badge";
import { SafetyBadge } from "@/components/safety-badge";
import { Badge } from "@/components/ui/badge";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { Plane, Package, Users, AlertOctagon, CreditCard, ShieldAlert } from "lucide-react";
import { formatCurrency, relativeTime } from "@/lib/utils";
import { env } from "@/lib/env";
import type { Booking, ItemRequest, SafetyFlag, Profile, Trip, Payment } from "@/lib/types/db";

export const metadata = { title: "Admin · BagSlot" };

export default async function AdminPage() {
  await requireAdmin();

  if (!env.supabaseServiceKey) {
    return (
      <div className="container-page max-w-3xl py-10">
        <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
        <Card className="mt-6 border-amber-200 bg-amber-50/40 p-6 text-sm text-amber-900">
          The admin dashboard needs <code className="font-mono">SUPABASE_SERVICE_ROLE_KEY</code> to query across all users.
          Add it to your environment to enable.
        </Card>
      </div>
    );
  }

  const supabase = createSupabaseAdminClient();
  const [
    { count: userCount },
    { count: tripCount },
    { count: bookingCount },
    { data: flagsData },
    { data: bookingsData },
    { data: requestsData },
    { data: paymentsData },
    { data: usersData },
    { data: tripsData },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("trips").select("*", { count: "exact", head: true }),
    supabase.from("bookings").select("*", { count: "exact", head: true }),
    supabase.from("safety_flags").select("*").order("created_at", { ascending: false }).limit(10),
    supabase.from("bookings").select("*").order("created_at", { ascending: false }).limit(8),
    supabase.from("item_requests").select("*").eq("safety_status", "flagged").order("created_at", { ascending: false }).limit(8),
    supabase.from("payments").select("*").order("created_at", { ascending: false }).limit(8),
    supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(8),
    supabase.from("trips").select("*").order("created_at", { ascending: false }).limit(8),
  ]);

  const flags = (flagsData as SafetyFlag[]) ?? [];
  const bookings = (bookingsData as Booking[]) ?? [];
  const requests = (requestsData as ItemRequest[]) ?? [];
  const payments = (paymentsData as Payment[]) ?? [];
  const users = (usersData as Profile[]) ?? [];
  const trips = (tripsData as Trip[]) ?? [];

  const openFlags = flags.filter((f) => f.status === "open").length;
  const totalRevenue = payments.filter((p) => p.status === "succeeded" || p.status === "released")
    .reduce((s, p) => s + Number(p.platform_fee), 0);

  return (
    <div className="container-page py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Admin & safety</h1>
        <Badge variant="dark">Staff</Badge>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardMetricCard label="Users" value={userCount ?? 0} icon={Users} tone="brand" />
        <DashboardMetricCard label="Trips" value={tripCount ?? 0} icon={Plane} tone="default" />
        <DashboardMetricCard label="Bookings" value={bookingCount ?? 0} icon={Package} tone="default" />
        <DashboardMetricCard label="Open safety flags" value={openFlags} icon={AlertOctagon} tone={openFlags ? "warning" : "default"} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-amber-600" /><h2 className="text-base font-semibold">Safety flags</h2></div>
          {flags.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">Nothing flagged. Things are quiet.</p>
          ) : (
            <ul className="mt-3 divide-y divide-border">
              {flags.map((f) => (
                <li key={f.id} className="py-3 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{f.reason}</div>
                    <Badge variant={f.status === "open" ? "warning" : "muted"}>{f.status}</Badge>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">{relativeTime(f.created_at)} · severity {f.severity}</div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2"><Package className="h-4 w-4 text-brand-600" /><h2 className="text-base font-semibold">Flagged item requests</h2></div>
          {requests.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No flagged item requests.</p>
          ) : (
            <ul className="mt-3 divide-y divide-border">
              {requests.map((r) => (
                <li key={r.id} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <div className="font-medium">{r.item_name}</div>
                    <div className="text-xs text-muted-foreground">{r.origin_city} → {r.destination_city}</div>
                  </div>
                  <SafetyBadge status={r.safety_status} />
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2"><Package className="h-4 w-4 text-brand-600" /><h2 className="text-base font-semibold">Recent bookings</h2></div>
          <ul className="mt-3 divide-y divide-border">
            {bookings.map((b) => (
              <li key={b.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <div className="font-medium">#{b.id.slice(0, 8)}</div>
                  <div className="text-xs text-muted-foreground">{formatCurrency(Number(b.agreed_price))} · {relativeTime(b.created_at)}</div>
                </div>
                <BookingStatusBadge status={b.status} />
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2"><CreditCard className="h-4 w-4 text-brand-600" /><h2 className="text-base font-semibold">Recent payments</h2></div>
          <div className="mt-2 text-xs text-muted-foreground">Platform fees collected: <span className="font-semibold text-foreground">{formatCurrency(totalRevenue)}</span></div>
          <ul className="mt-3 divide-y divide-border">
            {payments.map((p) => (
              <li key={p.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <div className="font-medium">{formatCurrency(Number(p.amount))}</div>
                  <div className="text-xs text-muted-foreground">{relativeTime(p.created_at)}</div>
                </div>
                <Badge variant={p.status === "succeeded" || p.status === "released" ? "success" : p.status === "failed" ? "danger" : "muted"}>{p.status}</Badge>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-6">
          <h2 className="text-base font-semibold">Recent users</h2>
          <ul className="mt-3 divide-y divide-border">
            {users.map((u) => (
              <li key={u.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <div className="font-medium">{u.full_name ?? "—"}</div>
                  <div className="text-xs text-muted-foreground">{u.home_city ?? ""} · {u.role}</div>
                </div>
                <Badge variant={u.verification_status === "id_verified" ? "success" : "muted"}>{u.verification_status}</Badge>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-6">
          <h2 className="text-base font-semibold">Recent trips</h2>
          <ul className="mt-3 divide-y divide-border">
            {trips.map((t) => (
              <li key={t.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <div className="font-medium">{t.departure_city} → {t.destination_city}</div>
                  <div className="text-xs text-muted-foreground">{t.available_weight_kg} kg · {t.status}</div>
                </div>
                <div className="text-xs text-muted-foreground">{relativeTime(t.created_at)}</div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
