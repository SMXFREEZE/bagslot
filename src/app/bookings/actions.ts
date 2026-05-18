"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createCheckout } from "@/lib/stripe";
import { env } from "@/lib/env";
import { createNotification } from "@/lib/notifications";
import type { Booking, BookingStatus } from "@/lib/types/db";

async function loadBookingForUser(bookingId: string) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, booking: null, supabase };
  const { data } = await supabase.from("bookings").select("*").eq("id", bookingId).maybeSingle();
  const booking = data as Booking | null;
  if (!booking) return { user, booking: null, supabase };
  if (booking.traveler_id !== user.id && booking.sender_id !== user.id) {
    return { user, booking: null, supabase };
  }
  return { user, booking, supabase };
}

export async function acceptBooking(bookingId: string) {
  const { user, booking, supabase } = await loadBookingForUser(bookingId);
  if (!user || !booking) redirect("/login");
  if (booking.traveler_id !== user.id) return { ok: false, error: "Only the traveler can accept." };

  await supabase.from("bookings").update({ status: "payment_pending" as BookingStatus }).eq("id", bookingId);
  await supabase.from("item_requests").update({ status: "matched" }).eq("id", booking.item_request_id);
  await createNotification(supabase, {
    userId: booking.sender_id,
    type: "request_accepted",
    title: "Your request was accepted",
    body: "Complete payment to confirm the booking.",
    linkUrl: `/bookings/${bookingId}`,
  });

  revalidatePath(`/bookings/${bookingId}`);
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function rejectBooking(bookingId: string) {
  const { user, booking, supabase } = await loadBookingForUser(bookingId);
  if (!user || !booking) redirect("/login");
  if (booking.traveler_id !== user.id) return { ok: false, error: "Only the traveler can reject." };

  await supabase.from("bookings").update({ status: "rejected" as BookingStatus }).eq("id", bookingId);
  await supabase.from("item_requests").update({ status: "rejected" }).eq("id", booking.item_request_id);
  await createNotification(supabase, {
    userId: booking.sender_id,
    type: "request_rejected",
    title: "Request declined",
    body: "Your booking request was declined. You can request a different trip.",
    linkUrl: `/search`,
  });
  revalidatePath(`/bookings/${bookingId}`);
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function startCheckout(bookingId: string) {
  const { user, booking, supabase } = await loadBookingForUser(bookingId);
  if (!user || !booking) redirect("/login");
  if (booking.sender_id !== user.id) return { ok: false, error: "Only the sender can pay." };

  // Create payment row in pending state
  const { data: payment } = await supabase
    .from("payments")
    .insert({
      booking_id: booking.id,
      payer_id: booking.sender_id,
      traveler_id: booking.traveler_id,
      amount: booking.agreed_price,
      platform_fee: booking.platform_fee,
      traveler_payout: booking.traveler_payout,
      status: "pending",
    })
    .select("id")
    .single();

  const result = await createCheckout({
    bookingId: booking.id,
    amount: Number(booking.agreed_price),
    productName: `BagSlot booking #${booking.id.slice(0, 8)}`,
    productDescription: "Peer-to-peer baggage space booking",
    customerEmail: user.email ?? undefined,
    successUrl: `${env.appUrl}/bookings/${booking.id}?paid=1`,
    cancelUrl: `${env.appUrl}/bookings/${booking.id}`,
  });

  if (payment && result.mode === "stripe") {
    await supabase
      .from("payments")
      .update({ stripe_checkout_session_id: result.sessionId, status: "processing" })
      .eq("id", payment.id);
  }

  return { ok: true, url: result.url, mode: result.mode };
}

export async function confirmMockPayment(bookingId: string) {
  // Used only by the local /mock-checkout page when Stripe is not configured.
  const { user, booking, supabase } = await loadBookingForUser(bookingId);
  if (!user || !booking) redirect("/login");
  if (booking.sender_id !== user.id) return { ok: false, error: "Only the sender can pay." };

  await supabase
    .from("payments")
    .update({ status: "succeeded" })
    .eq("booking_id", booking.id)
    .eq("payer_id", user.id);
  await supabase.from("bookings").update({ status: "paid" as BookingStatus }).eq("id", booking.id);

  await createNotification(supabase, {
    userId: booking.traveler_id,
    type: "payment_received",
    title: "Payment received",
    body: "Funds are held in escrow until delivery is confirmed.",
    linkUrl: `/bookings/${booking.id}`,
  });

  revalidatePath(`/bookings/${booking.id}`);
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function confirmPickup(bookingId: string, code: string) {
  const { user, booking, supabase } = await loadBookingForUser(bookingId);
  if (!user || !booking) redirect("/login");
  if (booking.traveler_id !== user.id) return { ok: false, error: "Only the traveler can confirm pickup." };
  if (code.trim().toUpperCase() !== booking.pickup_code) return { ok: false, error: "Code didn't match." };

  await supabase.from("handoff_confirmations").insert({
    booking_id: booking.id,
    type: "pickup",
    confirmed_by: user.id,
    confirmation_code: code.trim().toUpperCase(),
  });
  await supabase.from("bookings").update({ status: "picked_up" as BookingStatus }).eq("id", booking.id);

  await createNotification(supabase, {
    userId: booking.sender_id,
    type: "pickup_confirmed",
    title: "Item picked up",
    body: "Your traveler has the item and is on the way.",
    linkUrl: `/bookings/${booking.id}`,
  });

  revalidatePath(`/bookings/${booking.id}`);
  return { ok: true };
}

export async function confirmDelivery(bookingId: string, code: string) {
  const { user, booking, supabase } = await loadBookingForUser(bookingId);
  if (!user || !booking) redirect("/login");
  if (booking.traveler_id !== user.id) return { ok: false, error: "Only the traveler can confirm delivery." };
  if (code.trim().toUpperCase() !== booking.delivery_code) return { ok: false, error: "Code didn't match." };

  await supabase.from("handoff_confirmations").insert({
    booking_id: booking.id,
    type: "delivery",
    confirmed_by: user.id,
    confirmation_code: code.trim().toUpperCase(),
  });
  await supabase.from("bookings").update({ status: "completed" as BookingStatus }).eq("id", booking.id);
  await supabase
    .from("payments")
    .update({ status: "released" })
    .eq("booking_id", booking.id);

  // Notify both parties
  await createNotification(supabase, {
    userId: booking.sender_id,
    type: "delivery_confirmed",
    title: "Delivery confirmed",
    body: "Both parties can now leave a review.",
    linkUrl: `/bookings/${booking.id}`,
  });
  await createNotification(supabase, {
    userId: booking.traveler_id,
    type: "delivery_confirmed",
    title: "Booking complete — payout released",
    body: "Thanks for carrying! You can review the sender now.",
    linkUrl: `/bookings/${booking.id}`,
  });

  revalidatePath(`/bookings/${booking.id}`);
  return { ok: true };
}

export async function leaveReview(bookingId: string, rating: number, comment: string) {
  const { user, booking, supabase } = await loadBookingForUser(bookingId);
  if (!user || !booking) redirect("/login");
  if (booking.status !== "completed") return { ok: false, error: "Booking is not complete." };

  const reviewType = user.id === booking.sender_id ? "sender_to_traveler" : "traveler_to_sender";
  const reviewee = user.id === booking.sender_id ? booking.traveler_id : booking.sender_id;

  const { error } = await supabase.from("reviews").insert({
    booking_id: booking.id,
    reviewer_id: user.id,
    reviewee_id: reviewee,
    rating,
    comment,
    review_type: reviewType,
  });
  if (error) return { ok: false, error: error.message };

  await createNotification(supabase, {
    userId: reviewee,
    type: "review_received",
    title: "You got a new review",
    linkUrl: `/bookings/${booking.id}`,
  });

  revalidatePath(`/bookings/${booking.id}`);
  return { ok: true };
}

export async function openDispute(bookingId: string, reason: string) {
  const { user, booking, supabase } = await loadBookingForUser(bookingId);
  if (!user || !booking) redirect("/login");

  await supabase.from("bookings").update({ status: "disputed" as BookingStatus }).eq("id", booking.id);
  await supabase.from("safety_flags").insert({
    booking_id: booking.id,
    flagged_by: user.id,
    reason: `Dispute: ${reason}`,
    severity: "high",
    status: "open",
  });
  await createNotification(supabase, {
    userId: user.id === booking.sender_id ? booking.traveler_id : booking.sender_id,
    type: "dispute_opened",
    title: "Dispute opened",
    body: reason,
    linkUrl: `/bookings/${booking.id}`,
  });

  revalidatePath(`/bookings/${booking.id}`);
  return { ok: true };
}
