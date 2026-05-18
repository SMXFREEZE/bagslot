"use client";
import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * City autocomplete using Google Places. Drop-in replacement for <Input>.
 * Falls back to a plain text input if NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not set
 * — so the form still works out of the box.
 *
 * Returns the city name as the value. If `onCountryChange` is provided, it
 * fires with the resolved country whenever a place is selected.
 */
export interface CityAutocompleteProps {
  id?: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  onChange?: (value: string) => void;
  onCountryChange?: (country: string) => void;
  icon?: boolean;
}

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

export function CityAutocomplete({
  id,
  name,
  value,
  defaultValue,
  placeholder = "Any city",
  required,
  className,
  onChange,
  onCountryChange,
  icon = false,
}: CityAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [internal, setInternal] = useState(value ?? defaultValue ?? "");
  const isControlled = value !== undefined;

  useEffect(() => {
    if (!API_KEY || !inputRef.current) return;
    let cleanup: (() => void) | undefined;

    (async () => {
      try {
        // Lazy-load the Google Maps script (singleton)
        await loadMapsScript(API_KEY);

        type AutocompleteService = unknown;
        type GoogleMaps = {
          places: {
            Autocomplete: new (input: HTMLInputElement, opts: Record<string, unknown>) => {
              addListener: (event: string, cb: () => void) => { remove: () => void };
              getPlace: () => {
                name?: string;
                formatted_address?: string;
                address_components?: Array<{ long_name: string; short_name: string; types: string[] }>;
              };
            };
          };
        };
        const google = (window as unknown as { google?: { maps: GoogleMaps } }).google;
        if (!google?.maps?.places) return;

        const ac = new google.maps.places.Autocomplete(inputRef.current!, {
          types: ["(cities)"],
          fields: ["name", "formatted_address", "address_components"],
        });

        const listener = ac.addListener("place_changed", () => {
          const place = ac.getPlace();
          const city = place.name ?? place.formatted_address?.split(",")[0]?.trim() ?? "";
          const country = place.address_components?.find((c) =>
            c.types.includes("country"),
          )?.long_name ?? "";
          if (city) {
            if (!isControlled) setInternal(city);
            onChange?.(city);
            if (country) onCountryChange?.(country);
          }
        });

        cleanup = () => listener.remove();
        void (null as unknown as AutocompleteService); // silence unused
      } catch (e) {
        console.warn("[city-autocomplete] failed to init Google Places", e);
      }
    })();

    return () => cleanup?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={cn("relative", icon && "")}>
      {icon && (
        <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      )}
      <Input
        ref={inputRef}
        id={id}
        name={name}
        type="text"
        placeholder={placeholder}
        required={required}
        autoComplete="off"
        value={isControlled ? value : internal}
        onChange={(e) => {
          const v = e.target.value;
          if (!isControlled) setInternal(v);
          onChange?.(v);
        }}
        className={cn(icon && "pl-10", className)}
      />
    </div>
  );
}

// ============================================================================
// Singleton script loader. Multiple Autocomplete instances share one script tag.
// ============================================================================
let scriptPromise: Promise<void> | null = null;

function loadMapsScript(key: string): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("server"));
  const g = window as unknown as { google?: { maps?: { places?: unknown } } };
  if (g.google?.maps?.places) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>("script[data-gmaps]");
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("gmaps load failed")));
      return;
    }
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&libraries=places&v=weekly`;
    s.async = true;
    s.defer = true;
    s.dataset.gmaps = "1";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("gmaps load failed"));
    document.head.appendChild(s);
  });
  return scriptPromise;
}
