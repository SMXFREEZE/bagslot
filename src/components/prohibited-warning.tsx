"use client";
import { AlertTriangle, X } from "lucide-react";

export function ProhibitedWarning({ reasons }: { reasons: string[] }) {
  if (!reasons.length) return null;
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="flex-1">
        <div className="font-semibold">Safety review</div>
        <ul className="mt-1 list-disc space-y-0.5 pl-4">
          {reasons.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function BlockedWarning({ reasons }: { reasons: string[] }) {
  if (!reasons.length) return null;
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
      <X className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="flex-1">
        <div className="font-semibold">Item not allowed</div>
        <ul className="mt-1 list-disc space-y-0.5 pl-4">
          {reasons.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
