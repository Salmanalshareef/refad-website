import { getMemberRequestTypes } from "@/lib/data/member-request-types";
import { MemberRequestTypeForm } from "@/components/admin/MemberRequestTypeForm";
import { MemberRequestTypeRow } from "@/components/admin/MemberRequestTypeRow";
import { EmptyState } from "@/components/shared/EmptyState";

export default async function AdminMemberRequestTypesPage() {
  const types = await getMemberRequestTypes().catch(() => null);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-primary-900">إدارة الطلبات الإدارية</h1>
        <p className="mt-1 text-sm text-neutral-600">
          أنواع الطلبات التي يمكن للأعضاء تقديمها، والحقول التي يجمعها كل نوع.
        </p>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
        <h2 className="mb-3 text-sm font-semibold text-neutral-700">إضافة نوع طلب جديد</h2>
        <MemberRequestTypeForm />
      </div>

      <div className="space-y-3">
        {types === null ? (
          <EmptyState message="تعذر تحميل البيانات. تأكد من إعداد الاتصال بقاعدة البيانات." />
        ) : types.length === 0 ? (
          <EmptyState message="لا توجد أنواع طلبات بعد." />
        ) : (
          types.map((type) => <MemberRequestTypeRow key={type.id} type={type} />)
        )}
      </div>
    </div>
  );
}
