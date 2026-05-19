"use client";
import { Toaster as SonnerToaster, toast } from "sonner";

/**
 * App-wide toast surface. Sonner is the de-facto best toast lib for React
 * (used by shadcn/ui and the rest of the modern Next stack).
 */
export function Toaster() {
  return (
    <SonnerToaster
      position="top-center"
      theme="light"
      richColors
      closeButton
      offset={16}
      toastOptions={{
        classNames: {
          toast: "card-surface !rounded-2xl !border-border !bg-card",
          title: "!text-foreground !font-medium",
          description: "!text-muted-foreground",
        },
      }}
    />
  );
}

// Re-export `toast()` so call sites don't need to know we're using Sonner.
export { toast };

// Back-compat shim: existing call sites used useToast() — keep it.
export function useToast() {
  return {
    push: ({ title, description, kind }: { title: string; description?: string; kind?: "default" | "success" | "error" | "info" }) => {
      if (kind === "success") toast.success(title, { description });
      else if (kind === "error") toast.error(title, { description });
      else if (kind === "info") toast.info(title, { description });
      else toast(title, { description });
    },
  };
}
