"use client";
import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { cn } from "@/lib/utils";

interface Props {
  code: string;
  label: string;
  className?: string;
  payload?: string; // optional richer payload for QR (defaults to the code itself)
}

/**
 * Visual handoff code. Renders a QR code generated from `payload` (or the
 * code itself) alongside the typed code. Travelers can scan the recipient's
 * phone OR type the code manually — both work.
 */
export function HandoffCode({ code, label, payload, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    QRCode.toCanvas(
      canvasRef.current,
      payload ?? code,
      {
        width: 192,
        margin: 1,
        color: { dark: "#0A0A0F", light: "#FFFFFF" },
        errorCorrectionLevel: "M",
      },
      (err) => {
        if (err) setError(err.message);
      },
    );
  }, [code, payload]);

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-5 text-center",
        className,
      )}
    >
      <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </div>
      <canvas ref={canvasRef} className="rounded-md" aria-label={`QR code: ${code}`} />
      {error && <div className="text-xs text-red-600">{error}</div>}
      <div className="font-mono text-2xl font-semibold tracking-[0.3em] text-foreground">
        {code}
      </div>
      <div className="text-xs text-muted-foreground">
        Scan the QR or type the code to confirm the handoff
      </div>
    </div>
  );
}
