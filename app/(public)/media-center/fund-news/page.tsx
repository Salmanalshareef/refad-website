import { PageHeader } from "@/components/shared/PageHeader";
import { Section } from "@/components/shared/Section";
import { Reveal } from "@/components/shared/Reveal";
import { MediaCenterSubNav } from "@/components/media-center/MediaCenterSubNav";
import { EmptyState } from "@/components/shared/EmptyState";
import { getNewsByCategory } from "@/lib/data/news";

export default async function FundNewsPage() {
  const items = await getNewsByCategory("fund").catch(() => null);

  return (
    <>
      <PageHeader eyebrow="مركز الإعلام" title="أخبار الصندوق" />
      <MediaCenterSubNav />

      <Section>
        {items === null && (
          <EmptyState message="تعذر تحميل الأخبار. تأكد من إعداد الاتصال بقاعدة البيانات." />
        )}
        {items?.length === 0 && <EmptyState message="لا توجد أخبار عن الصندوق بعد." />}
        {items && items.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, index) => (
              <Reveal key={item.id} delay={index * 100}>
                <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <p className="mb-1 text-xs text-neutral-500">{item.published_date}</p>
                  <h3 className="font-bold text-primary-900">{item.title}</h3>
                  <p className="mt-2 text-sm text-neutral-600">{item.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
