import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function IosListGroup({
  header,
  footer,
  children,
  className,
}: {
  header?: string;
  footer?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("mb-7", className)}>
      {header && (
        <div className="mb-1.5 px-4 text-[13px] uppercase tracking-[0.06em] text-[hsl(var(--ios-label-secondary))]">
          {header}
        </div>
      )}
      <div className="ios-group">{children}</div>
      {footer && (
        <div className="mt-1.5 px-4 text-[13px] text-[hsl(var(--ios-label-secondary))]">
          {footer}
        </div>
      )}
    </section>
  );
}

interface RowProps {
  leading?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  detail?: React.ReactNode;
  trailing?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  destructive?: boolean;
  className?: string;
  hideChevron?: boolean;
}

export function IosListRow({
  leading,
  title,
  subtitle,
  detail,
  trailing,
  href,
  onClick,
  destructive,
  className,
  hideChevron,
}: RowProps) {
  const inner = (
    <>
      {leading && <div className="shrink-0">{leading}</div>}
      <div className="min-w-0 flex-1">
        <div
          className={cn(
            "truncate text-[17px] -tracking-[0.013em]",
            destructive ? "text-red-600" : "text-foreground",
          )}
        >
          {title}
        </div>
        {subtitle && (
          <div className="truncate text-[13px] text-[hsl(var(--ios-label-secondary))]">
            {subtitle}
          </div>
        )}
      </div>
      {detail && (
        <div className="shrink-0 text-[15px] text-[hsl(var(--ios-label-secondary))]">
          {detail}
        </div>
      )}
      {trailing}
      {href && !hideChevron && (
        <ChevronRight className="h-4 w-4 shrink-0 text-[hsl(var(--ios-label-tertiary))]" />
      )}
    </>
  );

  const cls = cn("ios-row", (href || onClick) && "ios-row-link", className);

  if (href) return <Link href={href} className={cls}>{inner}</Link>;
  if (onClick) return <button type="button" onClick={onClick} className={cn(cls, "w-full text-left")}>{inner}</button>;
  return <div className={cls}>{inner}</div>;
}
