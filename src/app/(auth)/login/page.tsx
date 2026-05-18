import Link from "next/link";
import { Plane } from "lucide-react";
import { Card } from "@/components/ui/card";
import { LoginForm } from "./form";
import { GoogleSignInButton } from "@/components/google-signin-button";
import { Separator } from "@/components/ui/separator";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="container-page flex min-h-[calc(100vh-8rem)] items-center justify-center py-12">
      <Card className="w-full max-w-md p-8">
        <div className="mb-6 flex items-center gap-2 text-foreground">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
            <Plane className="h-4 w-4" />
          </span>
          <h1 className="text-xl font-semibold tracking-tight">Welcome back</h1>
        </div>
        <GoogleSignInButton label="Continue with Google" />
        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <Separator className="flex-1" /> or <Separator className="flex-1" />
        </div>
        <LoginForm />
        <p className="mt-6 text-center text-sm text-muted-foreground">
          New to BagSlot?{" "}
          <Link href="/signup" className="font-medium text-brand-700 underline-offset-2 hover:underline">
            Create an account
          </Link>
        </p>
      </Card>
    </div>
  );
}
