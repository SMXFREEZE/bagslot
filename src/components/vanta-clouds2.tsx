"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";

/**
 * Lazy client-only mount wrapper. Server components can render this directly
 * because the component is already "use client" — but we still want to skip the
 * Vanta import during SSR. So we ship a small wrapper that pulls the real
 * implementation in only after hydration.
 */
export const VantaClouds2Lazy = dynamic(
  () => Promise.resolve({ default: VantaClouds2 }),
  { ssr: false },
);

// Vanta Clouds2 background — animated 3D sky.
// Renders into the parent's position:relative container as an absolutely-positioned canvas.

type VantaInstance = { destroy: () => void; resize?: () => void };
type VantaInit = (opts: Record<string, unknown>) => VantaInstance;

interface Props {
  className?: string;
  // tuneable knobs
  scale?: number;
  scaleMobile?: number;
  skyColor?: number;     // hex int
  cloudColor?: number;
  lightColor?: number;
  speed?: number;
  texturePath?: string;  // public path to the noise texture
}

export function VantaClouds2({
  className,
  scale = 1.0,
  scaleMobile = 1.0,
  skyColor = 0xf7f6f2,   // warm off-white sky
  cloudColor = 0xffffff, // pure white clouds
  lightColor = 0xffffff,
  speed = 0.6,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const effectRef = useRef<VantaInstance | null>(null);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      if (!ref.current) return;
      try {
        // @ts-expect-error -- three ships ESM with no bundled types
        const THREE = await import("three");
        // vanta is CJS; the dist file attaches CLOUDS2 to globalThis when required.
        // @ts-expect-error -- vanta dist has no type declarations
        const mod = await import("vanta/dist/vanta.clouds2.min");
        const CLOUDS2 = (mod as unknown as { default: VantaInit }).default
          ?? (mod as unknown as VantaInit);

        if (cancelled || !ref.current) return;
        effectRef.current = CLOUDS2({
          el: ref.current,
          THREE,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.0,
          minWidth: 200.0,
          scale,
          scaleMobile,
          skyColor,
          cloudColor,
          lightColor,
          speed,
        });
      } catch (err) {
        console.warn("[vanta] failed to init", err);
      }
    };

    init();
    return () => {
      cancelled = true;
      effectRef.current?.destroy();
      effectRef.current = null;
    };
  }, [scale, scaleMobile, skyColor, cloudColor, lightColor, speed]);

  return <div ref={ref} aria-hidden="true" className={className} />;
}
