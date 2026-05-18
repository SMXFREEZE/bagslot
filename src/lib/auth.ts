// Auth helpers — wrap Supabase server client for common patterns.

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types/db";
import { redirect } from "next/navigation";

export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  return (data as Profile) ?? null;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireProfile(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (!profile.full_name || !profile.home_city) redirect("/onboarding");
  return profile;
}

export async function requireAdmin() {
  const profile = await getCurrentProfile();
  if (!profile?.is_admin) redirect("/");
  return profile;
}
