# BagSlot

> **Find someone already flying there.**

BagSlot is a peer-to-peer travel marketplace. Travelers monetize unused baggage space on
trips they're already taking. Senders find verified travelers going their way and pay
$5–$25 to send small, approved items.

- **Not a courier company.** Travelers inspect every item — no sealed packages.
- **Not a generic shipping app.** Trust + tight handoff workflow.
- **Lightweight marketplace** for empty suitcase space between verified people already travelling.

---

## Stack

- **Framework**: Next.js 15 App Router, React 18, TypeScript
- **UI**: Tailwind CSS, shadcn-style primitives (Radix), Framer Motion, Lucide icons
- **Auth + DB**: Supabase Postgres + Supabase Auth + Supabase Storage + Supabase Realtime
- **Payments**: Stripe Checkout (with a mock-checkout fallback when keys aren't set)
- **Validation**: Zod + React Hook Form patterns
- **Deployment**: Vercel

---

## Local setup

```bash
git clone <repo-url> bagslot
cd bagslot
npm install
cp .env.example .env.local   # fill in Supabase + Stripe keys
npm run dev                  # http://localhost:3000
```

### Environment variables

| Var | Required | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase publishable/anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | ⚠️ | Needed for the admin dashboard and Stripe webhook |
| `STRIPE_SECRET_KEY` | optional | Without it, checkout falls back to mock mode |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | optional | Pair with secret to enable real Stripe |
| `STRIPE_WEBHOOK_SECRET` | optional | For Stripe webhook verification |
| `NEXT_PUBLIC_APP_URL` | ✅ | Used for redirect URLs (set to your deployed URL in prod) |
| `ADMIN_EMAILS` | optional | Comma-separated emails — flips `is_admin=true` on first signup |

---

## Supabase setup

Run the SQL files in order against your Supabase project (SQL editor or `supabase db push`):

1. `supabase/migrations/0001_init.sql` — schema, enums, triggers
2. `supabase/migrations/0002_rls.sql` — Row Level Security policies
3. `supabase/migrations/0003_storage.sql` — Storage buckets + bucket policies
4. `supabase/seed.sql` — optional demo trip data (replace the `seed_uid` with a real profile id first)

The migrations create the following tables:

- `profiles`, `trips`, `item_requests`, `bookings`, `payments`
- `conversations`, `messages` (Realtime-enabled by default in Supabase)
- `reviews`, `safety_flags`, `handoff_confirmations`, `notifications`

RLS is enabled on every table. Highlights:

- Anyone can read active trips and reviews.
- Profiles are publicly readable but only editable by their owner.
- Bookings + payments + messages are scoped to the two participants.
- Admins (`profiles.is_admin = true`) have full read across everything for the admin dashboard.

### Storage buckets

Created automatically by the storage migration:

- `avatars` (public read, owner-only write)
- `item-photos` (public read, owner-only write)
- `handoff-photos` (public read, owner-only write)
- `verification-docs` (private, owner-only)

---

## Stripe setup

For MVP you can ship without Stripe keys — checkout will fall back to a built-in
`/mock-checkout` page that immediately marks the payment as succeeded.

For real Stripe:

1. Create a Stripe account
2. Copy the secret + publishable keys into your env
3. Set up a webhook endpoint pointing at `/api/stripe/webhook` listening for `checkout.session.completed`
4. Set `STRIPE_WEBHOOK_SECRET` to the webhook signing secret

The fee model is:
- Suggested price = `max(minimum_price, weight_kg * price_per_kg)`
- Platform fee = 12%
- Traveler payout = total − fee

---

## App routes

| Route | What it does |
| --- | --- |
| `/` | Landing page — hero, how-it-works, live trips, trust |
| `/login`, `/signup` | Email + password auth |
| `/onboarding` | Role selection + profile completion |
| `/search` | Search trips with filters (from, to, date, weight) |
| `/trips/new` | Post a trip (traveler) |
| `/trips/[id]` | Trip detail page |
| `/requests/new?trip=<id>` | Submit an item request — runs safety checker live |
| `/bookings/[id]` | Booking detail with status timeline, handoff codes, actions |
| `/messages/[bookingId]` | Realtime chat per booking |
| `/dashboard` | Overview for the logged-in user |
| `/dashboard/traveler` | All trips + incoming bookings |
| `/dashboard/sender` | All sent requests + bookings |
| `/notifications` | In-app notifications |
| `/safety` | Public safety rules + prohibited/restricted lists |
| `/admin` | Admin & safety dashboard (requires `is_admin = true`) |
| `/mock-checkout` | Fallback checkout when Stripe isn't configured |
| `POST /api/stripe/webhook` | Stripe webhook receiver |

---

## Booking lifecycle

```
requested → accepted → payment_pending → paid → picked_up → delivered → completed
                ↓ (any time)
                rejected | cancelled | disputed
```

- The **traveler** accepts/rejects requests, confirms pickup (with pickup code), confirms delivery (with delivery code).
- The **sender** pays after acceptance and shares the codes during handoff.
- Funds are released to the traveler when the delivery code is confirmed.

---

## Safety

Every item request runs through `src/lib/safety.ts`:

- **Blocked categories**: drugs, weapons, explosives, cash, ID documents, sealed packages
- **Flagged categories**: medicine, batteries, liquids, food, animals, tobacco, high-value goods
- Flagged items get logged to `safety_flags` for admin review
- Blocked items can't be submitted

The traveler MUST inspect every item — there's no sealed-package option in the UI.

---

## Notifications

Resend isn't connected yet, so notifications are in-app only — stored in the
`notifications` table and shown on `/notifications` + as a badge in the header.

When Resend is wired in, look for `TODO(resend)` in `src/lib/notifications.ts` to add
transactional emails alongside the DB inserts.

---

## Maps

Departure city / destination city / pickup area / handoff area are free-text fields
right now. The data model is map-provider-agnostic — Mapbox or Google Maps can be
swapped in by replacing the inputs in `src/app/trips/new/form.tsx` and `src/app/search/filters.tsx`
without changing the schema.

---

## Deployment (Vercel)

1. Push to GitHub
2. Import the repo on Vercel
3. Set the env vars from `.env.local`
4. Deploy

After deploy, point `NEXT_PUBLIC_APP_URL` to your Vercel URL, then redeploy so server
actions and Stripe redirects use the real URL.

---

## Testing checklist

The e2e flow that's been smoke-tested in browser:

- [x] Sign up new user
- [x] Confirm email (manual via SQL during local dev — production uses Supabase Auth)
- [x] Sign in
- [x] Complete onboarding (role + profile)
- [x] Post a trip
- [x] Search for trips
- [x] Open trip detail
- [x] Submit an item request (with live safety check)
- [x] Booking row created with pricing
- [x] Booking detail page renders timeline + handoff codes
- [x] Chat page renders
- [x] Mock checkout flow available
- [x] Admin dashboard gated by `is_admin`
- [x] `npm run build` passes
