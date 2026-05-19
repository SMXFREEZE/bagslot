"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  Search, Plane, Package, Bell, Plus, ShieldCheck, User,
  LayoutGrid, MessageSquare, Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Linear-style Cmd+K palette. Press ⌘K (Mac) / Ctrl+K (Win) anywhere to open.
 * Quick-navigates to key product surfaces.
 */
export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };
  const goSearch = () => {
    if (!search.trim()) return go("/search");
    setOpen(false);
    router.push(`/search?to=${encodeURIComponent(search.trim())}`);
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center bg-black/40 px-4 pt-[14vh] backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <Command
            label="Command menu"
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 border-b border-border px-4">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Command.Input
                placeholder="Search a city, route, or jump anywhere…"
                value={search}
                onValueChange={setSearch}
                className="h-14 w-full bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
                autoFocus
              />
              <button
                onClick={() => setOpen(false)}
                className="rounded-md border border-border bg-secondary px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
                aria-label="Close"
              >
                ESC
              </button>
            </div>
            <Command.List className="max-h-[60vh] overflow-y-auto p-2">
              <Command.Empty className="px-3 py-8 text-center text-sm text-muted-foreground">
                Press enter to search trips for &ldquo;{search}&rdquo;
              </Command.Empty>

              <Command.Group heading="Search">
                <PaletteItem
                  icon={Search}
                  label={search ? `Find trips to "${search}"` : "Find a trip"}
                  shortcut="↵"
                  onSelect={goSearch}
                />
                <PaletteItem
                  icon={Plane}
                  label="Trending routes"
                  onSelect={() => go("/search")}
                />
              </Command.Group>

              <Command.Group heading="Quick actions">
                <PaletteItem icon={Plus} label="Post a trip" shortcut="P" onSelect={() => go("/trips/new")} />
                <PaletteItem icon={Package} label="My bookings" onSelect={() => go("/dashboard/sender")} />
                <PaletteItem icon={Plane} label="My trips" onSelect={() => go("/dashboard/traveler")} />
                <PaletteItem icon={Bell} label="Inbox" onSelect={() => go("/notifications")} />
                <PaletteItem icon={LayoutGrid} label="Dashboard" onSelect={() => go("/dashboard")} />
              </Command.Group>

              <Command.Group heading="Account">
                <PaletteItem icon={User} label="Profile" onSelect={() => go("/account")} />
                <PaletteItem icon={ShieldCheck} label="Safety rules" onSelect={() => go("/safety")} />
                <PaletteItem icon={MessageSquare} label="Messages" onSelect={() => go("/dashboard")} />
                <PaletteItem icon={Settings} label="Settings" onSelect={() => go("/account")} />
              </Command.Group>
            </Command.List>
            <div className="flex items-center justify-between border-t border-border bg-sand-50/60 px-4 py-2 text-[11px] text-muted-foreground">
              <span>
                <kbd className="font-mono">↑↓</kbd> navigate · <kbd className="font-mono">↵</kbd> select
              </span>
              <span>
                <kbd className="font-mono">⌘K</kbd> toggle
              </span>
            </div>
          </Command>
        </div>
      )}
    </>
  );
}

function PaletteItem({
  icon: Icon, label, shortcut, onSelect,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  shortcut?: string;
  onSelect: () => void;
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm",
        "aria-selected:bg-secondary",
      )}
    >
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="flex-1">{label}</span>
      {shortcut && (
        <kbd className="rounded border border-border bg-card px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
          {shortcut}
        </kbd>
      )}
    </Command.Item>
  );
}
