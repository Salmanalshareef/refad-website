import { requireProfile } from "@/lib/auth";
import { getLatestSubscription, getMySubscriptions } from "@/lib/data/subscriptions";
import { getBankInfo } from "@/lib/data/bank-info";
import { SubscriptionStatusCard } from "@/components/portal/SubscriptionStatusCard";
import { BankInfoCard } from "@/components/portal/BankInfoCard";
import { NewSubscriptionModal } from "@/components/portal/NewSubscriptionModal";
import { SubscriptionHistoryTable } from "@/components/portal/SubscriptionHistoryTable";
import { EmptyState } from "@/components/shared/EmptyState";

export default async function SubscriptionsPage() {
  const profile = await requireProfile();

  const [latestSubscription, subscriptions, bankInfo] = await Promise.all([
    getLatestSubscription(profile.id).catch(() => null),
    getMySubscriptions(profile.id).catch(() => null),
    getBankInfo().catch(() => null),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary-900">الاشتراكات</h1>
        <p className="mt-1 text-sm text-neutral-600">
          تابع حالة اشتراكك في صندوق رفاد العائلي.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <SubscriptionStatusCard profile={profile} subscription={latestSubscription} />
        <BankInfoCard bankInfo={bankInfo} />
      </div>

      <NewSubscriptionModal profile={profile} />

      <div>
        <h2 className="mb-3 font-bold text-primary-900">سجل الاشتراكات</h2>
        {subscriptions === null && (
          <EmptyState message="تعذر تحميل بيانات الاشتراكات. تأكد من إعداد الاتصال بقاعدة البيانات." />
        )}
        {subscriptions?.length === 0 && (
          <EmptyState message="لا يوجد لديك اشتراكات مسجلة بعد." />
        )}
        {subscriptions && subscriptions.length > 0 && (
          <SubscriptionHistoryTable subscriptions={subscriptions} />
        )}
      </div>
    </div>
  );
}
