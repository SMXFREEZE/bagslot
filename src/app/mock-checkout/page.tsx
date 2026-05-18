import Link from "next/link";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";
import { MockCheckoutForm } from "./form";
import { getCurrentUser } from "@/lib/auth";

export const metadata = { title: "Mock checkout" };

export default async function MockCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ booking?: string; amount?: string; next?: string }>;
}) {
  const sp = await searchParams;
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!sp.booking || !sp.next) redirect("/dashboard");

  return (
    <div className="container-page max-w-md py-12">
      <Card className="p-6">
        <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-900">
          <ShieldAlert className="h-4 w-4" />
          Mock checkout — Stripe keys not configured
        </div>
        <h1 className="mt-5 text-xl font-semibold">Confirm your payment</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          You're paying <span className="font-semibold">${Number(sp.amount ?? 0).toFixed(2)}</span> for booking
          #{sp.booking.slice(0, 8)}. In production this would redirect to Stripe Checkout.
        </p>
        <MockCheckoutForm bookingId={sp.booking} next={sp.next} />
        <p className="mt-4 text-center text-xs">
          <Link href={`/bookings/${sp.booking}`} className="text-muted-foreground hover:underline">Cancel</Link>
        </p>
      </Card>
    </div>
  );
}
