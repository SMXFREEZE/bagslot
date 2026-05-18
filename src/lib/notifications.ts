// In-app notifications + Resend email fan-out.
// Notifications are always written to the DB; emails fire when RESEND_API_KEY is set.

import type { NotificationType } from "@/lib/types/db";
import type { SupabaseClient } from "@supabase/supabase-js";
import { sendEmail, templateForType } from "@/lib/email";
import { env } from "@/lib/env";

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  linkUrl?: string;
  /** Optional structured context for email template (route, itemName, reason). */
  emailContext?: Record<string, string>;
}

/**
 * Insert a notification row AND, if Resend is configured, send the matching
 * transactional email. The email lookup uses the service-role client to read
 * auth.users (the regular client doesn't have access).
 */
export async function createNotification(
  supabase: SupabaseClient,
  input: CreateNotificationInput,
) {
  const { error } = await supabase.from("notifications").insert({
    user_id: input.userId,
    type: input.type,
    title: input.title,
    body: input.body ?? null,
    link_url: input.linkUrl ?? null,
  });
  if (error) {
    console.error("[notifications] insert failed", error);
    return { ok: false, error };
  }

  // Fire-and-forget email — don't block the request if it fails.
  void sendNotificationEmail(supabase, input).catch((e) => {
    console.error("[notifications] email error", e);
  });

  return { ok: true };
}

async function sendNotificationEmail(supabase: SupabaseClient, input: CreateNotificationInput) {
  if (!process.env.RESEND_API_KEY) return; // skip lookup if no Resend

  // Fetch recipient email + profile name. Using auth.admin requires service role,
  // so we degrade gracefully if the calling client doesn't have it.
  let email: string | null = null;
  let fullName: string | null = null;
  try {
    // Try via auth.admin (service-role client only)
    const adminResp = await (supabase.auth as unknown as {
      admin?: { getUserById: (id: string) => Promise<{ data: { user: { email: string | null } | null } }> };
    }).admin?.getUserById(input.userId);
    email = adminResp?.data.user?.email ?? null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", input.userId)
      .maybeSingle();
    fullName = (profile as { full_name: string | null } | null)?.full_name ?? null;
  } catch (e) {
    console.warn("[notifications] could not resolve recipient email", e);
    return;
  }

  if (!email) return;

  const ctx = {
    recipientName: fullName ?? "",
    ctaUrl: `${env.appUrl}${input.linkUrl ?? "/dashboard"}`,
    ...(input.emailContext ?? {}),
  };

  const tpl = templateForType(input.type, ctx);
  if (!tpl) return;

  await sendEmail({ to: email, subject: tpl.subject, html: tpl.html });
}

export async function notifyMany(
  supabase: SupabaseClient,
  inputs: CreateNotificationInput[],
) {
  if (!inputs.length) return { ok: true };
  for (const i of inputs) {
    await createNotification(supabase, i);
  }
  return { ok: true };
}
