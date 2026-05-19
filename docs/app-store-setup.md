# Ship BagSlot to the App Store

You're going from a Vercel web app to a real iPhone app on the App Store using
**Capacitor**. The web app stays the source of truth — the iOS shell loads
`https://bagslot.vercel.app` directly, so every Vercel push instantly updates
the iOS app **without** resubmitting to App Store review.

All scaffolding is already in this repo. The Mac-only steps are at the bottom.

---

## What's already done (on Windows or any machine)

- `@capacitor/core`, `@capacitor/ios`, plus native plugins for App, Haptics,
  StatusBar, SplashScreen, PushNotifications, Share — installed in `package.json`
- `capacitor.config.ts` — bundle ID `com.bagslot.app`, app name `BagSlot`,
  `server.url = https://bagslot.vercel.app`, navigation allow-list (Supabase,
  Stripe, Google), splash + status bar config
- `src/lib/native.ts` — typed helpers (`haptic()`, `hideSplash()`, `setStatusBarStyle()`,
  `shareUrl()`, `registerPush()`) that no-op gracefully in normal browsers
- `src/components/native-bootstrap.tsx` — hides the splash + locks the status
  bar after first paint (mounted in root layout)
- Haptic feedback wired into booking actions (accept / reject / pay / confirm pickup / confirm delivery)
- PWA manifest, viewport `viewportFit: cover`, safe-area insets — already set for iOS

---

## Step 1 — Apple Developer account ($99/yr)

If you don't have one: https://developer.apple.com/programs/

You'll get:
- A **Team ID** (10-char string)
- The ability to register the bundle ID `com.bagslot.app`
- Access to **App Store Connect** to create the listing

---

## Step 2 — Register the bundle ID

1. https://developer.apple.com/account/resources/identifiers/list
2. Click **+** → App IDs → App
3. Description: **BagSlot**, Bundle ID: **`com.bagslot.app`** (Explicit)
4. Capabilities to enable now: **Push Notifications**, **Associated Domains**
5. Save

---

## Step 3 — Create the App Store Connect listing

1. https://appstoreconnect.apple.com/apps
2. **+** → New App
3. Platform: **iOS**, Name: **BagSlot**, Bundle ID: pick `com.bagslot.app`,
   SKU: **bagslot-ios**, Primary Language: English
4. Don't fill out screenshots or description yet — you can do that after the first build is uploaded

---

## Step 4 — On your Mac, clone the repo

```bash
git clone https://github.com/SMXFREEZE/bagslot.git
cd bagslot
npm install
```

---

## Step 5 — Add the iOS platform (Mac only)

```bash
npm run ios:add
# equivalent to: npx cap add ios
```

This creates an `ios/` folder with a real Xcode project (`ios/App/App.xcworkspace`).
Capacitor reads `capacitor.config.ts` so the bundle ID, splash, and server URL
are all set automatically.

---

## Step 6 — Generate app icons + splash from source assets

The source assets live in `resources/`. You need to create:

- `resources/icon.png` — 1024×1024 PNG (the master App Store icon)
- `resources/splash.png` — 2732×2732 PNG (cream background, ink B mark centered)
- `resources/splash-dark.png` — 2732×2732 PNG (ink background, cream B)

Quick way to get a starting icon (uses the live Edge route):

```bash
# Bump src/app/icon.tsx size to 1024, redeploy, then:
curl -L "https://bagslot.vercel.app/icon" -o resources/icon.png
```

Then run:

```bash
npm run ios:assets
# = npx capacitor-assets generate --ios --iconBackgroundColor '#0A0A0F' --splashBackgroundColor '#FBFAF9'
```

This fans out every required icon size (Spotlight, Settings, App Store, etc.)
and splash size (every iPhone + iPad form factor).

---

## Step 7 — Sync the web changes into the iOS project

Run this any time you change anything in `capacitor.config.ts` or want to pull
the latest assets in:

```bash
npm run ios:sync
# = npx cap sync ios
```

