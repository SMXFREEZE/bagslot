import { Badge } from "@/components/ui/badge";
import type { BookingStatus } from "@/lib/types/db";

const STATUS_LABELS: Record<BookingStatus, { label: string; variant: "default" | "muted" | "success" | "warning" | "danger" | "dark" }> = {
  requested: { label: "Requested", variant: "muted" },
  accepted: { label: "Accepted", variant: "default" },
  rejected: { label: "Rejected", variant: "danger" },
  payment_pending: { label: "Payment pending", variant: "warning" },
  paid: { label: "Paid · awaiting pickup", variant: "default" },
  picked_up: { label: "Picked up", variant: "default" },
  in_transit: { label: "In transit", variant: "default" },
  delivered: { label: "Delivered", variant: "success" },
  completed: { label: "Completed", variant: "success" },
  disputed: { label: "Disputed", variant: "danger" },
  cancelled: { label: "Cancelled", variant: "muted" },
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const cfg = STATUS_LABELS[status];
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}
