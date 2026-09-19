import { getNewsByCategory } from "@/lib/data/news";
import { NewsItemForm } from "@/components/admin/NewsItemForm";
import { NewsItemRow } from "@/components/admin/NewsItemRow";
import { EmptyState } from "@/components/shared/EmptyState";

export default async function AdminFamilyNewsPage() {
  const items = await getNewsByCategory("family").catch(() => null);

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
        <h2 className="mb-3 text-sm font-semibold text-neutral-700">إضافة خبر عائلي جديد</h2>
        <NewsItemForm defaultCategory="family" />
      </div>

      <div className="space-y-3">
        {items === null && (
          <EmptyState message="تعذر تحميل البيانات. تأكد من إعداد الاتصال بقاعدة البيانات." />
        )}
        {items?.length === 0 && <EmptyState message="لا توجد أخبار عائلية بعد." />}
        {items?.map((item) => (
          <NewsItemRow key={item.id} item={item} category="family" />
        ))}
      </div>
    </div>
  );
}
