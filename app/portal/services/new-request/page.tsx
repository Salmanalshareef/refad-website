import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { getInitiativeTypes } from "@/lib/data/initiative-types";
import { getInitiatives } from "@/lib/data/initiatives";
import { NewRequestForm } from "@/components/portal/NewRequestForm";

export default async function NewRequestPage() {
  const profile = await requireProfile();
  const [types, initiatives] = await Promise.all([
    getInitiativeTypes().catch(() => []),
    getInitiatives().catch(() => []),
  ]);

  const requestableTypes = types.filter((t) => t.is_requestable);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href="/portal/services"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary-700 hover:underline"
        >
          <ArrowRight className="h-4 w-4" />
          العودة إلى المبادرات
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-primary-900">طلب جديد</h1>
      </div>

      <NewRequestForm profile={profile} types={requestableTypes} initiatives={initiatives} />
    </div>
  );
}
