import Image from "next/image";
import { PageHeader } from "@/components/shared/PageHeader";
import { Section } from "@/components/shared/Section";
import { Reveal } from "@/components/shared/Reveal";
import { MediaCenterSubNav } from "@/components/media-center/MediaCenterSubNav";
import { EmptyState } from "@/components/shared/EmptyState";
import { getPublishedNewsByCategory } from "@/lib/data/news";

export default async function FamilyNewsPage() {
  const items = await getPublishedNewsByCategory("family").catch(() => null);

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
            {items.map((item, index) => (
              <Reveal key={item.id} delay={index * 100}>
                <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  {item.image_url && (
                    <div className="relative aspect-video w-full">
                      <Image
                        src={item.image_url}
                        alt=""
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <p className="mb-1 text-xs text-neutral-500">{item.published_date}</p>
                    <h3 className="font-bold text-primary-900">{item.title}</h3>
                    <p className="mt-2 text-sm text-neutral-600">{item.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
