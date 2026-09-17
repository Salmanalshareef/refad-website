import type { Initiative } from "@/types/db";

export type InitiativeDateDisplay =
  | { kind: "single"; label: string; value: string }
  | { kind: "range"; label: string; from: string; to: string };

/**
 * An initiative carries either one specific date (`single`) or an application
 * window (`period`). Rows created before those fields existed are `period` with
 * only an `end_date`, which still means "applications close on this day".
 */
export function formatInitiativeDate(
  initiative: Pick<Initiative, "date_mode" | "start_date" | "end_date">
): InitiativeDateDisplay | null {
  const { date_mode, start_date, end_date } = initiative;

  if (date_mode === "single") {
    return start_date
      ? { kind: "single", label: "تاريخ المبادرة", value: start_date }
      : null;
  }

  if (start_date && end_date) {
    return { kind: "range", label: "فترة التقديم", from: start_date, to: end_date };
  }
  if (end_date) return { kind: "single", label: "آخر موعد للتقديم", value: end_date };
  if (start_date) return { kind: "single", label: "التقديم يبدأ من", value: start_date };
  return null;
}
