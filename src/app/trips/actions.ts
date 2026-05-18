"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const tripSchema = z.object({
  departure_city: z.string().min(2),
  departure_country: z.string().min(2),
  destination_city: z.string().min(2),
  destination_country: z.string().min(2),
  departure_date: z.string().min(8),
  arrival_date: z.string().min(8),
  airline: z.string().optional().nullable(),
  flight_number: z.string().optional().nullable(),
  available_weight_kg: z.coerce.number().positive(),
  available_volume_description: z.string().optional().nullable(),
  price_per_kg: z.coerce.number().min(0),
  minimum_price: z.coerce.number().min(5),
  pickup_area: z.string().optional().nullable(),
  destination_handoff_area: z.string().optional().nullable(),
  allowed_item_notes: z.string().optional().nullable(),
});

export type CreateTripResult = { ok: boolean; error?: string; tripId?: string };

export async function createTrip(formData: FormData): Promise<CreateTripResult> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const raw = Object.fromEntries(formData.entries());
  const parsed = tripSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { data, error } = await supabase
    .from("trips")
    .insert({ ...parsed.data, traveler_id: user.id, status: "active" })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };

  // Bump role to traveler/both
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role === "sender") {
    await supabase.from("profiles").update({ role: "both" }).eq("id", user.id);
  }

  revalidatePath("/search");
  revalidatePath("/dashboard");
  redirect(`/trips/${data!.id}`);
}

export async function cancelTrip(tripId: string) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase
    .from("trips")
    .update({ status: "cancelled" })
    .eq("id", tripId)
    .eq("traveler_id", user.id);

  revalidatePath("/dashboard");
  revalidatePath(`/trips/${tripId}`);
}
