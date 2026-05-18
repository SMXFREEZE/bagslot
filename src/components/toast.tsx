"use client";
import * as React from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastKind = "default" | "success" | "error" | "info";
interface ToastItem {
  id: string;
  title: string;
  description?: string;
  kind: ToastKind;
}

const ToastContext = React.createContext<{
  push: (t: Omit<ToastItem, "id">) => void;
} | null>(null);

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) return { push: () => {} };
  return ctx;
}

export function Toaster() {
  const [items, setItems] = React.useState<ToastItem[]>([]);

  const push = React.useCallback((t: Omit<ToastItem, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setItems((prev) => [...prev, { ...t, id }]);
  }, []);

  const remove = (id: string) => setItems((prev) => prev.filter((p) => p.id !== id));

  return (
    <ToastContext.Provider value={{ push }}>
      <ToastPrimitive.Provider swipeDirection="right">
        {items.map((t) => (
          <ToastPrimitive.Root
            key={t.id}
            open
            onOpenChange={(o) => !o && remove(t.id)}
            duration={4000}
            className={cn(
              "group pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-card",
              "data-[state=open]:animate-in data-[state=open]:slide-in-from-right-full",
            )}
          >
            <Icon kind={t.kind} />
            <div className="flex-1 text-sm">
              <ToastPrimitive.Title className="font-semibold text-foreground">
                {t.title}
              </ToastPrimitive.Title>
              {t.description && (
                <ToastPrimitive.Description className="mt-0.5 text-muted-foreground">
                  {t.description}
                </ToastPrimitive.Description>
              )}
            </div>
            <ToastPrimitive.Close className="text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        ))}
        <ToastPrimitive.Viewport className="fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2 outline-none" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}

function Icon({ kind }: { kind: ToastKind }) {
  const cls = "h-5 w-5 shrink-0";
  if (kind === "success") return <CheckCircle2 className={cn(cls, "text-emerald-600")} />;
  if (kind === "error") return <AlertCircle className={cn(cls, "text-red-600")} />;
  if (kind === "info") return <Info className={cn(cls, "text-brand-600")} />;
  return <Info className={cn(cls, "text-muted-foreground")} />;
}
