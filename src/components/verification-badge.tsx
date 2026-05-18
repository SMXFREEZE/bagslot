import { Badge } from "@/components/ui/badge";
import type { VerificationStatus } from "@/lib/types/db";
import { ShieldCheck, ShieldAlert, Mail } from "lucide-react";

export function VerificationBadge({ status }: { status: VerificationStatus }) {
  if (status === "id_verified") {
    return (
      <Badge variant="success">
        <ShieldCheck className="h-3 w-3" /> ID verified
      </Badge>
    );
  }
  if (status === "email_verified") {
    return (
      <Badge variant="muted">
        <Mail className="h-3 w-3" /> Email verified
      </Badge>
    );
  }
  return (
    <Badge variant="warning">
      <ShieldAlert className="h-3 w-3" /> Unverified
    </Badge>
  );
}
