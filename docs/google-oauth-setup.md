# Google OAuth setup for BagSlot

The "Continue with Google" button on /login and /signup is fully wired up in the code.
Once the credentials are dropped into Supabase, it works — no other changes needed.

You'll need:
- A Google account (e.g. **sami.elfigha@gmail.com**) for Google Cloud Console
- Access to the BagSlot Supabase project (`boxjggmxpkavadulzura`)

---

## Step 1 — Create an OAuth client in Google Cloud Console

Sign in to https://console.cloud.google.com as **sami.elfigha@gmail.com**.

1. **Create or select a project** named "BagSlot" (top bar → project dropdown → New Project).
2. Go to **APIs & Services → OAuth consent screen**
   - User type: **External**
   - App name: **BagSlot**
   - User support email: sami.elfigha@gmail.com
   - Developer contact: sami.elfigha@gmail.com
   - Scopes: leave default (email, profile, openid)
   - Test users: add sami.elfigha@gmail.com (and any others you want to test with)
   - Save and continue. Leave the app in "Testing" mode until you're ready to publish.
3. Go to **APIs & Services → Credentials**
   - **Create credentials → OAuth client ID**
   - Application type: **Web application**
   - Name: **BagSlot Web**
   - **Authorized JavaScript origins**:
     - `http://localhost:3000`
     - `https://bagslot.vercel.app` (and any custom domain you add later)
   - **Authorized redirect URIs** — this is the Supabase callback, NOT yours:
     - `https://boxjggmxpkavadulzura.supabase.co/auth/v1/callback`
   - Create → copy the **Client ID** and **Client secret**

---

## Step 2 — Paste credentials into Supabase

1. Open the Supabase dashboard for project `boxjggmxpkavadulzura`:
   https://supabase.com/dashboard/project/boxjggmxpkavadulzura/auth/providers
2. Find **Google**, toggle it on.
3. Paste the **Client ID** and **Client secret** from step 1.
4. Make sure the **callback URL** shown matches what you added in Google
   (`https://boxjggmxpkavadulzura.supabase.co/auth/v1/callback`).
5. Save.

---

## Step 3 — Add your Vercel URL to Supabase redirect allowlist

Same Supabase project → **Authentication → URL Configuration**:

- **Site URL**: `https://bagslot.vercel.app`
- **Redirect URLs** (add each on its own line):
  - `http://localhost:3000/auth/callback`
  - `https://bagslot.vercel.app/auth/callback`
  - `https://*.vercel.app/auth/callback` (for preview deployments)

---

## Step 4 — Test

1. Go to https://bagslot.vercel.app/login (or http://localhost:3000/login locally)
2. Click **Continue with Google**
3. Sign in with **sami.elfigha@gmail.com** (or another test user you added)
4. You should be redirected back to `/onboarding` to complete your profile, then `/dashboard`

---

## What the code does behind the scenes

- `src/components/google-signin-button.tsx` — the button itself
- `src/app/(auth)/actions.ts` → `signInWithGoogle()` — server action that calls
  `supabase.auth.signInWithOAuth({ provider: "google", redirectTo: ".../auth/callback" })`
  and redirects the user to Google's consent page
- `src/app/auth/callback/route.ts` — exchanges the returned `code` for a Supabase session,
  then sends the user to `/onboarding` (or `/dashboard` if their profile is already complete)
- The `handle_new_user` trigger in Supabase auto-creates a `profiles` row for new Google users
  using their full name from Google as the default

---

## Making yourself admin

Once you've signed in once via Google, run this in Supabase SQL editor:

```sql
update public.profiles
set is_admin = true
where id = (select id from auth.users where email = 'sami.elfigha@gmail.com');
```

You'll then see the **Admin** link in the user menu and can access `/admin`.

Alternatively, set the env var `ADMIN_EMAILS=sami.elfigha@gmail.com` before sign-up —
new users in that list become admins automatically on first sign-up (email/password path only;
for Google sign-in, run the SQL above the first time).
