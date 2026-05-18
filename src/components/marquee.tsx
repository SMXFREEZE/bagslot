import { cn } from "@/lib/utils";

export function Marquee({
  items,
  speed = "normal",
  className,
}: {
  items: React.ReactNode[];
  speed?: "normal" | "slow";
  className?: string;
}) {
  // Duplicate the list so the animation loops seamlessly.
  const doubled = [...items, ...items];
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent" />
      <div className={cn("flex w-max gap-3", speed === "slow" ? "animate-marquee-slow" : "animate-marquee")}>
        {doubled.map((item, i) => (
          <div key={i} className="shrink-0">{item}</div>
        ))}
      </div>
    </div>
  );
}
