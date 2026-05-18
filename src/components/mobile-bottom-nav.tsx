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
  { href: "/dashboard", label: "Profile", icon: User },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur-xl md:hidden">
      <ul className="grid grid-cols-5">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/" && pathname?.startsWith(href));
          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition",
                  active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                <Icon className={cn("h-5 w-5", active && "stroke-[2.25]")} />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
