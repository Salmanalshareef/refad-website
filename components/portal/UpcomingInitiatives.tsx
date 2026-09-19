import Link from "next/link";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { InitiativeIcon } from "@/components/shared/InitiativeIcon";
import { InitiativeDateValue } from "@/components/shared/InitiativeDateValue";
import { formatInitiativeDate } from "@/lib/initiative-date";
import { EmptyState } from "@/components/shared/EmptyState";
import { cn } from "@/lib/utils";
import type { UpcomingInitiative } from "@/types/db";

/**
 * Days between today and a date, both read at day precision so a few hours
 * either side of midnight cannot make "today" read as yesterday.
 */
function daysUntil(date: string) {
  const target = new Date(`${date.slice(0, 10)}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

function urgencyLabel(days: number, isDeadline: boolean) {
  if (days <= 0) return isDeadline ? "آخر يوم للتقديم" : "اليوم";
  if (days === 1) return isDeadline ? "يغلق غدًا" : "غدًا";
  if (days <= 7) {
    return isDeadline ? `يغلق خلال ${days} أيام` : `بعد ${days} أيام`;
  }
  return isDeadline ? `يغلق خلال ${days} يومًا` : `بعد ${days} يومًا`;
}

export function UpcomingInitiatives({ initiatives }: { initiatives: UpcomingInitiative[] }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-bold text-primary-900">المبادرات القادمة</h2>
        <Link
          href="/portal/services"
          className="inline-flex items-center gap-1 text-xs font-medium text-primary-700 hover:underline"
        >
          كل المبادرات
          <ArrowLeft className="h-3.5 w-3.5" />
        </Link>
      </div>

      {initiatives.length === 0 ? (
        <EmptyState message="لا توجد مبادرات بمواعيد قادمة حاليًا." />
      ) : (
        <div className="space-y-3">
          {initiatives.map((initiative) => {
            const date = formatInitiativeDate(initiative);
            const days = daysUntil(initiative.relevant_date);
            const isDeadline = initiative.date_mode === "period";
            const urgent = days <= 7;

            return (
              <Link
                key={initiative.id}
                href={`/portal/services/${initiative.initiative_type_id}/${initiative.id}`}
                className="flex items-center gap-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-sm"
              >
                <span className="image-plate flex h-12 w-12 shrink-0 items-center justify-center rounded-full">
                  <InitiativeIcon src={initiative.icon} size={30} />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-gold-600">
                    {initiative.type_title}
                  </p>
                  <p className="font-medium text-primary-900">{initiative.title}</p>
                  {date && (
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-neutral-500">
                      <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                      <InitiativeDateValue date={date} />
                    </p>
                  )}
                </div>

                <span
                  className={cn(
                    "shrink-0 rounded-full px-3 py-1 text-xs font-semibold",
                    urgent
                      ? "bg-gold-100 text-gold-600"
                      : "bg-primary-50 text-primary-700"
                  )}
                >
                  {urgencyLabel(days, isDeadline)}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
