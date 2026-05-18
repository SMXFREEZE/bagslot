"use client";
import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, ImagePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface Props {
  userId: string;
  name?: string;
  value?: string[];
  onChange?: (urls: string[]) => void;
  maxFiles?: number;
  className?: string;
}

/**
 * Multi-image uploader. Uploads to Supabase Storage bucket `item-photos`
 * under `{userId}/{timestamp}-{filename}`. Returns public URLs.
 *
 * Renders a hidden input[name] with JSON-encoded URLs so it can be submitted
 * as part of a server-action form.
 */
export function ItemPhotoUploader({
  userId,
  name = "item_photos",
  value = [],
  onChange,
  maxFiles = 4,
  className,
}: Props) {
  const [urls, setUrls] = useState<string[]>(value);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createSupabaseBrowserClient();

  const remaining = maxFiles - urls.length;
  const canAdd = remaining > 0;

  const handleFiles = async (files: FileList | null) => {
    if (!files || !files.length) return;
    setError(null);
    setUploading(true);
    const toUpload = Array.from(files).slice(0, remaining);
    const next: string[] = [...urls];
    for (const file of toUpload) {
      if (file.size > 5 * 1024 * 1024) {
        setError(`${file.name} is over 5 MB. Smaller please.`);
        continue;
      }
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: upErr } = await supabase.storage.from("item-photos").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (upErr) {
        setError(upErr.message);
        continue;
      }
      const { data: { publicUrl } } = supabase.storage.from("item-photos").getPublicUrl(path);
      next.push(publicUrl);
    }
    setUrls(next);
    onChange?.(next);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const remove = (url: string) => {
    const next = urls.filter((u) => u !== url);
    setUrls(next);
    onChange?.(next);
  };

  return (
    <div className={className}>
      <input type="hidden" name={name} value={JSON.stringify(urls)} />
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {urls.map((url) => (
          <div key={url} className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-secondary">
            <Image src={url} alt="" fill sizes="200px" className="object-cover" unoptimized />
            <button
              type="button"
              onClick={() => remove(url)}
              className="absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-full bg-foreground text-background opacity-0 transition group-hover:opacity-100"
              aria-label="Remove photo"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        {canAdd && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className={cn(
              "flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-border bg-card text-muted-foreground transition hover:border-foreground hover:text-foreground",
              uploading && "pointer-events-none opacity-60",
            )}
          >
            {uploading ? (
              <Upload className="h-5 w-5 animate-pulse" />
            ) : (
              <>
                <ImagePlus className="h-5 w-5" />
                <span className="text-[10px] font-medium uppercase tracking-wider">Add photo</span>
              </>
            )}
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <p className="mt-2 text-xs text-muted-foreground">
        Up to {maxFiles} photos · 5 MB each · JPG/PNG/HEIC
      </p>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
