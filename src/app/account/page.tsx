import { Card } from "@/components/ui/card";
import { requireProfile } from "@/lib/auth";
import { AccountForm } from "./form";

export const metadata = { title: "Account" };

export default async function AccountPage() {
  const profile = await requireProfile();
  return (
    <div className="container-page max-w-3xl py-10 pb-32 md:pb-10">
      <h1 className="text-2xl font-semibold tracking-tight">Your account</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        How you show up to other travelers and senders.
      </p>
      <Card className="mt-6 p-6 md:p-8">
        <AccountForm profile={profile} />
      </Card>
    </div>
  );
}
