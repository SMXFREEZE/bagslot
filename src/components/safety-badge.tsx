import { ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ItemSafetyStatus } from "@/lib/types/db";

export function SafetyBadge({ status }: { status: ItemSafetyStatus }) {
  if (status === "allowed") {
    return (
      <Badge variant="success">
        <ShieldCheck className="h-3 w-3" /> Allowed
      </Badge>
    );
  }
  if (status === "flagged") {
    return (
      <Badge variant="warning">
        <ShieldAlert className="h-3 w-3" /> Needs review
      </Badge>
    );
  }
  if (status === "blocked") {
    return (
      <Badge variant="danger">
        <ShieldX className="h-3 w-3" /> Blocked
      </Badge>
    );
  }
  return <Badge variant="muted">Pending</Badge>;
}
