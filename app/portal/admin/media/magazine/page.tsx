import { getMagazineIssues } from "@/lib/data/magazine";
import { MagazineIssueForm } from "@/components/admin/MagazineIssueForm";
import { MagazineIssueRow } from "@/components/admin/MagazineIssueRow";
import { EmptyState } from "@/components/shared/EmptyState";

export default async function AdminMagazinePage() {
  const issues = await getMagazineIssues().catch(() => null);

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
        <h2 className="mb-3 text-sm font-semibold text-neutral-700">رفع عدد جديد</h2>
        <MagazineIssueForm />
      </div>

      <div className="space-y-3">
        {issues === null && (
          <EmptyState message="تعذر تحميل البيانات. تأكد من إعداد الاتصال بقاعدة البيانات." />
        )}
        {issues?.length === 0 && <EmptyState message="لا توجد أعداد بعد." />}
        {issues?.map((issue) => (
          <MagazineIssueRow key={issue.id} issue={issue} />
        ))}
      </div>
    </div>
  );
}
