import Link from "next/link";
import { Plane } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SignupForm } from "./form";

export const metadata = { title: "Create an account" };

export default function SignupPage() {
  return (
    <div className="container-page flex min-h-[calc(100vh-8rem)] items-center justify-center py-12">
      <Card className="w-full max-w-md p-8">
        <div className="mb-6 flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
            <Plane className="h-4 w-4" />
          </span>
          <h1 className="text-xl font-semibold tracking-tight">Join BagSlot</h1>
        </div>
        <p className="mb-5 text-sm text-muted-foreground">
          A peer-to-peer marketplace for empty suitcase space. Send small items with verified travelers.
        </p>
        <SignupForm />
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-brand-700 underline-offset-2 hover:underline">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}
