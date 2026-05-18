import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { Calendar, Plane, Package, MessageSquare, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookingStatusBadge } from "@/components/booking-status-badge";
import { BookingTimeline } from "@/components/booking-timeline";
import { HandoffCode } from "@/components/handoff-code";
import { UserAvatar } from "@/components/user-avatar";
import { SafetyBadge } from "@/components/safety-badge";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { formatDate, formatCurrency } from "@/lib/utils";
import type { Booking, Trip, ItemRequest, Profile } from "@/lib/types/db";
import { BookingActions } from "./actions-ui";
import { ReviewForm } from "./review-form";

export default async function BookingDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ paid?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/bookings/${id}`);

  const supabase = await createSupabaseServerClient();
  const { data: bookingData } = await supabase.from("bookings").select("*").eq("id", id).maybeSingle();
  const booking = bookingData as Booking | null;
  if (!booking) notFound();
  if (booking.traveler_id !== user.id && booking.sender_id !== user.id) redirect("/dashboard");

  const [{ data: trip }, { data: itemRequest }, { data: traveler }, { data: sender }, { data: existingReview }] =
    await Promise.all([
      supabase.from("trips").select("*").eq("id", booking.trip_id).single(),
      supabase.from("item_requests").select("*").eq("id", booking.item_request_id).single(),
      supabase.from("profiles").select("*").eq("id", booking.traveler_id).single(),
      supabase.from("profiles").select("*").eq("id", booking.sender_id).single(),
      supabase.from("reviews").select("*").eq("booking_id", booking.id).eq("reviewer_id", user.id).maybeSingle(),
    ]);

  const me = user.id === booking.traveler_id ? "traveler" : "sender";
  const counterparty = me === "traveler" ? (sender as Profile) : (traveler as Profile);

  return (
    <div className="container-page max-w-5xl py-8">
      {sp.paid === "1" && (
        <div className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          Payment received — funds held in escrow until delivery is confirmed.
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Booking #{booking.id.slice(0, 8)}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            You're the <span className="font-medium text-foreground">{me}</span> in this booking.
          </p>
        </div>
        <BookingStatusBadge status={booking.status} />
      </div>

      <Card className="mt-6 p-6">
        <BookingTimeline status={booking.status} />
      </Card>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="text-base font-semibold">Trip</h2>
            <div className="mt-3 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Plane className="h-4 w-4 text-brand-600" />
                  {(trip as Trip).airline ?? "Flight"} {(trip as Trip).flight_number ? `· ${(trip as Trip).flight_number}` : ""}
                </div>
                <div className="mt-1 text-lg font-semibold">
                  {(trip as Trip).departure_city} → {(trip as Trip).destination_city}
                </div>
                <div className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate((trip as Trip).departure_date)}
                </div>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href={`/trips/${(trip as Trip).id}`}>View trip</Link>
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold">Item</h2>
                <div className="mt-2 text-lg font-medium">{(itemRequest as ItemRequest).item_name}</div>
                {(itemRequest as ItemRequest).item_description && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {(itemRequest as ItemRequest).item_description}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                  <Badge variant="muted">
                    <Package className="h-3 w-3" /> {(itemRequest as ItemRequest).item_weight_kg} kg
                  </Badge>
                  {(itemRequest as ItemRequest).item_value > 0 && (
                    <Badge variant="muted">Value {formatCurrency((itemRequest as ItemRequest).item_value)}</Badge>
                  )}
                  <SafetyBadge status={(itemRequest as ItemRequest).safety_status} />
                </div>
              </div>
            </div>
          </Card>

          <BookingActions booking={booking} me={me} />

          {booking.status === "completed" && !existingReview && (
            <Card className="p-6">
              <h2 className="text-base font-semibold">Leave a review</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Reviews help everyone trust each other. Honest is better than nice.
              </p>
              <div className="mt-4">
                <ReviewForm bookingId={booking.id} revieweeName={counterparty?.full_name ?? "the other party"} />
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card className="p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {me === "traveler" ? "Sender" : "Traveler"}
            </h2>
            <div className="mt-3 flex items-center gap-3">
              <UserAvatar name={counterparty?.full_name} url={counterparty?.avatar_url} className="h-12 w-12" />
              <div>
                <div className="font-medium">{counterparty?.full_name ?? "User"}</div>
                <div className="text-xs text-muted-foreground">
                  {counterparty?.home_city ? `From ${counterparty.home_city}` : ""}
                </div>
              </div>
            </div>
            <Button asChild variant="outline" className="mt-4 w-full">
              <Link href={`/messages/${booking.id}`}>
                <MessageSquare className="h-4 w-4" /> Open chat
              </Link>
            </Button>
          </Card>

          <Card className="p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Payment</h2>
            <div className="mt-3 space-y-2 text-sm">
              <Row label="Item price" value={formatCurrency(Number(booking.agreed_price))} />
              <Row label="Platform fee" value={formatCurrency(Number(booking.platform_fee))} />
              <Row label="Traveler payout" value={formatCurrency(Number(booking.traveler_payout))} bold />
            </div>
          </Card>

          {(booking.status === "paid" || booking.status === "picked_up") && (
            <HandoffCode
              label={booking.status === "paid" ? "Pickup code" : "Delivery code"}
              code={booking.status === "paid" ? booking.pickup_code : booking.delivery_code}
            />
          )}

          <Card className="bg-sand-50 p-6">
            <div className="flex items-center gap-2 text-foreground">
              <ShieldCheck className="h-4 w-4 text-brand-600" />
              <span className="text-sm font-semibold">No sealed packages</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              The traveler must inspect the item before pickup. Funds are held in escrow until delivery is confirmed.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={bold ? "font-semibold" : ""}>{value}</span>
    </div>
  );
}
