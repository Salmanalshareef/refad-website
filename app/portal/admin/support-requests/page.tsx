import { getAllSupportRequests } from "@/lib/data/support-requests";
import { SupportRequestsList } from "@/components/admin/SupportRequestsList";
import { EmptyState } from "@/components/shared/EmptyState";

export default async function AdminSupportRequestsPage() {
  const requests = await getAllSupportRequests().catch(() => null);

  if (requests === null) {
    return (
      <EmptyState message="تعذر تحميل الطلبات. تأكد من إعداد الاتصال بقاعدة البيانات." />
    );
  }

  return <SupportRequestsList requests={requests} />;
}
