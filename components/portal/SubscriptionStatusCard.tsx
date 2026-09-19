import { cn } from "@/lib/utils";
import { subscriptionStatusLabels, subscriptionStatusStyles } from "@/lib/labels/subscriptions";
import type { Profile, Subscription } from "@/types/db";

export function SubscriptionStatusCard({
  profile,
  subscription,
}: {
  profile: Profile;
  subscription: (Subscription & { effective_status: Subscription["status"] }) | null;
}) {
  const status = subscription?.effective_status;

  return (
    <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-bold text-primary-900">حالة الاشتراك</h2>
        <span
          className={cn(
            "rounded-full px-3 py-1 text-xs font-semibold",
            status
              ? subscriptionStatusStyles[status]
              : "bg-neutral-200 text-neutral-600"
          )}
        >
          {status ? subscriptionStatusLabels[status] : "لا يوجد اشتراك"}
        </span>
      </div>

      <dl className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <dt className="text-xs text-neutral-500">اسم العضو</dt>
          <dd className="mt-0.5 font-medium text-primary-900">{profile.full_name}</dd>
        </div>
        <div>
          <dt className="text-xs text-neutral-500">الرقم التعريفي</dt>
          <dd dir="ltr" className="mt-0.5 text-right font-medium text-primary-900">
            #{profile.member_number}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-neutral-500">رقم الاشتراك</dt>
          <dd dir="ltr" className="mt-0.5 text-right font-medium text-primary-900">
            {subscription?.subscription_number ? `#${subscription.subscription_number}` : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-neutral-500">تاريخ الانتهاء</dt>
          <dd dir="ltr" className="mt-0.5 text-right font-medium text-primary-900">
            {subscription?.end_date ?? "—"}
          </dd>
        </div>
      </dl>
    </div>
  );
}
