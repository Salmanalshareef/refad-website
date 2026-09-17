import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarDays, ClipboardList, Plus, Target, Users } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { getPublishedInitiativeTypeById } from "@/lib/data/initiative-types";
import { getPublishedInitiativeById } from "@/lib/data/initiatives";
import { formatInitiativeDate } from "@/lib/initiative-date";
import { InitiativeIcon } from "@/components/shared/InitiativeIcon";
import { InitiativeDateValue } from "@/components/shared/InitiativeDateValue";

function DetailRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3 border-t border-neutral-100 py-4 first:border-t-0 first:pt-0">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-neutral-500">{label}</p>
        <div className="mt-1 text-sm leading-relaxed text-neutral-800">{children}</div>
      </div>
    </div>
  );
}

export default async function InitiativeDetailPage({
  params,
}: {
  params: Promise<{ typeId: string; initiativeId: string }>;
}) {
  await requireProfile();
  const { typeId, initiativeId } = await params;

  const [type, initiative] = await Promise.all([
    getPublishedInitiativeTypeById(typeId).catch(() => null),
    getPublishedInitiativeById(initiativeId).catch(() => null),
  ]);

  // Guard against an initiative id pasted under the wrong type, which would
  // otherwise render a page whose breadcrumb contradicts its content.
  if (!type || !initiative || initiative.initiative_type_id !== type.id) notFound();

  const date = formatInitiativeDate(initiative);
  const canRequest = type.is_requestable && initiative.is_requestable;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href={`/portal/services/${type.id}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary-700 hover:underline"
        >
          <ArrowRight className="h-4 w-4" />
          العودة إلى {type.title}
        </Link>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-start">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-700">
            <InitiativeIcon src={initiative.icon} size={88} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gold-600">{type.title}</p>
            <h1 className="mt-1 text-2xl font-bold text-primary-900">{initiative.title}</h1>
            <p className="mt-3 leading-relaxed text-neutral-700">{initiative.description}</p>
          </div>
        </div>

        <div className="mt-6 border-t border-neutral-100 pt-6">
          {date && (
            <DetailRow icon={<CalendarDays className="h-4 w-4" />} label={date.label}>
              <InitiativeDateValue date={date} />
            </DetailRow>
          )}

          {initiative.age_group && (
            <DetailRow icon={<Users className="h-4 w-4" />} label="الفئة العمرية">
              {initiative.age_group}
            </DetailRow>
          )}

          {initiative.target_audience && (
            <DetailRow icon={<Target className="h-4 w-4" />} label="الفئة المستهدفة">
              {initiative.target_audience}
            </DetailRow>
          )}

          {initiative.requirements && (
            <DetailRow icon={<ClipboardList className="h-4 w-4" />} label="المتطلبات">
              <p className="whitespace-pre-line">{initiative.requirements}</p>
            </DetailRow>
          )}
        </div>

        {canRequest && (
          <div className="mt-6 border-t border-neutral-100 pt-6">
            <Link
              href={`/portal/services/new-request?initiative=${initiative.id}`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700"
            >
              <Plus className="h-4 w-4" />
              تقديم طلب
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
