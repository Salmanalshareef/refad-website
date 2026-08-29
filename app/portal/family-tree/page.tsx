import { buildFamilyTree, getFamilyMembers } from "@/lib/data/family-tree";
import { FamilyTreeView } from "@/components/family-tree/FamilyTreeView";
import { EmptyState } from "@/components/shared/EmptyState";

export default async function FamilyTreePage() {
  const members = await getFamilyMembers().catch(() => null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary-900">شجرة الأسرة</h1>
        <p className="mt-1 text-sm text-neutral-600">
          استعرض فروع الأسرة وانقر على أي فرد لعرض تفاصيله.
        </p>
      </div>

      {members === null ? (
        <EmptyState message="تعذر تحميل شجرة الأسرة. تأكد من إعداد الاتصال بقاعدة البيانات." />
      ) : (
        <FamilyTreeView data={buildFamilyTree(members)} />
      )}
    </div>
  );
}
