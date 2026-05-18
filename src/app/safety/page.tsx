import { Card } from "@/components/ui/card";
import { TrustChecklist } from "@/components/trust-checklist";
import { PROHIBITED_CATEGORIES, RESTRICTED_CATEGORIES } from "@/lib/safety";
import { ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";

export const metadata = { title: "Safety & rules" };

export default function SafetyPage() {
  return (
    <div className="container-page max-w-4xl py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Safety & rules</h1>
      <p className="mt-2 text-muted-foreground">
        BagSlot is a peer-to-peer marketplace, not a courier service. Trust comes from clear rules and
        every traveler inspecting every item. Read these before you post or book.
      </p>

      <Card className="mt-8 p-6">
        <div className="flex items-center gap-2 text-foreground">
          <ShieldCheck className="h-5 w-5 text-brand-600" />
          <h2 className="text-lg font-semibold">How we keep you safe</h2>
        </div>
        <div className="mt-4">
          <TrustChecklist />
        </div>
      </Card>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center gap-2">
            <ShieldX className="h-5 w-5 text-red-600" />
            <h2 className="text-lg font-semibold">Prohibited — blocked automatically</h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            These items will be blocked at submission. We will not connect a sender with a traveler for any of these.
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            {PROHIBITED_CATEGORIES.map((c) => (
              <li key={c} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500" /> {c}
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-amber-600" />
            <h2 className="text-lg font-semibold">Restricted — needs review</h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            These items may be allowed depending on airline rules and the destination country's customs.
            They will be flagged for the traveler to review carefully.
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            {RESTRICTED_CATEGORIES.map((c) => (
              <li key={c} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> {c}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="mt-8 p-6">
        <h2 className="text-lg font-semibold">Handoff codes</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Every booking comes with two one-time codes:
        </p>
        <ul className="mt-3 space-y-2 text-sm">
          <li><span className="font-medium">Pickup code</span> — sender shares with traveler at the pickup. Traveler enters it to confirm the item was handed over.</li>
          <li><span className="font-medium">Delivery code</span> — recipient shares with the traveler at delivery. Traveler enters it to release payment.</li>
        </ul>
      </Card>

      <Card className="mt-8 border-amber-200 bg-amber-50/40 p-6">
        <h2 className="text-lg font-semibold text-amber-900">Customs & airline compliance is your responsibility</h2>
        <p className="mt-2 text-sm text-amber-900/90">
          BagSlot is a marketplace. You are responsible for following your airline's baggage rules and
          the destination country's customs regulations. When in doubt: declare it, or don't carry it.
        </p>
      </Card>
    </div>
  );
}
