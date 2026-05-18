import Link from "next/link";
import { Package } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookingStatusBadge } from "@/components/booking-status-badge";
import { EmptyState } from "@/components/empty-state";
import { requireProfile } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SafetyBadge } from "@/components/safety-badge";
import type { ItemRequest, Booking } from "@/lib/types/db";

export const metadata = { title: "Sender dashboard" };

export default async function SenderDashboard() {
  const profile = await requireProfile();
  const supabase = await createSupabaseServerClient();
  const [{ data: reqData }, { data: bookData }] = await Promise.all([
    supabase.from("item_requests").select("*").eq("sender_id", profile.id).order("created_at", { ascending: false }),
    supabase.from("bookings").select("*").eq("sender_id", profile.id).order("created_at", { ascending: false }),
  ]);
  const requests = (reqData as ItemRequest[]) ?? [];
  const bookings = (bookData as Booking[]) ?? [];

  return (
    <div className="container-page py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Sender dashboard</h1>
        <Button asChild><Link href="/search">Find a trip</Link></Button>
      </div>

      <Tabs defaultValue="bookings" className="mt-6">
        <TabsList>
          <TabsTrigger value="bookings">My bookings ({bookings.length})</TabsTrigger>
          <TabsTrigger value="requests">My requests ({requests.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="bookings">
          {bookings.length === 0 ? (
            <EmptyState icon={Package} title="No bookings yet" description="Find a trip and send your first item." actionLabel="Find a trip" actionHref="/search" />
          ) : (
            <div className="grid gap-3">
              {bookings.map((b) => (
                <Card key={b.id} className="p-5">
                  <Link href={`/bookings/${b.id}`} className="flex items-center justify-between hover:underline">
                    <div>
                      <div className="font-medium">Booking #{b.id.slice(0, 8)}</div>
                      <div className="text-xs text-muted-foreground">Total {formatCurrency(Number(b.agreed_price))}</div>
                    </div>
                    <BookingStatusBadge status={b.status} />
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests">
          {requests.length === 0 ? (
            <EmptyState icon={Package} title="No requests yet" description="Submit an item request from a trip page." />
          ) : (
            <div className="grid gap-3">
              {requests.map((r) => (
                <Card key={r.id} className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{r.item_name}</div>
                      <div className="text-xs text-muted-foreground">
                        {r.origin_city} → {r.destination_city} · {r.item_weight_kg} kg
                      </div>
                    </div>
                    <SafetyBadge status={r.safety_status} />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
