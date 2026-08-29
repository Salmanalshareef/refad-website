import { PageHeader } from "@/components/shared/PageHeader";
import { Section } from "@/components/shared/Section";
import { MediaCenterSubNav } from "@/components/media-center/MediaCenterSubNav";
import { EmptyState } from "@/components/shared/EmptyState";
import { getNewsByCategory } from "@/lib/data/news";

export default async function FamilyNewsPage() {
  const items = await getNewsByCategory("family").catch(() => null);

  return (
    <>
      <PageHeader eyebrow="مركز الإعلام" title="أخبار الأسرة" />
      <MediaCenterSubNav />

      <Section>
        {items === null && (
          <EmptyState message="تعذر تحميل الأخبار. تأكد من إعداد الاتصال بقاعدة البيانات." />
        )}
        {items?.length === 0 && <EmptyState message="لا توجد أخبار عائلية بعد." />}
        {items && items.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm"
              >
                <p className="mb-1 text-xs text-neutral-500">{item.published_date}</p>
                <h3 className="font-bold text-primary-900">{item.title}</h3>
                <p className="mt-2 text-sm text-neutral-600">{item.body}</p>
              </div>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
