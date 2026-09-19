import { getReports } from "@/lib/data/reports";
import { ReportForm } from "@/components/admin/ReportForm";
import { ReportRow } from "@/components/admin/ReportRow";
import { EmptyState } from "@/components/shared/EmptyState";

export default async function AdminReportsPage() {
  const reports = await getReports().catch(() => null);

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
        <h2 className="mb-3 text-sm font-semibold text-neutral-700">رفع تقرير جديد</h2>
        <ReportForm />
      </div>

      <div className="space-y-3">
        {reports === null && (
          <EmptyState message="تعذر تحميل البيانات. تأكد من إعداد الاتصال بقاعدة البيانات." />
        )}
        {reports?.length === 0 && <EmptyState message="لا توجد تقارير بعد." />}
        {reports?.map((report) => (
          <ReportRow key={report.id} report={report} />
        ))}
      </div>
    </div>
  );
}
