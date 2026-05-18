"use client";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plane, Package, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { completeOnboarding } from "@/app/(auth)/actions";

const ROLES = [
  { value: "traveler", label: "Traveler", icon: Plane, hint: "I have free baggage space on upcoming trips." },
  { value: "sender", label: "Sender", icon: Package, hint: "I want to send items with travelers." },
  { value: "both", label: "Both", icon: Users, hint: "I do both — send and carry." },
] as const;

export function OnboardingForm({ defaultName }: { defaultName: string }) {
  const [role, setRole] = useState<"traveler" | "sender" | "both">("sender");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={(fd) => {
        fd.set("role", role);
        setError(null);
        startTransition(async () => {
          const res = await completeOnboarding(fd);
          if (res && !res.ok && res.error) setError(res.error);
        });
      }}
      className="space-y-6"
    >
      <div>
        <Label>I am a…</Label>
        <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {ROLES.map((r) => {
            const active = r.value === role;
            return (
              <button
                type="button"
                key={r.value}
                onClick={() => setRole(r.value)}
                className={cn(
                  "rounded-2xl border p-4 text-left transition",
                  active
                    ? "border-brand-600 bg-brand-50 shadow-soft"
                    : "border-border bg-card hover:border-brand-200",
                )}
              >
                <r.icon className={cn("h-5 w-5", active ? "text-brand-700" : "text-muted-foreground")} />
                <div className="mt-2 font-medium">{r.label}</div>
                <p className="mt-1 text-xs text-muted-foreground">{r.hint}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="full_name">Full name *</Label>
          <Input id="full_name" name="full_name" defaultValue={defaultName} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="home_city">Home city *</Label>
          <Input id="home_city" name="home_city" placeholder="e.g. Montreal" required />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="phone_number">Phone number</Label>
        <Input id="phone_number" name="phone_number" type="tel" placeholder="Optional, used for handoff coordination" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="bio">Short bio</Label>
        <Textarea id="bio" name="bio" placeholder="A few words so people know who they're trusting." />
      </div>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={isPending}>
          {isPending ? "Saving…" : "Continue"}
        </Button>
      </div>
    </form>
  );
}
