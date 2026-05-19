// Native-bridge helpers. Safe to call from the web app — they no-op when
// running outside the Capacitor shell (i.e. in a normal browser).

export const isNative = (): boolean => {
  if (typeof window === "undefined") return false;
  const w = window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } };
  return Boolean(w.Capacitor?.isNativePlatform?.());
};

export async function hideSplash() {
  if (!isNative()) return;
  try {
    const { SplashScreen } = await import("@capacitor/splash-screen");
    await SplashScreen.hide({ fadeOutDuration: 300 });
  } catch (e) {
    console.warn("[native] hideSplash", e);
  }
}

export async function setStatusBarStyle(style: "dark" | "light") {
  if (!isNative()) return;
  try {
    const { StatusBar, Style } = await import("@capacitor/status-bar");
    await StatusBar.setStyle({ style: style === "dark" ? Style.Dark : Style.Light });
  } catch (e) {
    console.warn("[native] setStatusBarStyle", e);
  }
}

export type HapticKind = "light" | "medium" | "heavy" | "success" | "warning" | "error";

export async function haptic(kind: HapticKind = "light") {
  if (!isNative()) return;
  try {
    const { Haptics, ImpactStyle, NotificationType } = await import("@capacitor/haptics");
    if (kind === "success" || kind === "warning" || kind === "error") {
      await Haptics.notification({
        type:
          kind === "success" ? NotificationType.Success :
          kind === "warning" ? NotificationType.Warning :
          NotificationType.Error,
      });
    } else {
      await Haptics.impact({
        style:
          kind === "heavy" ? ImpactStyle.Heavy :
          kind === "medium" ? ImpactStyle.Medium :
          ImpactStyle.Light,
      });
    }
  } catch (e) {
    console.warn("[native] haptic", e);
  }
}

export async function shareUrl(opts: { title?: string; text?: string; url: string }) {
  if (!isNative()) {
    // Fallback to Web Share API when available
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try { await navigator.share(opts); } catch {}
    }
    return;
  }
  try {
    const { Share } = await import("@capacitor/share");
    await Share.share(opts);
  } catch (e) {
    console.warn("[native] share", e);
  }
}

/** Fire-and-forget push token registration. Call once after sign-in. */
export async function registerPush(onToken: (token: string) => void | Promise<void>) {
  if (!isNative()) return;
  try {
    const { PushNotifications } = await import("@capacitor/push-notifications");
    const perm = await PushNotifications.requestPermissions();
    if (perm.receive !== "granted") return;
    await PushNotifications.register();
    PushNotifications.addListener("registration", (t) => onToken(t.value));
  } catch (e) {
    console.warn("[native] push", e);
  }
}
