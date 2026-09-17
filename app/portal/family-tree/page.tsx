import { requireProfile } from "@/lib/auth";
import {
  buildFamilyTree,
  findSelfFamilyMemberId,
  getFamilyMembers,
} from "@/lib/data/family-tree";
import { FamilyTreeView } from "@/components/family-tree/FamilyTreeView";
import { EmptyState } from "@/components/shared/EmptyState";

export default async function FamilyTreePage() {
  const profile = await requireProfile();
  const members = await getFamilyMembers().catch(() => null);
  const selfNodeId = await findSelfFamilyMemberId(profile).catch(() => null);
  const livingCount = members?.filter((m) => m.is_living).length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-900">شجرة الأسرة</h1>
          <p className="mt-1 text-sm text-neutral-600">
            استعرض فروع الأسرة وانقر على أي فرد لعرض تفاصيله.
          </p>
        </div>
        {members !== null && (
          <div className="shrink-0 rounded-xl border border-primary-200 bg-primary-50 px-5 py-3 text-center">
            <p className="text-2xl font-extrabold text-primary-900">{livingCount}</p>
            <p className="text-xs font-medium text-primary-700">عدد أفراد الأسرة</p>
          </div>
        )}
      </div>

      {members === null ? (
        <EmptyState message="تعذر تحميل شجرة الأسرة. تأكد من إعداد الاتصال بقاعدة البيانات." />
      ) : (
        <FamilyTreeView data={buildFamilyTree(members)} selfNodeId={selfNodeId} />
      )}
    </div>
  );
}
