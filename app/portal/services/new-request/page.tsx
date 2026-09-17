import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { getPublishedInitiativeTypeById } from "@/lib/data/initiative-types";
import { getPublishedInitiativeById } from "@/lib/data/initiatives";
import { NewRequestForm } from "@/components/portal/NewRequestForm";
import { EmptyState } from "@/components/shared/EmptyState";

export default async function NewRequestPage({
  searchParams,
}: {
  searchParams: Promise<{ initiative?: string }>;
}) {
  const profile = await requireProfile();
  const { initiative: initiativeId } = await searchParams;

  const initiative = initiativeId
    ? await getPublishedInitiativeById(initiativeId).catch(() => null)
    : null;
  const type = initiative
    ? await getPublishedInitiativeTypeById(initiative.initiative_type_id).catch(() => null)
    : null;

  // A request is always tied to one initiative, reached from that initiative's
  // page. Requestability is re-checked here so a stale or hand-typed link
  // can't open a form for something that is closed to requests.
  const canRequest = Boolean(
    initiative && type && initiative.is_requestable && type.is_requestable
  );

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href={
            initiative && type
              ? `/portal/services/${type.id}/${initiative.id}`
              : "/portal/services"
          }
          className="inline-flex items-center gap-1 text-sm font-medium text-primary-700 hover:underline"
        >
          <ArrowRight className="h-4 w-4" />
          {initiative ? "العودة إلى الخدمة" : "العودة إلى المبادرات"}
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-primary-900">طلب جديد</h1>
      </div>

      {canRequest && initiative && type ? (
        <NewRequestForm profile={profile} type={type} initiative={initiative} />
      ) : (
        <div className="space-y-4">
          <EmptyState message="اختر الخدمة التي ترغب بتقديم طلب لها من صفحة المبادرات." />
          <div className="text-center">
            <Link
              href="/portal/services"
              className="text-sm font-medium text-primary-700 hover:underline"
            >
              تصفّح المبادرات
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
