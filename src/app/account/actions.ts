"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const schema = z.object({
  full_name: z.string().min(2).max(80),
  home_city: z.string().min(2).max(80),
  phone_number: z.string().optional().nullable(),
  bio: z.string().max(400).optional().nullable(),
  role: z.enum(["traveler", "sender", "both"]),
  avatar_url: z.string().url().optional().nullable(),
  languages: z.string().optional().nullable(), // comma-separated
});

export async function updateProfile(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  const raw = Object.fromEntries(formData.entries());
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const langs = (parsed.data.languages ?? "")
    .split(",").map((s) => s.trim()).filter(Boolean);

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.full_name,
      home_city: parsed.data.home_city,
      phone_number: parsed.data.phone_number || null,
      bio: parsed.data.bio || null,
      role: parsed.data.role,
      avatar_url: parsed.data.avatar_url || null,
      languages: langs,
    })
    .eq("id", user.id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/account");
  revalidatePath("/", "layout");
  return { ok: true };
}
