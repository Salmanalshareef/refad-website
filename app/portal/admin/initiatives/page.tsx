import { getInitiativeTypes } from "@/lib/data/initiative-types";
import { getInitiatives } from "@/lib/data/initiatives";
import { InitiativeForm } from "@/components/admin/InitiativeForm";
import { InitiativeRow } from "@/components/admin/InitiativeRow";
import { EmptyState } from "@/components/shared/EmptyState";

export default async function AdminInitiativesPage() {
  const [types, initiatives] = await Promise.all([
    getInitiativeTypes().catch(() => null),
    getInitiatives().catch(() => null),
  ]);

  const typeNameById = new Map((types ?? []).map((t) => [t.id, t.title]));

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-neutral-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold text-neutral-700">إضافة خدمة فرعية جديدة</h2>
        <InitiativeForm types={types ?? []} />
      </div>

      <div className="space-y-8">
        {(types === null || initiatives === null) && (
          <EmptyState message="تعذر تحميل البيانات. تأكد من إعداد الاتصال بقاعدة البيانات." />
        )}
        {types?.length === 0 && (
          <EmptyState message="لا توجد أنواع مبادرات بعد — أضف نوعًا أولًا من صفحة أنواع المبادرات." />
        )}
        {types && initiatives && types.length > 0 && (
          <>
            {types.map((type) => {
              const items = initiatives.filter((i) => i.initiative_type_id === type.id);
              return (
                <div key={type.id}>
                  <h3 className="mb-3 text-sm font-semibold text-neutral-700">{type.title}</h3>
                  <div className="space-y-3">
                    {items.length === 0 && (
                      <EmptyState message="لا توجد خدمات فرعية تحت هذا النوع بعد." />
                    )}
                    {items.map((initiative) => (
                      <InitiativeRow
                        key={initiative.id}
                        initiative={initiative}
                        types={types}
                        typeName={typeNameById.get(initiative.initiative_type_id) ?? ""}
                        typeIsRequestable={type.is_requestable}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
