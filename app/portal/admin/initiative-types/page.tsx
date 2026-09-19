import { getInitiativeTypes } from "@/lib/data/initiative-types";
import { getInitiatives } from "@/lib/data/initiatives";
import { InitiativeTypeForm } from "@/components/admin/InitiativeTypeForm";
import { InitiativeTypeRow } from "@/components/admin/InitiativeTypeRow";
import { EmptyState } from "@/components/shared/EmptyState";

export default async function AdminInitiativeTypesPage() {
  const [types, initiatives] = await Promise.all([
    getInitiativeTypes().catch(() => null),
    getInitiatives().catch(() => []),
  ]);

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
        <h2 className="mb-3 text-sm font-semibold text-neutral-700">إضافة نوع مبادرة جديد</h2>
        <InitiativeTypeForm />
      </div>

      <div className="space-y-3">
        {types === null && (
          <EmptyState message="تعذر تحميل البيانات. تأكد من إعداد الاتصال بقاعدة البيانات." />
        )}
        {types?.length === 0 && <EmptyState message="لا توجد أنواع مبادرات بعد." />}
        {types?.map((type) => (
          <InitiativeTypeRow
            key={type.id}
            type={type}
            subServiceCount={
              initiatives.filter((i) => i.initiative_type_id === type.id).length
            }
          />
        ))}
      </div>
    </div>
  );
}
