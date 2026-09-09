import { getAllSubscriptions, getSubscriptionStats } from "@/lib/data/subscriptions";
import { getBankInfo } from "@/lib/data/bank-info";
import { getAllProfiles } from "@/lib/data/members";
import { Card } from "@/components/shared/Card";
import { EmptyState } from "@/components/shared/EmptyState";
import { BankInfoForm } from "@/components/admin/BankInfoForm";
import { AddSubscriptionForm } from "@/components/admin/AddSubscriptionForm";
import { SubscriptionFilters } from "@/components/admin/SubscriptionFilters";
import { SubscriptionsTable } from "@/components/admin/SubscriptionsTable";
import type { Subscription } from "@/types/db";

export default async function AdminSubscriptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; year?: string }>;
}) {
  const { status = "pending", year = "all" } = await searchParams;

  const [subscriptions, stats, bankInfo, profiles] = await Promise.all([
    getAllSubscriptions().catch(() => null),
    getSubscriptionStats().catch(() => null),
    getBankInfo().catch(() => null),
    getAllProfiles().catch(() => []),
  ]);

  const fiscalYears = subscriptions
    ? Array.from(new Set(subscriptions.map((s) => s.fiscal_year))).sort((a, b) => b - a)
    : [];

  const filtered = filterSubscriptions(subscriptions ?? [], status, year);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-3 text-sm font-semibold text-neutral-700">
          بيانات الحساب البنكي المعتمد
        </h2>
        {bankInfo ? (
          <BankInfoForm bankInfo={bankInfo} />
        ) : (
          <EmptyState message="تعذر تحميل بيانات الحساب البنكي." />
        )}
      </div>

      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <p className="text-2xl font-extrabold text-primary-800" dir="ltr">
              {stats.totalCollected.toLocaleString("ar-SA")} ر.س
            </p>
            <p className="mt-1 text-sm text-neutral-600">
              إجمالي المبالغ المحصّلة لعام {stats.fiscalYear}
            </p>
          </Card>
          <Card>
            <p className="text-2xl font-extrabold text-primary-800">{stats.pendingCount}</p>
            <p className="mt-1 text-sm text-neutral-600">طلبات قيد المراجعة</p>
          </Card>
          <Card>
            <p className="text-2xl font-extrabold text-primary-800">{stats.paidCount}</p>
            <p className="mt-1 text-sm text-neutral-600">أعضاء دفعوا اشتراكهم هذا العام</p>
          </Card>
          <Card>
            <p className="text-2xl font-extrabold text-primary-800">{stats.unpaidCount}</p>
            <p className="mt-1 text-sm text-neutral-600">أعضاء لم يدفعوا اشتراكهم هذا العام</p>
          </Card>
        </div>
      )}

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-neutral-700">طلبات الاشتراك</h2>
        <AddSubscriptionForm profiles={profiles} />
        <SubscriptionFilters status={status} fiscalYear={year} fiscalYears={fiscalYears} />

        {subscriptions === null && (
          <EmptyState message="تعذر تحميل الطلبات. تأكد من إعداد الاتصال بقاعدة البيانات." />
        )}
        {subscriptions !== null && filtered.length === 0 && (
          <EmptyState message="لا توجد طلبات مطابقة." />
        )}
        {filtered.length > 0 && <SubscriptionsTable subscriptions={filtered} />}
      </div>
    </div>
  );
}

function filterSubscriptions<
  T extends { status: Subscription["status"]; fiscal_year: number },
>(subscriptions: T[], status: string, year: string): T[] {
  return subscriptions.filter((sub) => {
    const statusMatch =
      status === "all" ||
      (status === "pending" && sub.status === "pending") ||
      (status === "accepted" && (sub.status === "active" || sub.status === "expired")) ||
      (status === "rejected" && sub.status === "rejected");

    const yearMatch = year === "all" || sub.fiscal_year === Number(year);

    return statusMatch && yearMatch;
  });
}
