import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { subscriptionStatusLabels, subscriptionStatusStyles } from "@/lib/labels/subscriptions";
import type { Subscription } from "@/types/db";

type Row = Subscription & { effective_status: Subscription["status"] };

function Receipt({ url }: { url: string | null }) {
  if (!url) return <span className="text-xs text-neutral-400">لا يوجد إيصال</span>;
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 text-xs font-medium text-primary-700 hover:underline"
    >
      <FileText className="h-3.5 w-3.5" />
      عرض الإيصال
    </a>
  );
}

function StatusBadge({ status }: { status: Subscription["status"] }) {
  return (
    <span
      className={cn(
        "rounded-full px-2.5 py-1 text-xs font-semibold",
        subscriptionStatusStyles[status]
      )}
    >
      {subscriptionStatusLabels[status]}
    </span>
  );
}

/**
 * Six columns need about 720px, so on a phone the table became a sideways
 * drag. Below sm the same rows are stacked as cards instead; from sm up the
 * table is unchanged, since scanning columns is the point of it.
 */
export function SubscriptionHistoryTable({ subscriptions }: { subscriptions: Row[] }) {
  return (
    <>
      <div className="space-y-3 sm:hidden">
        {subscriptions.map((sub) => (
          <div
            key={sub.id}
            className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <span dir="ltr" className="font-medium text-primary-900">
                {sub.subscription_number ? `#${sub.subscription_number}` : "—"}
              </span>
              <StatusBadge status={sub.effective_status} />
            </div>

            <dl className="mt-3 space-y-1.5 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-neutral-500">المبلغ</dt>
                <dd dir="ltr" className="text-neutral-800">{sub.amount} ر.س</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-neutral-500">تاريخ الطلب</dt>
                <dd dir="ltr" className="text-neutral-800">{sub.requested_date}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-neutral-500">تاريخ الانتهاء</dt>
                <dd dir="ltr" className="text-neutral-800">{sub.end_date ?? "—"}</dd>
              </div>
            </dl>

            <div className="mt-3 border-t border-neutral-100 pt-3">
              <Receipt url={sub.receipt_url} />
            </div>
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-2xl border border-neutral-200 bg-neutral-50 sm:block">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-xs text-neutral-500">
              <th className="px-4 py-3 text-start font-medium">رقم الاشتراك</th>
              <th className="px-4 py-3 text-start font-medium">تاريخ الطلب</th>
              <th className="px-4 py-3 text-start font-medium">المبلغ</th>
              <th className="px-4 py-3 text-start font-medium">الحالة</th>
              <th className="px-4 py-3 text-start font-medium">تاريخ الانتهاء</th>
              <th className="px-4 py-3 text-start font-medium">الإيصال</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((sub) => (
              <tr key={sub.id} className="border-b border-neutral-100 last:border-0">
                <td dir="ltr" className="px-4 py-3 text-primary-900">
                  {sub.subscription_number ? `#${sub.subscription_number}` : "—"}
                </td>
                <td className="px-4 py-3 text-neutral-700">{sub.requested_date}</td>
                <td dir="ltr" className="px-4 py-3 text-neutral-700">
                  {sub.amount} ر.س
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={sub.effective_status} />
                </td>
                <td dir="ltr" className="px-4 py-3 text-neutral-700">
                  {sub.end_date ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <Receipt url={sub.receipt_url} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
