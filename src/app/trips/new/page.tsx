import { requireProfile } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { NewTripForm } from "./form";

export const metadata = { title: "Post a trip" };

export default async function NewTripPage() {
  await requireProfile();
  return (
    <div className="container-page max-w-3xl py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Post a trip</h1>
      <p className="mt-1 text-muted-foreground">
        Earn from the empty space in your suitcase. Senders will request to put small, allowed items in.
        You inspect and approve every item.
      </p>
      <Card className="mt-6 p-6">
        <NewTripForm />
      </Card>
    </div>
  );
}
