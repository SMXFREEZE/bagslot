"use client";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { confirmMockPayment } from "@/app/bookings/actions";

export function MockCheckoutForm({ bookingId, next }: { bookingId: string; next: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <div className="mt-5">
      <Button
        className="w-full"
        size="lg"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const res = await confirmMockPayment(bookingId);
            if (res?.ok) window.location.href = next;
          })
        }
      >
        {pending ? "Processing…" : "Pay (mock)"}
      </Button>
    </div>
  );
}
