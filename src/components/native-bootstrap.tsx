"use client";
import { useEffect } from "react";
import { hideSplash, setStatusBarStyle } from "@/lib/native";

/**
 * Mounted once in the root layout. Hides the native splash after first paint
 * and locks the status bar style. Safe no-op in normal browsers.
 */
export function NativeBootstrap() {
  useEffect(() => {
    // Give the page one frame to render before fading the splash
    requestAnimationFrame(() => {
      void hideSplash();
      void setStatusBarStyle("dark");
    });
  }, []);
  return null;
}
