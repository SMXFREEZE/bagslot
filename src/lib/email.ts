// Resend email adapter. No-ops gracefully when RESEND_API_KEY is missing —
// the app still works, emails just don't send.

import { Resend } from "resend";
import { env, hasResend } from "@/lib/env";
import type { NotificationType } from "@/lib/types/db";

let _resend: Resend | null = null;
function getResend(): Resend | null {
  if (!hasResend) return null;
  if (!_resend) _resend = new Resend(env.resendApiKey!);
  return _resend;
}

interface SendInput {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendInput) {
  const resend = getResend();
  if (!resend) {
    if (process.env.NODE_ENV !== "production") {
      console.log("[email] (no-op, RESEND_API_KEY missing) →", to, subject);
    }
    return { ok: true, skipped: true };
  }
  try {
    const { error } = await resend.emails.send({
      from: env.resendFromEmail,
      to,
      subject,
      html,
    });
    if (error) {
      console.error("[email] send failed", error);
      return { ok: false, error };
    }
    return { ok: true };
  } catch (e) {
    console.error("[email] threw", e);
    return { ok: false, error: e };
  }
}

// ============================================================================
// Templates — minimal HTML, no React Email dep. Brand-aligned, accessible.
// ============================================================================

interface BaseProps {
  recipientName?: string | null;
  ctaLabel?: string;
  ctaUrl?: string;
}

function shell(body: string, opts: BaseProps = {}) {
  const cta = opts.ctaLabel && opts.ctaUrl
    ? `<p style="margin:24px 0;"><a href="${opts.ctaUrl}" style="display:inline-block;background:#0A0A0F;color:#FBFAF9;padding:12px 22px;border-radius:12px;text-decoration:none;font-weight:600;font-size:14px;">${opts.ctaLabel}</a></p>`
    : "";
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#FBFAF9;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Inter,sans-serif;color:#0A0A0F;">
  <div style="max-width:520px;margin:0 auto;padding:32px 20px;">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:24px;">
      <div style="width:28px;height:28px;border-radius:8px;background:#0A0A0F;color:#FBFAF9;text-align:center;line-height:28px;font-weight:700;font-size:14px;">B</div>
      <strong style="font-size:14px;letter-spacing:-0.01em;">BagSlot</strong>
    </div>
    <div style="background:#fff;border:1px solid #E8E5DD;border-radius:16px;padding:28px;">
      ${opts.recipientName ? `<p style="margin:0 0 16px;color:#5B5A55;font-size:14px;">Hi ${opts.recipientName.split(" ")[0]},</p>` : ""}
      ${body}
      ${cta}
    </div>
    <p style="margin:20px 0 0;text-align:center;font-size:11px;color:#9F9C92;">
      You're getting this because you have an active BagSlot booking.<br>
      <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://bagslot.vercel.app"}/notifications" style="color:#5B5A55;">Manage notifications</a>
    </p>
  </div>
</body></html>`;
}

export const templates = {
  requestReceived: (p: BaseProps & { itemName: string; route: string }) => ({
    subject: `New booking request for your ${p.route} trip`,
    html: shell(
      `<h1 style="margin:0 0 12px;font-size:20px;letter-spacing:-0.02em;">New request: ${p.itemName}</h1>
       <p style="margin:0;color:#5B5A55;font-size:15px;line-height:1.5;">A sender wants to ship <strong>${p.itemName}</strong> on your <strong>${p.route}</strong> trip. Review the item, then accept or decline.</p>`,
      { ...p, ctaLabel: "Review the request" },
    ),
  }),
  requestAccepted: (p: BaseProps & { route: string }) => ({
    subject: `Your request was accepted — complete payment`,
    html: shell(
      `<h1 style="margin:0 0 12px;font-size:20px;letter-spacing:-0.02em;">You got the slot.</h1>
       <p style="margin:0;color:#5B5A55;font-size:15px;line-height:1.5;">Your request for the <strong>${p.route}</strong> trip was accepted. Complete payment to confirm the booking. Funds stay in escrow until delivery.</p>`,
      { ...p, ctaLabel: "Complete payment" },
    ),
  }),
  requestRejected: (p: BaseProps & { route: string }) => ({
    subject: `Your request for ${p.route} was declined`,
    html: shell(
      `<h1 style="margin:0 0 12px;font-size:20px;letter-spacing:-0.02em;">Request declined</h1>
       <p style="margin:0;color:#5B5A55;font-size:15px;line-height:1.5;">The traveler couldn't fit your item on the <strong>${p.route}</strong> trip. Plenty of other travelers — try searching again.</p>`,
      { ...p, ctaLabel: "Find another trip" },
    ),
  }),
  paymentReceived: (p: BaseProps & { route: string }) => ({
    subject: `Payment received for your ${p.route} trip`,
    html: shell(
      `<h1 style="margin:0 0 12px;font-size:20px;letter-spacing:-0.02em;">Payment received.</h1>
       <p style="margin:0;color:#5B5A55;font-size:15px;line-height:1.5;">The sender paid for your <strong>${p.route}</strong> trip. Funds are held in escrow and released when delivery is confirmed.</p>`,
      { ...p, ctaLabel: "Open booking" },
    ),
  }),
  pickupConfirmed: (p: BaseProps & { route: string }) => ({
    subject: `Your item was picked up`,
    html: shell(
      `<h1 style="margin:0 0 12px;font-size:20px;letter-spacing:-0.02em;">Item picked up.</h1>
       <p style="margin:0;color:#5B5A55;font-size:15px;line-height:1.5;">Your traveler has the item and is on the way for the <strong>${p.route}</strong> trip.</p>`,
      { ...p, ctaLabel: "Track booking" },
    ),
  }),
  deliveryConfirmed: (p: BaseProps & { route: string }) => ({
    subject: `Delivery confirmed — booking complete`,
    html: shell(
      `<h1 style="margin:0 0 12px;font-size:20px;letter-spacing:-0.02em;">Delivered.</h1>
       <p style="margin:0;color:#5B5A55;font-size:15px;line-height:1.5;">Your <strong>${p.route}</strong> booking is complete. You can now leave a review.</p>`,
      { ...p, ctaLabel: "Leave a review" },
    ),
  }),
  reviewReceived: (p: BaseProps) => ({
    subject: `You got a new review on BagSlot`,
    html: shell(
      `<h1 style="margin:0 0 12px;font-size:20px;letter-spacing:-0.02em;">New review.</h1>
       <p style="margin:0;color:#5B5A55;font-size:15px;line-height:1.5;">Someone just reviewed you. Open BagSlot to read it.</p>`,
      { ...p, ctaLabel: "See your profile" },
    ),
  }),
  disputeOpened: (p: BaseProps & { reason: string }) => ({
    subject: `A dispute was opened on your booking`,
    html: shell(
      `<h1 style="margin:0 0 12px;font-size:20px;letter-spacing:-0.02em;">Dispute opened.</h1>
       <p style="margin:0 0 8px;color:#5B5A55;font-size:15px;line-height:1.5;">A dispute was opened on a booking you're part of:</p>
       <blockquote style="margin:0;padding:12px 14px;background:#FBFAF9;border-left:3px solid #0A0A0F;border-radius:8px;color:#0A0A0F;font-size:14px;">${p.reason}</blockquote>
       <p style="margin:12px 0 0;color:#5B5A55;font-size:14px;">An admin will review and contact both parties.</p>`,
      { ...p, ctaLabel: "Open booking" },
    ),
  }),
} as const;

