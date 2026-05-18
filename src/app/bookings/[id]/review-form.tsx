"use client";
import { useState, useTransition } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { leaveReview } from "../actions";

export function ReviewForm({ bookingId, revieweeName }: { bookingId: string; revieweeName: string }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (done) {
    return <p className="text-sm text-emerald-700">Thanks — review saved.</p>;
  }

  return (
    <div className="space-y-3">
      <div className="text-sm text-muted-foreground">How was your experience with {revieweeName}?</div>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            className="rounded-md p-1 transition hover:bg-secondary"
            aria-label={`Rate ${n}`}
          >
            <Star
              className={cn("h-7 w-7", n <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground")}
            />
          </button>
        ))}
      </div>
      <Textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Optional — what went well, what could have gone better?"
      />
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <div>
        <Button
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const res = await leaveReview(bookingId, rating, comment);
              if (res?.ok) setDone(true);
              else setError(res?.error ?? "Failed");
            })
          }
        >
          {pending ? "Posting…" : "Post review"}
        </Button>
      </div>
    </div>
  );
}
