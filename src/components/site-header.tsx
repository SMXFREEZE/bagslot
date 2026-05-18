import Link from "next/link";
import { Search, Plane, ShieldCheck, Plus, LogOut } from "lucide-react";
import { NotificationBell } from "@/components/notification-bell";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/user-avatar";
import { getCurrentProfile } from "@/lib/auth";
import { signOut } from "@/app/(auth)/actions";
import { Badge } from "@/components/ui/badge";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function SiteHeader() {
  const profile = await getCurrentProfile();

  let unreadCount = 0;
  if (profile) {
    const supabase = await createSupabaseServerClient();
    const { count } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", profile.id)
      .is("read_at", null);
    unreadCount = count ?? 0;
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/70 backdrop-blur-xl">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-brand-700 text-white shadow-soft">
            <Plane className="h-4 w-4" />
          </span>
          <span className="text-[15px] tracking-tight">BagSlot</span>
        </Link>

        <nav className="hidden items-center gap-0.5 md:flex">
          <Button asChild variant="ghost" size="sm">
            <Link href="/search">
              <Search className="h-4 w-4" /> Find a trip
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/trips/new">
              <Plus className="h-4 w-4" /> Post a trip
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/safety">
              <ShieldCheck className="h-4 w-4" /> Safety
            </Link>
          </Button>
        </nav>

        <div className="flex items-center gap-2">
          {profile ? (
            <>
              <NotificationBell userId={profile.id} initialCount={unreadCount} />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1">
                    <UserAvatar name={profile.full_name} url={profile.avatar_url} className="h-9 w-9" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{profile.full_name ?? "Account"}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild><Link href="/dashboard">Dashboard</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link href="/dashboard/traveler">My trips</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link href="/dashboard/sender">My requests</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link href="/notifications">Notifications</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link href="/account">Account</Link></DropdownMenuItem>
                  {profile.is_admin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin">
                          Admin <Badge variant="dark" className="ml-auto">Staff</Badge>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <form action={signOut}>
                      <button type="submit" className="flex w-full items-center gap-2">
                        <LogOut className="h-4 w-4" /> Sign out
                      </button>
                    </form>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/signup">Get started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
