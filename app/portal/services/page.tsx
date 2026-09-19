import Link from "next/link";
import { ListChecks } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { getPublishedInitiativeTypes } from "@/lib/data/initiative-types";
import { EmptyState } from "@/components/shared/EmptyState";
import { InitiativeIcon } from "@/components/shared/InitiativeIcon";
import { Reveal } from "@/components/shared/Reveal";

const cardWidth = "w-full sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]";

export default async function ServicesPage() {
  await requireProfile();
  const types = await getPublishedInitiativeTypes().catch(() => null);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-900">المبادرات</h1>
          <p className="mt-1 text-sm text-neutral-600">
            اختر مبادرة للاطلاع على خدماتها وتفاصيلها.
          </p>
        </div>
        <Link
          href="/portal/services/requests"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm font-medium text-primary-700 shadow-sm transition-colors hover:bg-primary-50"
        >
          <ListChecks className="h-4 w-4" />
          طلباتي السابقة
        </Link>
      </div>

      {types === null ? (
        <EmptyState message="تعذر تحميل المبادرات. تأكد من إعداد الاتصال بقاعدة البيانات." />
      ) : types.length === 0 ? (
        <EmptyState message="لا توجد مبادرات متاحة حاليًا." />
      ) : (
        <div className="flex flex-wrap justify-center gap-6">
          {types.map((type, index) => (
            <Reveal key={type.id} delay={index * 100} className={cardWidth}>
              <Link
                href={`/portal/services/${type.id}`}
                className="flex h-full flex-col items-center rounded-2xl border border-neutral-200 bg-neutral-50 p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary-300 hover:shadow-lg"
              >
                <div className="image-plate mb-4 flex h-20 w-20 items-center justify-center rounded-full">
                  <InitiativeIcon src={type.icon} size={72} />
                </div>
                <h2 className="text-lg font-bold text-primary-900">{type.title}</h2>
                {type.description && (
                  <p className="mt-2 text-sm text-neutral-600">{type.description}</p>
                )}
              </Link>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
