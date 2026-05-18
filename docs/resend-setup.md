# Resend setup for BagSlot

All transactional email code is wired up. The moment you paste an API key into
Vercel + Supabase, every booking event will fan out:

| Event | Email subject |
| --- | --- |
| `request_received` | New booking request for your {route} trip |
| `request_accepted` | Your request was accepted — complete payment |
| `request_rejected` | Your request for {route} was declined |
| `payment_received` | Payment received for your {route} trip |
| `pickup_confirmed` | Your item was picked up |
| `delivery_confirmed` | Delivery confirmed — booking complete |
| `review_received` | You got a new review on BagSlot |
| `dispute_opened` | A dispute was opened on your booking |

When `RESEND_API_KEY` is missing, the app logs `[email] (no-op, RESEND_API_KEY missing)`
and continues. In-app notifications still write to the DB, so the bell badge keeps working.

---

## Step 1 — Sign up at https://resend.com

Free tier covers 100 emails/day, 3,000/month — plenty for MVP.

---

## Step 2 — Verify a sending domain

Resend → Domains → Add Domain. You need DNS access on the domain you want to send from.

For BagSlot, the recommended setup is:
- Domain: `bagslot.app` (or whatever you own; you can also send from `bagslot.vercel.app` test mode)
- Resend will give you ~4 DNS records (SPF, DKIM, DMARC). Add them to your DNS provider.
- Click **Verify**. Takes 5-30 min for DNS to propagate.

Until your domain is verified, you can only send to your own logged-in email.

---

## Step 3 — Create an API key

Resend → API Keys → **Create**. Permissions: **Sending Access**. Name: `BagSlot Production`.
Copy the key (starts with `re_`).

---

## Step 4 — Paste into Vercel

```bash
echo "re_xxxxxxxxxxxx" | npx vercel env add RESEND_API_KEY production
echo "BagSlot <notifications@bagslot.app>" | npx vercel env add RESEND_FROM_EMAIL production
```

Or paste via the Vercel dashboard → Project → Settings → Environment Variables.

`RESEND_FROM_EMAIL` must use an address on your verified domain. Format:
`Display Name <email@yourdomain.com>`.

---

## Step 5 — Add `SUPABASE_SERVICE_ROLE_KEY` to Vercel (if not already)

Email lookup uses the service role to read `auth.users` (the regular client
can't). Get it from https://supabase.com/dashboard/project/boxjggmxpkavadulzura/settings/api-keys
→ `service_role` (secret).

```bash
echo "eyJ...your-service-role..." | npx vercel env add SUPABASE_SERVICE_ROLE_KEY production
```

Without this, the in-app notification still writes but the email lookup will skip.

---

## Step 6 — Redeploy

```bash
npx vercel --prod
```

Or just push to `main` — Vercel auto-deploys.

---

## Local testing

1. Add the same vars to `.env.local`
2. Trigger a notification — e.g. accept a booking as the traveler
3. Watch the dev console: you should see `[email]` log lines, and the recipient should receive the email

---

## Template customization

All templates live in `src/lib/email.ts`. They're plain HTML strings (no React Email
dep) so they ship without a build step. Brand-aligned to the monochrome palette
(`#0A0A0F` ink, `#FBFAF9` cream).

To add a new template:

1. Add it to the `templates` object in `src/lib/email.ts`
2. Add a `case` in `templateForType()` for the matching `NotificationType`
3. Pass `emailContext` from the relevant `createNotification()` callsite if the template needs dynamic data (route, item name, etc.)
