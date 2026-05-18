import type { MetadataRoute } from "next";
import { env } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.appUrl;
  const now = new Date();

  const staticUrls: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/search`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: `${base}/safety`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/signup`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
  ];

  try {
    const supabase = await createSupabaseServerClient();
    const today = now.toISOString().slice(0, 10);
    const { data } = await supabase
      .from("trips")
      .select("id, updated_at")
      .eq("status", "active")
      .gte("departure_date", today)
      .order("departure_date", { ascending: true })
      .limit(500);

    const tripUrls: MetadataRoute.Sitemap = (data ?? []).map((t) => ({
      url: `${base}/trips/${t.id}`,
      lastModified: new Date(t.updated_at as string),
      changeFrequency: "daily",
      priority: 0.7,
    }));
    return [...staticUrls, ...tripUrls];
  } catch {
    return staticUrls;
  }
}
