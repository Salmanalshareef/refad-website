import { PageHeader } from "@/components/shared/PageHeader";
import { Section } from "@/components/shared/Section";
import { Reveal } from "@/components/shared/Reveal";
import { MediaCenterSubNav } from "@/components/media-center/MediaCenterSubNav";
import { EmptyState } from "@/components/shared/EmptyState";
import { getMagazineIssues } from "@/lib/data/magazine";
import { BookOpen, Download } from "lucide-react";

export default async function MagazinePage() {
  const issues = await getMagazineIssues().catch(() => null);

  return (
    <>
      <PageHeader eyebrow="مركز الإعلام" title="مجلة الأسرة" />
      <MediaCenterSubNav />

      <Section>
        {issues === null && (
          <EmptyState message="تعذر تحميل المجلة. تأكد من إعداد الاتصال بقاعدة البيانات." />
        )}
        {issues?.length === 0 && <EmptyState message="لم يتم نشر أعداد بعد." />}
        {issues && issues.length > 0 && (
          <div className="space-y-3">
            {issues.map((issue, index) => (
              <Reveal key={issue.id} delay={index * 80}>
                <a
                  href={issue.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-5 w-5 shrink-0 text-primary-700" />
                    <div>
                      <p className="font-medium text-primary-900">{issue.title}</p>
                      {issue.issue_label && (
                        <p className="text-xs text-neutral-500">{issue.issue_label}</p>
                      )}
                    </div>
                  </div>
                  <Download className="h-5 w-5 shrink-0 text-neutral-400" />
                </a>
              </Reveal>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
