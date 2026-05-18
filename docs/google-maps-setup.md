# Google Maps setup for BagSlot

The `<CityAutocomplete />` component is already in:
- `src/components/hero-search.tsx` (hero search bar)
- `src/app/search/filters.tsx` (search filter sidebar)
- `src/app/trips/new/form.tsx` (Post-a-trip Route section)

When `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is set, the inputs become Google Places
autocomplete (city-only results). When not set, they fall back to plain text
inputs — no broken UI.

Bonus: when the user picks a city, the country field auto-fills.

---

## Step 1 — Create / select a Google Cloud project

https://console.cloud.google.com → top bar → project dropdown → New Project.
Name it **BagSlot** (you can share this with the Google OAuth project if you
already made one for `sami.elfigha@gmail.com`).

---

## Step 2 — Enable the APIs you need

In the same project, go to **APIs & Services → Library** and enable:
1. **Maps JavaScript API**
2. **Places API** (the new one — "Places API (New)" works too)

---

## Step 3 — Set up billing

Maps requires a billing account. You get **$200/month free credit**, which
covers ~28,000 Places autocomplete sessions/month — way more than MVP needs.

**Billing → Link a billing account**.

---

## Step 4 — Create an API key

**APIs & Services → Credentials → Create credentials → API key**. Copy it.

**Restrict the key** (important — public keys are scraped):
- **Application restrictions** → HTTP referrers (web sites)
  - Add: `https://bagslot.vercel.app/*`
  - Add: `https://*.vercel.app/*` (for preview deployments)
  - Add: `http://localhost:3000/*` (local dev)
- **API restrictions** → Restrict key → check **Maps JavaScript API** + **Places API**

Save.

---

## Step 5 — Paste into Vercel

```bash
echo "AIza..." | npx vercel env add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY production
```

Or paste via the Vercel dashboard.

The `NEXT_PUBLIC_` prefix is intentional — Google Maps JS runs in the browser
and the key is restricted by HTTP referrer, so it's safe to expose.

---

## Step 6 — Redeploy

Push to `main` or `npx vercel --prod`.

---

## Local testing

1. Add `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...` to `.env.local`
2. Restart the dev server (env vars are baked at build)
3. Type "Mont" in the hero search From field — you should see Google's suggestion list
4. Pick "Montreal" — the country field on Post-a-trip auto-fills "Canada"

---

## Cost ballpark

| Action | Cost (after free tier) |
| --- | --- |
| Autocomplete session (1 search) | $0.017 |
| Place Details (we don't call this) | $0.017 |

At 1,000 active users doing 5 searches/day, you'd use ~150k sessions/month →
$2,550 raw, **minus** the $200 monthly Maps credit → ~$2,350. Realistic MVP-stage
traffic costs cents.

---

## Optional: route preview map on trip detail

Not yet wired in. To add a map showing origin → destination on the trip detail
page:

```tsx
// src/components/route-preview-map.tsx
"use client";
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";

export function RoutePreviewMap({ origin, destination }: { origin: string; destination: string }) {
  // Geocode origin/destination → lat/lng (use Places Details or your own geocoder)
  // Then render <Map> with two <Marker> and a <Polyline> connecting them.
}
```

I left this out of the MVP because it's a second API call per trip detail view
and would shoot the bill up. Add it when you have product-market fit.
