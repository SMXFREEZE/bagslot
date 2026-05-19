"use client";
import { Drawer } from "vaul";
import { cn } from "@/lib/utils";

/**
 * iOS-native bottom sheet built on Vaul. Use anywhere you'd reach for a
 * Dialog on mobile — actions, filters, item details. Rounded top corners,
 * grab handle, snap-back drag, scroll-locked body — exact iOS behavior.
 */
export function IosSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <Drawer.Content
          className={cn(
            "fixed inset-x-0 bottom-0 z-50 mt-24 flex max-h-[92dvh] flex-col rounded-t-[20px] border-t border-border bg-card outline-none",
            className,
          )}
        >
          {/* Grab handle */}
          <div className="mx-auto mt-2 h-1.5 w-10 shrink-0 rounded-full bg-[hsl(var(--ios-fill))]" />
          {(title || description) && (
            <div className="px-5 pb-3 pt-4 text-center">
              {title && <Drawer.Title className="ios-headline">{title}</Drawer.Title>}
              {description && (
                <Drawer.Description className="ios-footnote mt-1">
                  {description}
                </Drawer.Description>
              )}
            </div>
          )}
          <div
            className="overflow-y-auto px-5 pb-[max(env(safe-area-inset-bottom),1.25rem)]"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {children}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

export const IosSheetTrigger = Drawer.Trigger;
