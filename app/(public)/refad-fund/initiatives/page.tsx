import { PageHeader } from "@/components/shared/PageHeader";
import { Section } from "@/components/shared/Section";
import { Reveal } from "@/components/shared/Reveal";
import { FundSubNav } from "@/components/refad-fund/FundSubNav";
import { EmptyState } from "@/components/shared/EmptyState";
import { getPublishedInitiativeTypes } from "@/lib/data/initiative-types";
import { InitiativeIcon } from "@/components/shared/InitiativeIcon";

export default async function InitiativesPage() {
  const types = await getPublishedInitiativeTypes().catch(() => null);

  return (
    <>
      <PageHeader eyebrow="صندوق رفاد" title="المبادرات" />
      <FundSubNav />

      <Section>
        {types === null && (
          <EmptyState message="تعذر تحميل المبادرات. تأكد من إعداد الاتصال بقاعدة البيانات." />
        )}
        {types?.length === 0 && <EmptyState message="لم تتم إضافة مبادرات بعد." />}
        {types && types.length > 0 && (
          <div className="flex flex-wrap justify-center gap-6">
            {types.map((type, index) => (
              <Reveal
                key={type.id}
                delay={index * 100}
                className="w-full sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]"
              >
                <div className="group h-full rounded-2xl border border-neutral-200 bg-white p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary-50 text-primary-700 transition-transform duration-300 group-hover:scale-110">
                    <InitiativeIcon src={type.icon} size={72} />
                  </div>
                  <h3 className="text-lg font-bold text-primary-900">{type.title}</h3>
                  {type.description && (
                    <p className="mt-2 text-sm text-neutral-600">{type.description}</p>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
