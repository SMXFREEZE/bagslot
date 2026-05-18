// Centralized env access. Missing optional keys (Stripe) trigger fallbacks.

const required = (key: string): string => {
  const v = process.env[key];
  if (!v) throw new Error(`Missing required env var: ${key}`);
  return v;
};

const optional = (key: string): string | undefined => process.env[key] || undefined;

export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  supabaseServiceKey: optional("SUPABASE_SERVICE_ROLE_KEY"),

  stripeSecret: optional("STRIPE_SECRET_KEY"),
  stripePublishable: optional("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"),
  stripeWebhookSecret: optional("STRIPE_WEBHOOK_SECRET"),

  resendApiKey: optional("RESEND_API_KEY"),
  resendFromEmail: process.env.RESEND_FROM_EMAIL ?? "BagSlot <notifications@bagslot.app>",

  googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",

  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  adminEmails: (process.env.ADMIN_EMAILS ?? "").split(",").map((s) => s.trim()).filter(Boolean),
};

export const hasSupabase = Boolean(env.supabaseUrl && env.supabaseAnonKey);
export const hasStripe = Boolean(env.stripeSecret && env.stripePublishable);
export const hasResend = Boolean(env.resendApiKey);
export const hasGoogleMaps = Boolean(env.googleMapsApiKey);

export function assertSupabase() {
  if (!hasSupabase) {
    throw new Error(
      "Supabase env vars missing — set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  }
}

export { required, optional };
