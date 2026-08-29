import { getProfilesByRole } from "@/lib/data/members";
import { MemberForm } from "@/components/admin/MemberForm";
import { MemberList } from "@/components/admin/MemberList";
import { EmptyState } from "@/components/shared/EmptyState";

export default async function AdminMembersPage() {
  const profiles = await getProfilesByRole("member").catch(() => null);

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-neutral-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold text-neutral-700">إنشاء حساب عضو جديد</h2>
        <MemberForm />
      </div>

      {profiles === null ? (
        <EmptyState message="تعذر تحميل البيانات. تأكد من إعداد الاتصال بقاعدة البيانات." />
      ) : (
        <MemberList profiles={profiles} />
      )}
    </div>
  );
}
