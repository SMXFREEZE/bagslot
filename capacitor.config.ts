import type { CapacitorConfig } from "@capacitor/cli";

/**
 * BagSlot iOS shell configuration.
 *
 * STRATEGY: server.url points to the live Vercel deployment. The native iOS
 * shell loads the production web app directly — meaning every Vercel deploy
 * INSTANTLY updates the iOS app without resubmitting to App Store review.
 *
 * The native shell still provides: real Xcode app, App Store listing, push
 * notifications, haptics, status-bar control, splash screen, share sheet.
 * Apple permits this pattern as long as native capabilities are used (we do).
 *
 * To test locally against your dev server, change `server.url` to
 * `http://YOUR-MAC-LAN-IP:3000` and `server.cleartext: true`.
 */
const config: CapacitorConfig = {
  appId: "com.bagslot.app",
  appName: "BagSlot",
  webDir: "out", // unused when server.url is set — leave as placeholder
  bundledWebRuntime: false,

  server: {
    // Production: live web app
    url: "https://bagslot.vercel.app",
    cleartext: false,
    // Allow nav within our own domains
    allowNavigation: [
      "bagslot.vercel.app",
      "*.vercel.app",
      "*.supabase.co",
      "checkout.stripe.com",
      "*.stripe.com",
      "accounts.google.com",
      "maps.googleapis.com",
    ],
  },

  ios: {
    contentInset: "always", // respect safe areas
    backgroundColor: "#FBFAF9",
    scheme: "BagSlot",
    // Use the native splash plugin instead of a static LaunchScreen storyboard image
    handleApplicationNotifications: false,
  },

  plugins: {
    SplashScreen: {
      launchAutoHide: false, // we'll hide it manually after the web app's first paint
      launchShowDuration: 1500,
      backgroundColor: "#FBFAF9",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: "DARK", // dark text on cream background
      backgroundColor: "#FBFAF9",
      overlaysWebView: true,
    },
    PushNotifications: {
      presentationOptions: ["alert", "badge", "sound"],
    },
  },
};

export default config;
