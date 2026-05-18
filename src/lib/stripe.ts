// Stripe adapter with a graceful mock fallback when keys are missing.
// In mock mode the checkout immediately "succeeds" so the UX flow stays testable.

import Stripe from "stripe";
import { env, hasStripe } from "@/lib/env";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe | null {
  if (!hasStripe) return null;
  if (!_stripe) _stripe = new Stripe(env.stripeSecret!, { apiVersion: "2025-09-30.acacia" as Stripe.LatestApiVersion });
  return _stripe;
}

export interface CheckoutInput {
  bookingId: string;
  amount: number; // dollars
  currency?: string;
  customerEmail?: string;
  productName: string;
  productDescription?: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutResult {
  url: string;
  sessionId: string;
  mode: "stripe" | "mock";
}

export async function createCheckout(input: CheckoutInput): Promise<CheckoutResult> {
  const stripe = getStripe();
  if (!stripe) {
    // Mock checkout: redirect to a local page that marks payment as succeeded.
    const sessionId = `mock_${input.bookingId}_${Date.now()}`;
    const url = `/mock-checkout?booking=${encodeURIComponent(input.bookingId)}&amount=${input.amount}&next=${encodeURIComponent(input.successUrl)}`;
    return { url, sessionId, mode: "mock" };
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: input.customerEmail,
    line_items: [
      {
        price_data: {
          currency: input.currency ?? "usd",
          product_data: {
            name: input.productName,
            description: input.productDescription,
          },
          unit_amount: Math.round(input.amount * 100),
        },
        quantity: 1,
      },
    ],
    metadata: { booking_id: input.bookingId },
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
  });

  return { url: session.url!, sessionId: session.id, mode: "stripe" };
}
