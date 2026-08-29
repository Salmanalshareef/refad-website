import { requireAdmin } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary-900">لوحة الإدارة</h1>
        <p className="mt-1 text-sm text-neutral-600">
          إدارة محتوى الموقع وبيانات الأسرة والصندوق.
        </p>
      </div>

      {children}
    </div>
  );
}
