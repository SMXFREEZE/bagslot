import { redirect } from "next/navigation";
import { getCurrentProfile, getCurrentUser } from "@/lib/auth";
import { OnboardingForm } from "./form";
import { Card } from "@/components/ui/card";

export const metadata = { title: "Welcome to BagSlot" };

export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const profile = await getCurrentProfile();
  // If they've already filled in name + city, push them to the dashboard.
  if (profile?.full_name && profile?.home_city) redirect("/dashboard");

  return (
    <div className="container-page max-w-2xl py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Welcome to BagSlot</h1>
      <p className="mt-1 text-muted-foreground">
        Tell us a bit about you. This helps the other side trust you.
      </p>
      <Card className="mt-6 p-6">
        <OnboardingForm defaultName={profile?.full_name ?? user.user_metadata?.full_name ?? ""} />
      </Card>
    </div>
  );
}
