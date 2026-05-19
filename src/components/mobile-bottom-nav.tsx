"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Plane, Package, MessageSquare, User } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/search", label: "Search", icon: Search },
  { href: "/dashboard/traveler", label: "Trips", icon: Plane },
  { href: "/dashboard/sender", label: "Bookings", icon: Package },
  { href: "/notifications", label: "Inbox", icon: MessageSquare },
  { href: "/account", label: "Profile", icon: User },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-[hsl(var(--ios-separator))] bg-background/85 backdrop-blur-xl md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid grid-cols-5 px-1">
        {items.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href ||
            (href !== "/" && pathname?.startsWith(href));
          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 py-2 text-[10px] font-medium transition active:opacity-60",
                  active ? "text-foreground" : "text-[hsl(var(--ios-label-tertiary))]",
                )}
              >
                <Icon
                  className={cn(
                    "h-[26px] w-[26px] transition",
                    active ? "stroke-[2.2]" : "stroke-[1.6]",
                  )}
                />
                <span className="text-[10px] leading-tight tracking-tight">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