(Note: because `server.url` is set, you do NOT need to `npm run build` and copy
the web bundle into the iOS app — the iOS app loads the live URL.)

---

## Step 8 — Open in Xcode

```bash
npm run ios:open
# = npx cap open ios (opens ios/App/App.xcworkspace)
```

In Xcode:

1. Select the **App** target in the project navigator
2. **Signing & Capabilities** tab:
   - Team: pick your Apple Developer team
   - Bundle Identifier: confirm `com.bagslot.app`
   - Click **+ Capability** → add **Push Notifications**, **Associated Domains**
3. **General** tab:
   - Display Name: **BagSlot**
   - Version: **1.0.0**, Build: **1**

---

## Step 9 — Test on your device

1. Connect your iPhone via USB (or set up Wi-Fi debugging)
2. Pick your device from the Xcode device dropdown (top bar)
3. Press **▶ Run** (Cmd+R)
4. The first install will fail with a signing error — go to iPhone Settings →
   General → VPN & Device Management → trust your developer certificate
5. Re-run

You should see:
- BagSlot splash (cream background, ink B)
- App launches into the live web app, but in fullscreen with native status bar
- Tapping accept on a booking gives a haptic tap (this is the real proof the native bridge works)

---

## Step 10 — Archive + upload to App Store Connect

In Xcode:

1. Top device dropdown → **Any iOS Device (arm64)**
2. **Product → Archive** (takes 2-5 min)
3. When the Organizer opens: **Distribute App** → **App Store Connect** → **Upload**
4. Wait for processing (~10 min) — you'll get a "Build available" email

---

## Step 11 — TestFlight (recommended before public release)

1. https://appstoreconnect.apple.com → BagSlot → **TestFlight**
2. The build appears with a "Missing Compliance" warning. Click it →
   answer **No** (BagSlot doesn't use proprietary crypto — only HTTPS, which is exempt)
3. Add **Internal Testers** (yourself + anyone else with an Apple ID on your team)
4. Install **TestFlight** on your iPhone, accept the invite, install the build
5. Test for a few days. Every Vercel push to `bagslot.vercel.app` will instantly
   reflect in the TestFlight build — no resubmission needed

---

## Step 12 — Submit to App Store

1. App Store Connect → BagSlot → **App Store** tab → **+ Version**
2. Fill in:
   - **App Information**: category Travel, content rights, age rating
   - **Pricing**: free
   - **Screenshots**: 6.5" iPhone (1284×2778) + 5.5" iPhone (1242×2208) — 3-5 each
   - **Description**: the marketplace pitch, "Find someone already flying there"
   - **Keywords**: peer to peer luggage, travel, baggage, suitcase, send package
   - **Support URL**: https://bagslot.vercel.app/safety
   - **Privacy Policy URL**: you'll need to host one — Vercel has free privacy
     policy generators, or just deploy a /privacy page
3. Pick the TestFlight build to ship
4. **Submit for Review**

Apple review typically takes 24-48 hours. **Be ready to defend against
Guideline 4.2 (minimum functionality / spam)**: emphasize that BagSlot is a
real two-sided marketplace with payments, accounts, and unique trust/safety
flows — not just a webview wrapper. Our haptic feedback, push notifications,
share sheet, and status bar control all count as native functionality.

---

## Cheat sheet — every command in one block

```bash
# First time only (Mac):
git clone https://github.com/SMXFREEZE/bagslot.git
cd bagslot && npm install
npm run ios:add                 # cap add ios
# put resources/icon.png + resources/splash.png in place
npm run ios:assets              # generate icon + splash variants
npm run ios:open                # opens Xcode

# Every subsequent build:
npm run ios:sync                # cap sync ios (after capacitor.config or plugin changes)
npm run ios:open                # Xcode → Archive → Upload
```

That's it. The web app keeps updating instantly; the iOS shell only needs
re-uploads when you change native config (icons, splash, plugins, bundle version).
