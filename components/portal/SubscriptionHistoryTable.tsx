import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { subscriptionStatusLabels, subscriptionStatusStyles } from "@/lib/labels/subscriptions";
import type { Subscription } from "@/types/db";

export function SubscriptionHistoryTable({
  subscriptions,
}: {
  subscriptions: (Subscription & { effective_status: Subscription["status"] })[];
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
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
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-semibold",
                    subscriptionStatusStyles[sub.effective_status]
                  )}
                >
                  {subscriptionStatusLabels[sub.effective_status]}
                </span>
              </td>
              <td dir="ltr" className="px-4 py-3 text-neutral-700">
                {sub.end_date ?? "—"}
              </td>
              <td className="px-4 py-3">
                {sub.receipt_url ? (
                  <a
                    href={sub.receipt_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-primary-700 hover:underline"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    عرض الإيصال
                  </a>
                ) : (
                  <span className="text-xs text-neutral-400">لا يوجد إيصال</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
