import Image from "next/image";
import { CalendarDays } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { getMemberVisibleNews } from "@/lib/data/news";
import { newsCategoryLabels } from "@/lib/labels/news";
import { EmptyState } from "@/components/shared/EmptyState";
import { Reveal } from "@/components/shared/Reveal";
import { cn } from "@/lib/utils";

export default async function PortalNewsPage() {
  await requireProfile();
  const news = await getMemberVisibleNews().catch(() => null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary-900">أخبار الأسرة والصندوق</h1>
        <p className="mt-1 text-sm text-neutral-600">
          آخر أخبار الأسرة وصندوق رفاد.
        </p>
      </div>

      {news === null ? (
        <EmptyState message="تعذر تحميل الأخبار. تأكد من إعداد الاتصال بقاعدة البيانات." />
      ) : news.length === 0 ? (
        <EmptyState message="لا توجد أخبار منشورة حاليًا." />
      ) : (
        <div className="space-y-4">
          {news.map((item, index) => (
            <Reveal key={item.id} delay={index * 60}>
              <article className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-5 shadow-sm sm:flex-row">
                {item.image_url && (
                  <div className="image-plate w-full shrink-0 overflow-hidden rounded-xl sm:w-48">
                    <Image
                      src={item.image_url}
                      alt=""
                      width={192}
                      height={128}
                      unoptimized
                      className="h-40 w-full object-cover sm:h-32"
                    />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Both categories share this page, so each item says which
                        it is — the distinction is not otherwise visible here. */}
                    <span
                      className={cn(
                        "rounded-full px-3 py-1 text-xs font-semibold",
                        item.category === "fund"
                          ? "bg-primary-50 text-primary-700"
                          : "bg-gold-100 text-gold-600"
                      )}
                    >
                      {newsCategoryLabels[item.category]}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-neutral-500">
                      <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                      <span dir="ltr">{item.published_date.slice(0, 10)}</span>
                    </span>
                  </div>

                  <h2 className="mt-2 text-lg font-bold text-primary-900">{item.title}</h2>
                  <p className="mt-1 whitespace-pre-line leading-relaxed text-neutral-700">
                    {item.body}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
