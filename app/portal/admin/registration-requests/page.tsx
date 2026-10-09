import { getRegistrationRequests } from "@/lib/data/registration-requests";
import { getAccountDeletionRequests } from "@/lib/data/account-deletion-requests";
import { RegistrationRequestRow } from "@/components/admin/RegistrationRequestRow";
import { AccountDeletionRequestRow } from "@/components/admin/AccountDeletionRequestRow";
import { EmptyState } from "@/components/shared/EmptyState";

export default async function AdminRegistrationRequestsPage() {
  const [requests, deletions] = await Promise.all([
    getRegistrationRequests().catch(() => null),
    getAccountDeletionRequests().catch(() => []),
  ]);

  const pendingDeletions = deletions.filter((d) => d.status === "pending").length;

  return (
    <div className="space-y-8">
      {/* Closures are shown above registrations and only when any exist: they
          are rarer, time-sensitive, and call for the opposite action, so they
          should not be scrolled past among new sign-ups. */}
      {deletions.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-neutral-700">طلبات حذف الحسابات</h2>
            {pendingDeletions > 0 && (
              <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">
                {pendingDeletions} قيد المراجعة
              </span>
            )}
          </div>
          {deletions.map((request) => (
            <AccountDeletionRequestRow key={request.id} request={request} />
          ))}
        </section>
      )}

      <section className="space-y-3">
        {deletions.length > 0 && (
          <h2 className="text-sm font-semibold text-neutral-700">طلبات التسجيل</h2>
        )}
        {requests === null && (
          <EmptyState message="تعذر تحميل الطلبات. تأكد من إعداد الاتصال بقاعدة البيانات." />
        )}
        {requests?.length === 0 && <EmptyState message="لا توجد طلبات تسجيل بعد." />}
        {requests?.map((request) => (
          <RegistrationRequestRow key={request.id} request={request} />
        ))}
      </section>
    </div>
  );
}
