import { NextResponse, type NextRequest } from "next/server";
import { getStripe } from "@/lib/stripe";
import { env } from "@/lib/env";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { createNotification } from "@/lib/notifications";
import type Stripe from "stripe";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const stripe = getStripe();
  if (!stripe || !env.stripeWebhookSecret) {
    return NextResponse.json({ skipped: true, reason: "Stripe not configured" }, { status: 200 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, env.stripeWebhookSecret);
  } catch (e) {
    return NextResponse.json({ error: `Webhook signature failed: ${(e as Error).message}` }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.booking_id;
    if (bookingId) {
      await supabase
        .from("payments")
        .update({
          status: "succeeded",
          stripe_payment_intent_id: typeof session.payment_intent === "string" ? session.payment_intent : null,
        })
        .eq("stripe_checkout_session_id", session.id);
      await supabase.from("bookings").update({ status: "paid" }).eq("id", bookingId);

      const { data: booking } = await supabase.from("bookings").select("traveler_id").eq("id", bookingId).single();
      if (booking) {
        await createNotification(supabase, {
          userId: booking.traveler_id,
          type: "payment_received",
          title: "Payment received",
          body: "Funds are held in escrow until delivery is confirmed.",
          linkUrl: `/bookings/${bookingId}`,
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}
