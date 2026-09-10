import Link from "next/link";
import { ListChecks, Plus } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { getInitiativeTypes } from "@/lib/data/initiative-types";
import { getInitiatives } from "@/lib/data/initiatives";
import { InitiativesBrowser } from "@/components/portal/InitiativesBrowser";

export default async function ServicesPage() {
  await requireProfile();
  const [types, initiatives] = await Promise.all([
    getInitiativeTypes().catch(() => []),
    getInitiatives().catch(() => []),
  ]);

  const publishedTypes = types.filter((t) => t.is_published);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-900">المبادرات</h1>
          <p className="mt-1 text-sm text-neutral-600">
            اختر مبادرة، ثم خدمة فرعية منها لتقديم طلب دعم.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/portal/services/requests"
            className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-primary-700 shadow-sm transition-colors hover:bg-primary-50"
          >
            <ListChecks className="h-4 w-4" />
            طلباتي السابقة
          </Link>
          <Link
            href="/portal/services/new-request"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700"
          >
            <Plus className="h-4 w-4" />
            طلب جديد
          </Link>
        </div>
      </div>

      <InitiativesBrowser types={publishedTypes} initiatives={initiatives} />
    </div>
  );
}
