"use client";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { signInWithGoogle } from "@/app/(auth)/actions";

export function GoogleSignInButton({ label = "Continue with Google" }: { label?: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      disabled={pending}
      onClick={() => startTransition(async () => { await signInWithGoogle(); })}
    >
      <GoogleIcon /> {pending ? "Redirecting…" : label}
    </Button>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8a12 12 0 1 1 0-24 12 12 0 0 1 8.5 3.3l5.7-5.7A20 20 0 1 0 24 44a20 20 0 0 0 19.6-23.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8A12 12 0 0 1 24 12c3 0 5.8 1.2 8.5 3.3l5.7-5.7A20 20 0 0 0 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44a20 20 0 0 0 13.4-5.2l-6.2-5.2A12 12 0 0 1 12.7 28L6.1 33A20 20 0 0 0 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-4.1 5.6l6.2 5.2C40.6 36.2 44 30.7 44 24c0-1.2-.1-2.4-.4-3.5z" />
    </svg>
  );
}
