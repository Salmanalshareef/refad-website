import { requireAdmin } from "@/lib/auth";
import { getProfilesByRole } from "@/lib/data/members";
import { PromoteMemberForm } from "@/components/admin/PromoteMemberForm";
import { AdministratorRow } from "@/components/admin/AdministratorRow";
import { EmptyState } from "@/components/shared/EmptyState";

export default async function AdminAdministratorsPage() {
  const currentAdmin = await requireAdmin();
  const [admins, members] = await Promise.all([
    getProfilesByRole("admin").catch(() => null),
    getProfilesByRole("member").catch(() => []),
  ]);

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
        <h2 className="mb-3 text-sm font-semibold text-neutral-700">ترقية عضو إلى مسؤول</h2>
        <PromoteMemberForm members={members} />
      </div>

      <div className="space-y-3">
        {admins === null && (
          <EmptyState message="تعذر تحميل البيانات. تأكد من إعداد الاتصال بقاعدة البيانات." />
        )}
        {admins?.length === 0 && <EmptyState message="لا يوجد مسؤولون بعد." />}
        {admins?.map((profile) => (
          <AdministratorRow
            key={profile.id}
            profile={profile}
            isSelf={profile.id === currentAdmin.id}
          />
        ))}
      </div>
    </div>
  );
}
