import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { getInitiatives } from "@/lib/data/initiatives";
import {
  getMySupportRequests,
  supportRequestStatusLabels,
  supportRequestStatusStyles,
} from "@/lib/data/support-requests";
import { EmptyState } from "@/components/shared/EmptyState";

export default async function MySupportRequestsPage() {
  const profile = await requireProfile();
  const [myRequests, initiatives] = await Promise.all([
    getMySupportRequests(profile.id).catch(() => null),
    getInitiatives().catch(() => []),
  ]);

  const initiativeTitleById = new Map(initiatives.map((i) => [i.id, i.title]));

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/portal/services"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary-700 hover:underline"
        >
          <ArrowRight className="h-4 w-4" />
          العودة إلى المبادرات
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-primary-900">طلباتي السابقة</h1>
      </div>

      {myRequests === null && <EmptyState message="تعذر تحميل طلباتك السابقة." />}
      {myRequests?.length === 0 && <EmptyState message="لم تقم بتقديم أي طلبات بعد." />}
      {myRequests && myRequests.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-xs text-neutral-500">
              <tr>
                <th className="px-4 py-3 text-start font-semibold">رقم الطلب</th>
                <th className="px-4 py-3 text-start font-semibold">الخدمة الفرعية</th>
                <th className="px-4 py-3 text-start font-semibold">تاريخ الطلب</th>
                <th className="px-4 py-3 text-start font-semibold">الحالة</th>
                <th className="px-4 py-3 text-start font-semibold">ملاحظات الإدارة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {myRequests.map((request) => (
                <tr key={request.id}>
                  <td dir="ltr" className="px-4 py-3 text-start font-medium text-primary-900">
                    #{request.request_number}
                  </td>
                  <td className="px-4 py-3 text-neutral-800">
                    {(request.initiative_id && initiativeTitleById.get(request.initiative_id)) ??
                      "خدمة"}
                  </td>
                  <td dir="ltr" className="px-4 py-3 text-start text-neutral-600">
                    {request.created_at.slice(0, 10)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${supportRequestStatusStyles[request.status]}`}
                    >
                      {supportRequestStatusLabels[request.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    {request.admin_comment ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
