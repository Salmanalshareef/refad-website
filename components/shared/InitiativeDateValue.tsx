import { cn } from "@/lib/utils";
import type { InitiativeDateDisplay } from "@/lib/initiative-date";

/**
 * Renders an initiative's date inside the page's RTL flow. Each date keeps
 * `dir="ltr"` so its digits read correctly, while a range stays in reading
 * order — start first (rightmost), then end.
 */
export function InitiativeDateValue({
  date,
  className,
}: {
  date: InitiativeDateDisplay;
  className?: string;
}) {
  if (date.kind === "single") {
    return (
      <span dir="ltr" className={cn("inline-block", className)}>
        {date.value}
      </span>
    );
  }

  return (
    <span className={cn("inline-flex flex-wrap items-center gap-1", className)}>
      <span>من</span>
      <span dir="ltr" className="inline-block">
        {date.from}
      </span>
      <span>إلى</span>
      <span dir="ltr" className="inline-block">
        {date.to}
      </span>
    </span>
  );
}
