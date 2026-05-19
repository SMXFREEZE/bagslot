"use client";
import { useEffect } from "react";
import confetti from "canvas-confetti";
import { toast } from "@/components/toast";
import { haptic } from "@/lib/native";
import type { BookingStatus } from "@/lib/types/db";

/**
 * Mount inside a booking page. When status changes to `completed` for the
 * first time (or page loads in `completed` state via ?paid=1-like flag),
 * fire confetti + a haptic and a success toast.
 *
 * Cheap and tasteful: 2 bursts, 90 particles, 1.2s total.
 */
export function CelebrateOnComplete({
  status,
  variant = "completed",
}: {
  status: BookingStatus;
  variant?: "completed" | "paid";
}) {
  useEffect(() => {
    const trigger = variant === "completed" ? status === "completed" : status === "paid";
    if (!trigger) return;

    const key = `bagslot:celebrate:${variant}:${status}`;
    if (typeof window !== "undefined") {
      const last = sessionStorage.getItem(key);
      if (last) return; // only fire once per session per booking page load
      sessionStorage.setItem(key, "1");
    }

    void haptic("success");
    if (variant === "completed") {
      toast.success("Delivered. Funds released.", {
        description: "Both parties can now leave a review.",
        duration: 5000,
      });
    } else {
      toast.success("Payment received.", {
        description: "Held in escrow until delivery is confirmed.",
        duration: 4500,
      });
    }

    const end = Date.now() + 800;
    const colors = ["#0A0A0F", "#D5CFBF", "#FBFAF9"];
    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 70,
        startVelocity: 50,
        origin: { x: 0, y: 0.85 },
        colors,
        scalar: 0.9,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 70,
        startVelocity: 50,
        origin: { x: 1, y: 0.85 },
        colors,
        scalar: 0.9,
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }, [status, variant]);

  return null;
}
