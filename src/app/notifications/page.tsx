import { Bell, Check } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { relativeTime } from "@/lib/utils";
import { markAllRead } from "./actions";
import { IosNavBar } from "@/components/ios/nav-bar";
import { IosListGroup, IosListRow } from "@/components/ios/list";
import type { Notification } from "@/lib/types/db";

export const metadata = { title: "Notifications" };

function groupByDay(notifications: Notification[]) {
  const today: Notification[] = [];
  const week: Notification[] = [];
  const older: Notification[] = [];
  const now = Date.now();
  for (const n of notifications) {
    const age = now - new Date(n.created_at).getTime();
    if (age < 24 * 3600 * 1000) today.push(n);
    else if (age < 7 * 24 * 3600 * 1000) week.push(n);
    else older.push(n);
  }
  return { today, week, older };
}

export default async function NotificationsPage() {
  const profile = await requireProfile();
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(80);
  const notifications = (data as Notification[]) ?? [];
  const unread = notifications.filter((n) => !n.read_at);
  const { today, week, older } = groupByDay(notifications);

  return (
    <div className="ios-screen pb-32">
      <div className="container-page max-w-2xl">
        <IosNavBar
          title="Inbox"
          backHref="/dashboard"
          backLabel="Dashboard"
          subtitle={unread.length ? `${unread.length} unread` : "All caught up"}
          right={
            unread.length > 0 ? (
              <form action={markAllRead}>
                <button
                  type="submit"
                  className="rounded-lg px-3 py-1.5 text-[15px] font-medium text-foreground active:opacity-60"
                >
                  <Check className="inline h-4 w-4" /> Mark all
                </button>
              </form>
            ) : null
          }
        />

        {notifications.length === 0 ? (
          <div className="ios-group p-10 text-center">
            <Bell className="mx-auto h-7 w-7 text-[hsl(var(--ios-label-tertiary))]" />
            <div className="ios-headline mt-3">Inbox zero</div>
            <p className="mt-1 text-[15px] text-[hsl(var(--ios-label-secondary))]">
              You&apos;ll see booking updates and messages here.
            </p>
          </div>
        ) : (
          <>
            {today.length > 0 && <Group label="Today" items={today} />}
            {week.length > 0 && <Group label="This week" items={week} />}
            {older.length > 0 && <Group label="Earlier" items={older} />}
          </>
        )}
      </div>
    </div>
  );
}

function Group({ label, items }: { label: string; items: Notification[] }) {
  return (
    <IosListGroup header={label}>
      {items.map((n) => (
        <IosListRow
          key={n.id}
          leading={
            <span
              className={
                n.read_at
                  ? "block h-2 w-2 rounded-full bg-transparent"
                  : "block h-2 w-2 rounded-full bg-foreground"
              }
            />
          }
          title={n.title}
          subtitle={n.body ?? undefined}
          detail={relativeTime(n.created_at)}
          href={n.link_url ?? undefined}
        />
      ))}
    </IosListGroup>
  );
}
