import Link from "next/link";
import { Plus } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import {
  getMyMemberRequests,
  memberRequestStatusLabels,
  memberRequestStatusStyles,
  memberRequestTypeLabels,
} from "@/lib/data/member-requests";
import { EmptyState } from "@/components/shared/EmptyState";
import type { MemberRequest } from "@/types/db";

function requestSummary(request: MemberRequest) {
  // Requests carry a snapshot of their answers; `details` only holds anything
  // for rows created before request types became configurable.
  if (request.answers.length > 0) {
    return request.answers.map((answer) => answer.value).join(" — ");
  }
  return request.details ?? "—";
}

export default async function MemberRequestsPage() {
  const profile = await requireProfile();
  const myRequests = await getMyMemberRequests(profile.id).catch(() => null);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-900">طلباتي</h1>
          <p className="mt-1 text-sm text-neutral-600">
            أرسل طلبًا للإدارة — إضافة خبر، إضافة فرد للعائلة غير مسجل، أو أي طلب آخر.
          </p>
        </div>
        <Link
          href="/portal/requests/new"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-hover"
        >
          <Plus className="h-4 w-4" />
          طلب جديد
        </Link>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-bold text-primary-900">طلباتي السابقة</h2>
        {myRequests === null && <EmptyState message="تعذر تحميل طلباتك السابقة." />}
        {myRequests?.length === 0 && <EmptyState message="لم تقم بإرسال أي طلبات بعد." />}
        {myRequests && myRequests.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-neutral-50">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 text-xs text-neutral-500">
                <tr>
                  <th className="px-4 py-3 text-start font-semibold">نوع الطلب</th>
                  <th className="px-4 py-3 text-start font-semibold">التفاصيل</th>
                  <th className="px-4 py-3 text-start font-semibold">تاريخ الطلب</th>
                  <th className="px-4 py-3 text-start font-semibold">الحالة</th>
                  <th className="px-4 py-3 text-start font-semibold">ملاحظات الإدارة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {myRequests.map((request) => (
                  <tr key={request.id}>
                    <td className="px-4 py-3 font-medium text-primary-900">
                      {request.type_title ?? memberRequestTypeLabels[request.type]}
                    </td>
                    <td className="px-4 py-3 text-neutral-700">{requestSummary(request)}</td>
                    <td dir="ltr" className="px-4 py-3 text-start text-neutral-600">
                      {request.created_at.slice(0, 10)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${memberRequestStatusStyles[request.status]}`}
                      >
                        {memberRequestStatusLabels[request.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-600">{request.admin_comment ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
