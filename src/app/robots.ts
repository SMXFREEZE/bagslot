import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/search", "/safety", "/trips/", "/login", "/signup"],
        disallow: [
          "/api/",
          "/dashboard/",
          "/admin",
          "/bookings/",
          "/messages/",
          "/notifications",
          "/account",
          "/onboarding",
          "/mock-checkout",
          "/auth/",
          "/requests/",
        ],
      },
    ],
    sitemap: `${env.appUrl}/sitemap.xml`,
  };
}
