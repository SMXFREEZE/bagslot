import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// OAuth callback for Supabase Auth (Google sign-in, magic links, etc.)
// Supabase redirects here with `?code=...` after the user authorizes.
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/onboarding";

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=missing_code", url.origin));
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message)}`, url.origin),
    );
  }

  // If the profile is already complete, send straight to /dashboard.
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, home_city")
      .eq("id", user.id)
      .maybeSingle();
    if (profile?.full_name && profile?.home_city) {
      return NextResponse.redirect(new URL("/dashboard", url.origin));
    }
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
