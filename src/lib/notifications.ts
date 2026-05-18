// In-app notifications helper. Today these are DB rows in `notifications`
// and the dashboard polls/subscribes for them. When Resend is connected,
// wire the TODO blocks to send transactional emails alongside.

import type { NotificationType } from "@/lib/types/db";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  body?: string;
  linkUrl?: string;
}

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

  // TODO(resend): When Resend is connected, fan this out to a transactional
  // email keyed off `input.type`. For now in-app only.
  // await resend.emails.send({ to, subject: input.title, react: NotificationEmail({ ... }) });

  return { ok: true };
}

export async function notifyMany(
  supabase: SupabaseClient,
  inputs: CreateNotificationInput[],
) {
  if (!inputs.length) return { ok: true };
  const { error } = await supabase.from("notifications").insert(
    inputs.map((i) => ({
      user_id: i.userId,
      type: i.type,
      title: i.title,
      body: i.body ?? null,
      link_url: i.linkUrl ?? null,
    })),
  );
  if (error) {
    console.error("[notifications] batch insert failed", error);
    return { ok: false, error };
  }
  return { ok: true };
}
