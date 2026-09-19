import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { getPublishedMemberRequestTypes } from "@/lib/data/member-request-types";
import { MemberRequestForm } from "@/components/portal/MemberRequestForm";

export default async function NewMemberRequestPage() {
  const profile = await requireProfile();
  const types = await getPublishedMemberRequestTypes().catch(() => []);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href="/portal/requests"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary-700 hover:underline"
        >
          <ArrowRight className="h-4 w-4" />
          العودة إلى طلباتي
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-primary-900">طلب جديد</h1>
      </div>

      <MemberRequestForm
        applicantFullName={profile.full_name}
        memberNumber={profile.member_number}
        types={types}
      />
    </div>
  );
}
