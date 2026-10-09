import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { Section } from "@/components/shared/Section";
import { Reveal } from "@/components/shared/Reveal";
import { FundSubNav } from "@/components/refad-fund/FundSubNav";
import { EmptyState } from "@/components/shared/EmptyState";
import { getReports, reportTypeLabels } from "@/lib/data/reports";
import type { ReportType } from "@/types/db";
import { Download, FileText } from "lucide-react";

const reportTypes: ReportType[] = ["financial", "performance", "minutes"];

// Safety net under the explicit revalidatePath calls in the admin actions:
// a path one of them forgets self-heals within five minutes, rather than
// serving the stale build until the next deploy.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "التقارير",
  description: "التقارير المالية وتقارير الأداء ومحاضر الاجتماعات.",
};

export default async function ReportsPage() {
  const reports = await getReports().catch(() => null);

  return (
    <>
      <PageHeader eyebrow="صندوق رفاد" title="التقارير" />
      <FundSubNav />

      <Section>
        {reports === null && (
          <EmptyState message="تعذر تحميل التقارير. تأكد من إعداد الاتصال بقاعدة البيانات." />
        )}
        {reports?.length === 0 && (
          <EmptyState message="لم يتم نشر تقارير بعد." />
        )}
        {reports && reports.length > 0 && (
          <div className="space-y-10">
            {reportTypes.map((type, groupIndex) => {
              const items = reports.filter((r) => r.type === type);
              if (items.length === 0) return null;

              return (
                <Reveal key={type} delay={groupIndex * 100}>
                  <div>
                    <h2 className="mb-4 text-xl font-bold text-primary-900">
                      {reportTypeLabels[type]}
                    </h2>
                    <div className="space-y-3">
                      {items.map((report) => (
                        <a
                          key={report.id}
                          href={report.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-md"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <FileText className="h-5 w-5 shrink-0 text-primary-700" />
                            <div>
                              <p className="font-medium text-primary-900">
                                {report.title}
                              </p>
                              {report.period_label && (
                                <p className="text-xs text-neutral-500">
                                  {report.period_label}
                                </p>
                              )}
                            </div>
                          </div>
                          <Download className="h-5 w-5 shrink-0 text-neutral-400" />
                        </a>
                      ))}
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        )}
      </Section>
    </>
  );
}
