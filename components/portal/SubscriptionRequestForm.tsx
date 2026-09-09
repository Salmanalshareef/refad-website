"use client";

import { useActionState } from "react";
import { submitSubscriptionRequest } from "@/app/actions/subscriptions";
import { Button } from "@/components/shared/Button";
import type { Profile } from "@/types/db";

export function SubscriptionRequestForm({
  profile,
  onDone,
}: {
  profile: Profile;
  onDone: () => void;
}) {
  const [state, action, pending] = useActionState(submitSubscriptionRequest, undefined);

  if (state?.success) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm font-medium text-primary-800">
          تم إرسال طلبك بنجاح وسيتم مراجعته من قبل الإدارة.
        </p>
        <Button type="button" onClick={onDone} className="w-full">
          إغلاق
        </Button>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="mb-1.5 text-sm font-medium text-neutral-800">الاسم الكامل</p>
          <p className="rounded-lg border border-neutral-200 bg-neutral-100 px-3 py-2 text-sm text-neutral-600">
            {profile.full_name}
          </p>
        </div>
        <div>
          <p className="mb-1.5 text-sm font-medium text-neutral-800">الرقم التعريفي</p>
          <p dir="ltr" className="rounded-lg border border-neutral-200 bg-neutral-100 px-3 py-2 text-sm text-neutral-600">
            #{profile.member_number}
          </p>
        </div>
      </div>

      <div>
        <label htmlFor="amount" className="mb-1.5 block text-sm font-medium text-neutral-800">
          المبلغ (ر.س)
        </label>
        <input
          id="amount"
          name="amount"
          type="number"
          step="0.01"
          min="0"
          dir="ltr"
          required
          className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
      </div>

      <div>
        <label htmlFor="receipt_file" className="mb-1.5 block text-sm font-medium text-neutral-800">
          إرفاق إيصال التحويل البنكي
        </label>
        <input
          id="receipt_file"
          name="receipt_file"
          type="file"
          accept="application/pdf,image/jpeg,image/png,image/webp"
          required
          className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm"
        />
      </div>

      <div>
        <label htmlFor="notes" className="mb-1.5 block text-sm font-medium text-neutral-800">
          ملاحظات (اختياري)
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={2}
          className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm"
        />
      </div>

      {state?.error && <p className="text-sm font-medium text-red-600">{state.error}</p>}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "جارٍ الإرسال..." : "إرسال الطلب"}
      </Button>
    </form>
  );
}