export function templateForType(type: NotificationType, ctx: Record<string, string>) {
  switch (type) {
    case "request_received": return templates.requestReceived({ itemName: ctx.itemName ?? "an item", route: ctx.route ?? "your", recipientName: ctx.recipientName, ctaUrl: ctx.ctaUrl });
    case "request_accepted": return templates.requestAccepted({ route: ctx.route ?? "the", recipientName: ctx.recipientName, ctaUrl: ctx.ctaUrl });
    case "request_rejected": return templates.requestRejected({ route: ctx.route ?? "the", recipientName: ctx.recipientName, ctaUrl: ctx.ctaUrl });
    case "payment_received": return templates.paymentReceived({ route: ctx.route ?? "your", recipientName: ctx.recipientName, ctaUrl: ctx.ctaUrl });
    case "pickup_confirmed": return templates.pickupConfirmed({ route: ctx.route ?? "your", recipientName: ctx.recipientName, ctaUrl: ctx.ctaUrl });
    case "delivery_confirmed": return templates.deliveryConfirmed({ route: ctx.route ?? "your", recipientName: ctx.recipientName, ctaUrl: ctx.ctaUrl });
    case "review_received": return templates.reviewReceived({ recipientName: ctx.recipientName, ctaUrl: ctx.ctaUrl });
    case "dispute_opened": return templates.disputeOpened({ reason: ctx.reason ?? "Something went wrong.", recipientName: ctx.recipientName, ctaUrl: ctx.ctaUrl });
    default: return null;
  }
}
