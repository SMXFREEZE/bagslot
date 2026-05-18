"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { env } from "@/lib/env";

export interface AuthResult {
  ok: boolean;
  error?: string;
}

export async function signUpWithPassword(formData: FormData): Promise<AuthResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("full_name") ?? "").trim();

  if (!email || !password) return { ok: false, error: "Email and password are required." };
  if (password.length < 6) return { ok: false, error: "Password must be at least 6 characters." };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${env.appUrl}/onboarding`,
    },
  });
  if (error) return { ok: false, error: error.message };

  // If admin email list contains this email, flip is_admin (best-effort).
  if (env.adminEmails.includes(email) && data.user) {
    await supabase.from("profiles").update({ is_admin: true }).eq("id", data.user.id);
  }

  revalidatePath("/", "layout");
  redirect("/onboarding");
}

export async function signInWithPassword(formData: FormData): Promise<AuthResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { ok: false, error: "Email and password are required." };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signInWithGoogle(): Promise<AuthResult & { url?: string }> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${env.appUrl}/auth/callback?next=/onboarding`,
      queryParams: { access_type: "offline", prompt: "consent" },
    },
  });
  if (error) return { ok: false, error: error.message };
  if (!data.url) return { ok: false, error: "Google sign-in unavailable." };
  redirect(data.url);
}

export async function signOut(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function completeOnboarding(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const role = String(formData.get("role") ?? "sender") as "traveler" | "sender" | "both";
  const fullName = String(formData.get("full_name") ?? "").trim();
  const homeCity = String(formData.get("home_city") ?? "").trim();
  const phone = String(formData.get("phone_number") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();

  if (!fullName || !homeCity) {
    return { ok: false, error: "Name and home city are required." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      home_city: homeCity,
      phone_number: phone || null,
      bio: bio || null,
      role,
      verification_status: "email_verified",
    })
    .eq("id", user.id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
