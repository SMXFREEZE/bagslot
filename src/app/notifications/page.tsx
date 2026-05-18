import Link from "next/link";
import { Bell, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { requireProfile } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { relativeTime, cn } from "@/lib/utils";
import { markAllRead } from "./actions";
import type { Notification } from "@/lib/types/db";

export const metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const profile = await requireProfile();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(50);
  const notifications = (data as Notification[]) ?? [];
  const unread = notifications.filter((n) => !n.read_at);

  return (
    <div className="container-page max-w-3xl py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
          <p className="mt-1 text-sm text-muted-foreground">{unread.length} unread</p>
        </div>
        {unread.length > 0 && (
          <form action={markAllRead}>
            <Button type="submit" variant="outline" size="sm">
              <Check className="h-4 w-4" /> Mark all read
            </Button>
          </form>
        )}
      </div>

      <div className="mt-6 space-y-2">
        {notifications.length === 0 ? (
          <EmptyState icon={Bell} title="No notifications yet" description="You'll see booking updates and messages here." />
        ) : (
          notifications.map((n) => {
            const inner = (
              <Card
                className={cn(
                  "flex items-start gap-3 p-4 transition",
                  !n.read_at && "border-brand-300 bg-brand-50/40",
                )}
              >
                <div className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ background: n.read_at ? "transparent" : "var(--brand-600, #0d9488)" }} />
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{n.title}</div>
                  {n.body && <div className="mt-0.5 text-sm text-muted-foreground">{n.body}</div>}
                  <div className="mt-1 text-xs text-muted-foreground">{relativeTime(n.created_at)}</div>
                </div>
              </Card>
            );
            return n.link_url ? (
              <Link key={n.id} href={n.link_url}>
                {inner}
              </Link>
            ) : (
              <div key={n.id}>{inner}</div>
            );
          })
        )}
      </div>
    </div>
  );
}
