import Link from "next/link";
import {
  User, ShieldCheck, Bell, Plane, Package, MessageSquare,
  LogOut, ChevronRight, Wallet, Globe,
} from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { signOut } from "@/app/(auth)/actions";
import { IosNavBar } from "@/components/ios/nav-bar";
import { IosListGroup, IosListRow } from "@/components/ios/list";
import { UserAvatar } from "@/components/user-avatar";
import { VerificationBadge } from "@/components/verification-badge";
import { RatingStars } from "@/components/rating-stars";
import { AccountForm } from "./form";

export const metadata = { title: "Account" };

export default async function AccountPage() {
  const profile = await requireProfile();

  return (
    <div className="ios-screen pb-32">
      <div className="container-page max-w-2xl">
        <IosNavBar title="Profile" backHref="/dashboard" backLabel="Dashboard" />

        {/* Profile header */}
        <Link
          href="#edit"
          className="ios-group mb-7 flex items-center gap-4 p-4 active:opacity-80"
        >
          <UserAvatar name={profile.full_name} url={profile.avatar_url} className="h-16 w-16" />
          <div className="min-w-0 flex-1">
            <div className="truncate text-[20px] font-semibold tracking-tight">
              {profile.full_name ?? "Add your name"}
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[13px] text-[hsl(var(--ios-label-secondary))]">
              {profile.home_city && <span>{profile.home_city}</span>}
              {profile.home_city && <span>·</span>}
              <RatingStars
                rating={Number(profile.rating_average ?? 0)}
                count={profile.rating_count}
                showCount
              />
            </div>
            <div className="mt-1.5">
              <VerificationBadge status={profile.verification_status} />
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-[hsl(var(--ios-label-tertiary))]" />
        </Link>

        {/* Quick actions */}
        <IosListGroup>
          <IosListRow leading={<IconSquare icon={Plane} />} title="My trips" href="/dashboard/traveler" />
          <IosListRow leading={<IconSquare icon={Package} />} title="My bookings" href="/dashboard/sender" />
          <IosListRow leading={<IconSquare icon={Bell} />} title="Inbox" href="/notifications" />
          <IosListRow leading={<IconSquare icon={MessageSquare} />} title="Dashboard" href="/dashboard" />
        </IosListGroup>

        {/* Account */}
        <IosListGroup header="Account">
          <IosListRow
            leading={<IconSquare icon={User} />}
            title="Verification"
            detail={
              profile.verification_status === "id_verified"
                ? "Verified"
                : profile.verification_status === "email_verified"
                  ? "Email only"
                  : "Not verified"
            }
            href="/safety"
          />
          <IosListRow
            leading={<IconSquare icon={Wallet} />}
            title="Payouts"
            detail="Not set up"
            href="/dashboard/traveler"
          />
          <IosListRow
            leading={<IconSquare icon={Globe} />}
            title="Languages"
            detail={(profile.languages ?? []).join(", ") || "Add"}
            href="#edit"
          />
        </IosListGroup>

        <IosListGroup header="Trust & safety">
          <IosListRow leading={<IconSquare icon={ShieldCheck} />} title="Safety rules" href="/safety" />
        </IosListGroup>

        {/* Inline editor */}
        <section id="edit" className="ios-group mb-7 scroll-mt-24 p-5 md:p-6">
          <h2 className="ios-headline mb-4">Edit profile</h2>
          <AccountForm profile={profile} />
        </section>

        {/* Sign out */}
        <IosListGroup>
          <IosListRow
            title=""
            hideChevron
            trailing={
              <form action={signOut} className="flex w-full justify-center">
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 text-[17px] font-medium text-red-600 active:opacity-60"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </form>
            }
          />
        </IosListGroup>

        <div className="mb-6 px-4 text-center text-[13px] text-[hsl(var(--ios-label-tertiary))]">
          BagSlot · Find someone already flying there.
        </div>
      </div>
    </div>
  );
}

function IconSquare({
  icon: Icon,
  tone = "default",
}: {
  icon: React.ComponentType<{ className?: string }>;
  tone?: "default" | "danger";
}) {
  return (
    <span
      className={
        "grid h-7 w-7 place-items-center rounded-md " +
        (tone === "danger" ? "bg-red-100 text-red-600" : "bg-secondary text-foreground")
      }
    >
      <Icon className="h-4 w-4" />
    </span>
  );
}
