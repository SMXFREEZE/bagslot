"use client";
import { useState, useTransition, useRef } from "react";
import Image from "next/image";
import { Upload, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CityAutocomplete } from "@/components/city-autocomplete";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types/db";
import { cn, initials } from "@/lib/utils";
import { updateProfile } from "./actions";

export function AccountForm({ profile }: { profile: Profile }) {
  const [avatarUrl, setAvatarUrl] = useState<string>(profile.avatar_url ?? "");
  const [uploading, setUploading] = useState(false);
  const [role, setRole] = useState<"traveler" | "sender" | "both">(profile.role ?? "sender");
  const [homeCity, setHomeCity] = useState(profile.home_city ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);
  const supabase = createSupabaseBrowserClient();

  const onAvatar = async (file: File | null) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError("Avatar must be under 2 MB.");
      return;
    }
    setError(null);
    setUploading(true);
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const path = `${profile.id}/avatar-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    setUploading(false);
    if (upErr) {
      setError(upErr.message);
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
    setAvatarUrl(publicUrl);
  };

  return (
    <form
      action={(fd) => {
        fd.set("role", role);
        fd.set("avatar_url", avatarUrl);
        fd.set("home_city", homeCity);
        setError(null);
        setSaved(false);
        startTransition(async () => {
          const res = await updateProfile(fd);
          if (res.ok) setSaved(true);
          else setError(res.error ?? "Save failed.");
        });
      }}
      className="space-y-7"
    >
      {/* Avatar */}
      <div className="flex items-center gap-5">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-secondary">
          {avatarUrl ? (
            <Image src={avatarUrl} alt="Avatar" fill sizes="80px" className="object-cover" unoptimized />
          ) : (
            <span className="grid h-full w-full place-items-center text-xl font-semibold text-foreground">
              {initials(profile.full_name) || <User className="h-7 w-7" />}
            </span>
          )}
        </div>
        <div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="h-4 w-4" /> {uploading ? "Uploading…" : avatarUrl ? "Replace photo" : "Upload photo"}
          </Button>
          <p className="mt-1 text-xs text-muted-foreground">JPG or PNG. Max 2 MB.</p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onAvatar(e.target.files?.[0] ?? null)}
          />
        </div>
      </div>

      {/* Identity */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="full_name">Full name</Label>
          <Input id="full_name" name="full_name" defaultValue={profile.full_name ?? ""} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="home_city">Home city</Label>
          <CityAutocomplete
            id="home_city"
            name="home_city"
            value={homeCity}
            onChange={setHomeCity}
            placeholder="e.g. Montreal"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone_number">Phone number</Label>
          <Input id="phone_number" name="phone_number" type="tel" defaultValue={profile.phone_number ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="languages">Languages</Label>
          <Input id="languages" name="languages" placeholder="English, French, Arabic" defaultValue={(profile.languages ?? []).join(", ")} />
          <p className="text-xs text-muted-foreground">Comma-separated.</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" name="bio" rows={3} defaultValue={profile.bio ?? ""} placeholder="A few words so people know who they're trusting." />
      </div>

      {/* Role */}
      <div>
        <Label>I am a…</Label>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {(["traveler", "sender", "both"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={cn(
                "rounded-xl border px-3 py-2 text-sm font-medium capitalize transition",
                r === role
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-card hover:border-foreground",
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {saved && <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">Saved.</p>}

      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={pending || uploading}>
          {pending ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
