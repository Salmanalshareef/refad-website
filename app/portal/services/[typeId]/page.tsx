import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarDays, ChevronLeft, Target, Users } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { getPublishedInitiativeTypeById } from "@/lib/data/initiative-types";
import { getPublishedInitiativesByType } from "@/lib/data/initiatives";
import { formatInitiativeDate } from "@/lib/initiative-date";
import { InitiativeDateValue } from "@/components/shared/InitiativeDateValue";
import { EmptyState } from "@/components/shared/EmptyState";
import { InitiativeIcon } from "@/components/shared/InitiativeIcon";
import { Reveal } from "@/components/shared/Reveal";

export default async function InitiativeTypePage({
  params,
}: {
  params: Promise<{ typeId: string }>;
}) {
  await requireProfile();
  const { typeId } = await params;

  const type = await getPublishedInitiativeTypeById(typeId).catch(() => null);
  if (!type) notFound();

  const initiatives = await getPublishedInitiativesByType(typeId).catch(() => []);

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/portal/services"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary-700 hover:underline"
        >
          <ArrowRight className="h-4 w-4" />
          العودة إلى المبادرات
        </Link>

        <div className="mt-4 flex items-center gap-4">
          <div className="image-plate flex h-20 w-20 shrink-0 items-center justify-center rounded-full">
            <InitiativeIcon src={type.icon} size={72} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-primary-900">{type.title}</h1>
            {type.description && (
              <p className="mt-1 text-sm text-neutral-600">{type.description}</p>
            )}
          </div>
        </div>
      </div>

      {initiatives.length === 0 ? (
        <EmptyState message="لا توجد خدمات متاحة تحت هذه المبادرة حاليًا." />
      ) : (
        <div className="space-y-4">
          {initiatives.map((initiative, index) => {
            const date = formatInitiativeDate(initiative);
            return (
              <Reveal key={initiative.id} delay={index * 75}>
                <Link
                  href={`/portal/services/${type.id}/${initiative.id}`}
                  className="flex items-center gap-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-lg sm:gap-5 sm:p-6"
                >
                  <div className="image-plate flex h-16 w-16 shrink-0 items-center justify-center rounded-full sm:h-20 sm:w-20">
                    <InitiativeIcon src={initiative.icon} size={56} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg font-bold text-primary-900">{initiative.title}</h2>
                    <p className="mt-1 line-clamp-2 text-sm text-neutral-600">
                      {initiative.description}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500">
                      {date && (
                        <span className="flex items-center gap-1.5 font-medium text-gold-700">
                          <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                          {date.label}: <InitiativeDateValue date={date} />
                        </span>
                      )}
                      {initiative.age_group && (
                        <span className="flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5 shrink-0" />
                          {initiative.age_group}
                        </span>
                      )}
                      {initiative.target_audience && (
                        <span className="flex items-center gap-1.5">
                          <Target className="h-3.5 w-3.5 shrink-0" />
                          {initiative.target_audience}
                        </span>
                      )}
                    </div>
                  </div>

                  <ChevronLeft className="hidden h-5 w-5 shrink-0 text-neutral-300 sm:block" />
                </Link>
              </Reveal>
            );
          })}
        </div>
      )}
    </div>
  );
}
