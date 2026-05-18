"use client";
import { useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  acceptBooking,
  rejectBooking,
  startCheckout,
  confirmPickup,
  confirmDelivery,
  openDispute,
} from "../actions";
import type { Booking } from "@/lib/types/db";

export function BookingActions({
  booking,
  me,
}: {
  booking: Booking;
  me: "traveler" | "sender";
}) {
  const [pending, startTransition] = useTransition();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showDispute, setShowDispute] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");

  const run = (fn: () => Promise<unknown>) => {
    setError(null);
    startTransition(async () => {
      try {
        await fn();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong.");
      }
    });
  };

  return (
    <Card className="p-6">
      <h2 className="text-base font-semibold">Next step</h2>

      {/* Requested → traveler accepts/rejects */}
      {booking.status === "requested" && me === "traveler" && (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button onClick={() => run(() => acceptBooking(booking.id))} disabled={pending}>Accept</Button>
          <Button variant="outline" onClick={() => run(() => rejectBooking(booking.id))} disabled={pending}>Decline</Button>
        </div>
      )}
      {booking.status === "requested" && me === "sender" && (
        <p className="mt-2 text-sm text-muted-foreground">Waiting for the traveler to accept your request.</p>
      )}

      {/* Payment pending → sender pays */}
      {booking.status === "payment_pending" && me === "sender" && (
        <div className="mt-3">
          <Button
            onClick={() =>
              run(async () => {
                const res = await startCheckout(booking.id);
                if (res && res.ok && "url" in res && res.url) window.location.href = res.url;
              })
            }
            disabled={pending}
          >
            Pay {formatPrice(booking.agreed_price)}
          </Button>
          <p className="mt-2 text-xs text-muted-foreground">
            Funds are held in escrow and released to the traveler after the recipient confirms delivery.
          </p>
        </div>
      )}
      {booking.status === "payment_pending" && me === "traveler" && (
        <p className="mt-2 text-sm text-muted-foreground">Accepted. Waiting for the sender to pay.</p>
      )}

      {/* Paid → traveler enters pickup code */}
      {booking.status === "paid" && me === "traveler" && (
        <div className="mt-3 space-y-3">
          <Label htmlFor="pickup">Enter the pickup code shown by the sender</Label>
          <div className="flex gap-2">
            <Input
              id="pickup"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="6 characters"
              maxLength={8}
              className="font-mono tracking-widest"
            />
            <Button
              onClick={() =>
                run(async () => {
                  const res = await confirmPickup(booking.id, code);
                  if (res && !res.ok) setError(res.error ?? "Failed");
                  else setCode("");
                })
              }
              disabled={pending || code.length < 4}
            >
              Confirm pickup
            </Button>
          </div>
        </div>
      )}
      {booking.status === "paid" && me === "sender" && (
        <p className="mt-2 text-sm text-muted-foreground">Share your pickup code with the traveler when they arrive.</p>
      )}

      {/* Picked up → traveler enters delivery code (on arrival) */}
      {(booking.status === "picked_up" || booking.status === "in_transit") && me === "traveler" && (
        <div className="mt-3 space-y-3">
          <Label htmlFor="delivery">Enter the delivery code shown by the recipient</Label>
          <div className="flex gap-2">
            <Input
              id="delivery"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="6 characters"
              maxLength={8}
              className="font-mono tracking-widest"
            />
            <Button
              onClick={() =>
                run(async () => {
                  const res = await confirmDelivery(booking.id, code);
                  if (res && !res.ok) setError(res.error ?? "Failed");
                  else setCode("");
                })
              }
              disabled={pending || code.length < 4}
            >
              Confirm delivery
            </Button>
          </div>
        </div>
      )}
      {(booking.status === "picked_up" || booking.status === "in_transit") && me === "sender" && (
        <p className="mt-2 text-sm text-muted-foreground">
          Traveler has your item. Share your delivery code on handoff to release the payment.
        </p>
      )}

      {booking.status === "completed" && (
        <p className="mt-2 text-sm text-emerald-700">Booking complete. Funds released.</p>
      )}
      {booking.status === "rejected" && (
        <p className="mt-2 text-sm text-red-700">This request was declined.</p>
      )}
      {booking.status === "cancelled" && (
        <p className="mt-2 text-sm text-muted-foreground">This booking was cancelled.</p>
      )}
      {booking.status === "disputed" && (
        <p className="mt-2 text-sm text-red-700">
          Dispute opened. An admin will review and contact both parties.
        </p>
      )}

      {/* Dispute */}
      {["paid", "picked_up", "in_transit", "delivered"].includes(booking.status) && (
        <div className="mt-6 border-t border-border pt-4">
          {!showDispute ? (
            <button
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setShowDispute(true)}
            >
              Something went wrong? Open a dispute
            </button>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="dispute">Describe the issue</Label>
              <Textarea id="dispute" value={disputeReason} onChange={(e) => setDisputeReason(e.target.value)} />
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  onClick={() => run(() => openDispute(booking.id, disputeReason))}
                  disabled={pending || disputeReason.length < 5}
                >
                  Open dispute
                </Button>
                <Button variant="ghost" onClick={() => setShowDispute(false)}>Cancel</Button>
              </div>
            </div>
          )}
        </div>
      )}

      {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
    </Card>
  );
}

function formatPrice(n: number | string) {
  const v = typeof n === "string" ? Number(n) : n;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);
}
