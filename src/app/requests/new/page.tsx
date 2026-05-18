import { redirect } from "next/navigation";
import { requireProfile, getCurrentUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { NewRequestForm } from "./form";
import type { Trip } from "@/lib/types/db";

export const metadata = { title: "Send an item" };

export default async function NewRequestPage({
  searchParams,
}: {
  searchParams: Promise<{ trip?: string }>;
}) {
  await requireProfile();
  const user = await getCurrentUser();
  const sp = await searchParams;
  if (!sp.trip) redirect("/search");

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("trips").select("*").eq("id", sp.trip).maybeSingle();
  const trip = data as Trip | null;
  if (!trip) redirect("/search");

  return (
    <div className="container-page max-w-3xl py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Send an item</h1>
      <p className="mt-1 text-muted-foreground">
        Trip: <span className="font-medium text-foreground">{trip.departure_city} → {trip.destination_city}</span> ·{" "}
        Up to <span className="font-medium text-foreground">{trip.available_weight_kg} kg</span> free
      </p>
      <Card className="mt-6 p-6">
        <NewRequestForm trip={trip} userId={user?.id ?? ""} />
      </Card>
    </div>
  );
}
