// Prohibited-item checker. Conservative by design.

export type SafetyVerdict = {
  status: "allowed" | "flagged" | "blocked";
  reasons: string[];
  severity: "low" | "medium" | "high" | "critical";
};

const BLOCKED_KEYWORDS: { pattern: RegExp; reason: string }[] = [
  { pattern: /\b(drug|narcotic|cocaine|heroin|meth|weed|cannabis|marijuana)\b/i, reason: "Drugs and narcotics are blocked." },
  { pattern: /\b(weapon|gun|knife|firearm|ammo|ammunition|taser|pepper spray)\b/i, reason: "Weapons are blocked." },
  { pattern: /\b(explosive|grenade|tnt|fireworks?)\b/i, reason: "Explosives are blocked." },
  { pattern: /\b(passport|id card|driver'?s? licen[sc]e|birth certificate)\b/i, reason: "Personal identification documents are blocked." },
  { pattern: /\b(cash|currency|banknote|gold bar|bullion)\b/i, reason: "Cash and bullion are blocked." },
];

const FLAGGED_KEYWORDS: { pattern: RegExp; reason: string }[] = [
  { pattern: /\b(medic(ine|ation)?|prescription|pill|tablet|insulin)\b/i, reason: "Medication requires manual review and may be restricted by customs." },
  { pattern: /\b(battery|batteries|lithium|power\s?bank)\b/i, reason: "Batteries are restricted by airlines and need manual review." },
  { pattern: /\b(liquid|perfume|cologne|alcohol|wine|beer|spirits|whisk(e)?y|vodka|rum)\b/i, reason: "Liquids and alcohol are restricted by airlines and customs." },
  { pattern: /\b(food|meat|cheese|fruit|dairy|seafood|honey)\b/i, reason: "Food items are often restricted at customs." },
  { pattern: /\b(animal|pet|plant|seed|insect|fish)\b/i, reason: "Animals and plants are restricted at customs." },
  { pattern: /\b(tobacco|cigarette|cigar|vape|vaping|e-?cigarette|nicotine)\b/i, reason: "Tobacco and vaping products are restricted." },
  { pattern: /\b(sealed|wrapped|do not open|unopened package)\b/i, reason: "Sealed or unopened packages are not allowed — traveler must inspect every item." },
  { pattern: /\b(rolex|watch|jewel(ery|ry)|diamond|gold ring)\b/i, reason: "High-value luxury goods need manual review for customs declarations." },
];

export function checkSafety(input: { name: string; description?: string | null; value?: number }): SafetyVerdict {
  const blob = `${input.name} ${input.description ?? ""}`;
  const reasons: string[] = [];
  let status: SafetyVerdict["status"] = "allowed";
  let severity: SafetyVerdict["severity"] = "low";

  for (const { pattern, reason } of BLOCKED_KEYWORDS) {
    if (pattern.test(blob)) {
      reasons.push(reason);
      status = "blocked";
      severity = "critical";
    }
  }

  if (status !== "blocked") {
    for (const { pattern, reason } of FLAGGED_KEYWORDS) {
      if (pattern.test(blob)) {
        reasons.push(reason);
        status = "flagged";
        severity = "medium";
      }
    }
  }

  if (status === "allowed" && (input.value ?? 0) > 500) {
    reasons.push("Item value over $500 requires manual review for customs declarations.");
    status = "flagged";
    severity = "medium";
  }

  return { status, reasons, severity };
}

export const SAFETY_RULES = [
  "No sealed or unopened packages — every item must be inspected by the traveler.",
  "ID verification is required before booking.",
  "Prohibited items are blocked automatically (drugs, weapons, cash, documents).",
  "Restricted items (medicine, batteries, liquids, food) need manual review.",
  "Payment is held until the recipient confirms delivery with the handoff code.",
  "Both parties must confirm pickup and delivery.",
  "You are responsible for complying with your airline's baggage rules and the destination country's customs rules.",
];

export const PROHIBITED_CATEGORIES = [
  "Drugs & narcotics",
  "Weapons & ammunition",
  "Explosives & fireworks",
  "Cash & bullion",
  "ID documents & passports",
  "Sealed packages",
];

export const RESTRICTED_CATEGORIES = [
  "Medicine & prescriptions",
  "Batteries (lithium, power banks)",
  "Liquids & alcohol",
  "Food & dairy",
  "Animals & plants",
  "Tobacco & vapes",
  "High-value luxury goods ($500+)",
];
