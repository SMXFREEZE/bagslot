"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const schema = z.object({
  from_city: z.string().optional().nullable(),
  to_city: z.string().optional().nullable(),
  earliest_date: z.string().optional().nullable(),
  min_weight_kg: z.coerce.number().optional().nullable(),
  max_price: z.coerce.number().optional().nullable(),
});

export async function createRouteAlert(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const raw = Object.fromEntries(formData.entries());
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const data = parsed.data;
  // Require at least one filter to avoid spam
  if (!data.from_city && !data.to_city && !data.earliest_date) {
    return { ok: false, error: "Add at least one filter (from, to, or date)." };
  }

  const { error } = await supabase.from("route_alerts").insert({
    user_id: user.id,
    from_city: data.from_city || null,
    to_city: data.to_city || null,
    earliest_date: data.earliest_date || null,
    min_weight_kg: data.min_weight_kg ?? null,
    max_price: data.max_price ?? null,
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/search");
  return { ok: true };
}

export async function deleteRouteAlert(id: string) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase.from("route_alerts").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/search");
  return { ok: true };
}
