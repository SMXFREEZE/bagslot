"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { checkSafety } from "@/lib/safety";
import { quote } from "@/lib/pricing";
import { createNotification } from "@/lib/notifications";
import type { Trip } from "@/lib/types/db";

const requestSchema = z.object({
  trip_id: z.string().uuid(),
  item_name: z.string().min(2),
  item_description: z.string().optional().nullable(),
  item_category: z.string().optional().nullable(),
  item_weight_kg: z.coerce.number().positive(),
  item_size_description: z.string().optional().nullable(),
  item_value: z.coerce.number().min(0).default(0),
  pickup_deadline: z.string().optional().nullable(),
  delivery_notes: z.string().optional().nullable(),
  item_photos: z.string().optional().nullable(),
});

function parsePhotos(raw: unknown): string[] {
  if (typeof raw !== "string" || !raw) return [];
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export interface CreateRequestResult {
  ok: boolean;
  error?: string;
  blocked?: boolean;
  bookingId?: string;
  safety?: { status: string; reasons: string[] };
}

export async function createItemRequest(formData: FormData): Promise<CreateRequestResult> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in first." };

  const raw = Object.fromEntries(formData.entries());
  const parsed = requestSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const data = parsed.data;

  const { data: tripData } = await supabase.from("trips").select("*").eq("id", data.trip_id).maybeSingle();
  const trip = tripData as Trip | null;
  if (!trip) return { ok: false, error: "Trip not found." };
  if (trip.status !== "active") return { ok: false, error: "Trip is no longer accepting requests." };
  if (data.item_weight_kg > Number(trip.available_weight_kg)) {
    return { ok: false, error: `That trip only has ${trip.available_weight_kg} kg of free space.` };
  }
  if (trip.traveler_id === user.id) return { ok: false, error: "You can't send to your own trip." };

  const safety = checkSafety({
    name: data.item_name,
    description: data.item_description ?? "",
    value: data.item_value,
  });

  if (safety.status === "blocked") {
    return { ok: false, blocked: true, error: "This item isn't allowed.", safety };
  }

  // Insert item request
  const { data: reqInsert, error: reqErr } = await supabase
    .from("item_requests")
    .insert({
      sender_id: user.id,
      trip_id: data.trip_id,
      origin_city: trip.departure_city,
      origin_country: trip.departure_country,
      destination_city: trip.destination_city,
      destination_country: trip.destination_country,
      item_name: data.item_name,
      item_description: data.item_description,
      item_category: data.item_category,
      item_weight_kg: data.item_weight_kg,
      item_size_description: data.item_size_description,
      item_value: data.item_value,
      pickup_deadline: data.pickup_deadline || null,
      delivery_notes: data.delivery_notes,
      item_photos: parsePhotos(data.item_photos),
      safety_status: safety.status,
      status: "submitted",
    })
    .select("id")
    .single();

  if (reqErr) return { ok: false, error: reqErr.message };

  // If flagged, also log a safety_flag row (admins can triage)
  if (safety.status === "flagged") {
    await supabase.from("safety_flags").insert({
      item_request_id: reqInsert!.id,
      flagged_by: user.id,
      reason: safety.reasons.join(" • "),
      severity: safety.severity,
      status: "open",
    });
  }

  // Compute price and create the booking
  const q = quote(data.item_weight_kg, Number(trip.price_per_kg), Number(trip.minimum_price));
  const { data: bookingInsert, error: bookingErr } = await supabase
    .from("bookings")
    .insert({
      trip_id: trip.id,
      item_request_id: reqInsert!.id,
      traveler_id: trip.traveler_id,
      sender_id: user.id,
      status: "requested",
      agreed_price: q.total,
      platform_fee: q.fee,
      traveler_payout: q.payout,
    })
    .select("id")
    .single();

  if (bookingErr) return { ok: false, error: bookingErr.message };

  // Conversation
  await supabase.from("conversations").insert({
    booking_id: bookingInsert!.id,
    traveler_id: trip.traveler_id,
    sender_id: user.id,
  });

  // Notify the traveler
  await createNotification(supabase, {
    userId: trip.traveler_id,
    type: "request_received",
    title: "New booking request",
    body: `${data.item_name} for your ${trip.departure_city} → ${trip.destination_city} trip.`,
    linkUrl: `/bookings/${bookingInsert!.id}`,
  });

  revalidatePath("/dashboard");
  redirect(`/bookings/${bookingInsert!.id}`);
}
