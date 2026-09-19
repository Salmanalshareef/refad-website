import { getFamilyMembers } from "@/lib/data/family-tree";
import { getAllProfiles } from "@/lib/data/members";
import { FamilyMemberForm } from "@/components/admin/FamilyMemberForm";
import { FamilyMemberList } from "@/components/admin/FamilyMemberList";
import { EmptyState } from "@/components/shared/EmptyState";

export default async function AdminFamilyMembersPage() {
  const [members, profiles] = await Promise.all([
    getFamilyMembers().catch(() => null),
    getAllProfiles().catch(() => []),
  ]);

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
        <h2 className="mb-3 text-sm font-semibold text-neutral-700">إضافة فرد جديد</h2>
        <FamilyMemberForm allMembers={members ?? []} profiles={profiles} />
      </div>

      {members === null ? (
        <EmptyState message="تعذر تحميل البيانات. تأكد من إعداد الاتصال بقاعدة البيانات." />
      ) : (
        <FamilyMemberList members={members} profiles={profiles} />
      )}
    </div>
  );
}
