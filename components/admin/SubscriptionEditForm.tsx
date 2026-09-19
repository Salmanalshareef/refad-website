"use client";

import { useActionState } from "react";
import { updateSubscription } from "@/app/actions/admin/subscriptions";
import { useSaveOutcome } from "@/lib/use-save-outcome";
import { Button } from "@/components/shared/Button";
import type { Subscription } from "@/types/db";

export function SubscriptionEditForm({
  subscription,
  onDone,
}: {
  subscription: Subscription;
  onDone: () => void;
}) {
  const [state, action, pending] = useActionState(updateSubscription, undefined);
  const { showSaved } = useSaveOutcome(state, onDone);

  return (
    <form action={action} className="grid gap-3 sm:grid-cols-2">
      <input type="hidden" name="id" value={subscription.id} />
      <input type="hidden" name="current_receipt_url" value={subscription.receipt_url ?? ""} />

      <div>
        <label className="mb-1.5 block text-xs font-medium text-neutral-600">المبلغ (ر.س)</label>
        <input
          name="amount"
          type="number"
          step="0.01"
          min="0"
          dir="ltr"
          defaultValue={subscription.amount}
          required
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-neutral-600">تاريخ التقديم</label>
        <input
          name="requested_date"
          type="date"
          defaultValue={subscription.requested_date}
          required
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="sm:col-span-2">
        <label className="mb-1.5 block text-xs font-medium text-neutral-600">
          استبدال الإيصال (اختياري)
        </label>
        <input
          name="receipt_file"
          type="file"
          accept="application/pdf,image/jpeg,image/png,image/webp"
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>

      {state?.error && (
        <p className="text-sm font-medium text-red-600 sm:col-span-2">{state.error}</p>
      )}
      {showSaved && (
        <p className="text-sm font-medium text-primary-700 sm:col-span-2">تم الحفظ بنجاح.</p>
      )}

      <div className="flex gap-2 sm:col-span-2">
        <Button type="submit" disabled={pending} className="px-4! py-2! text-xs">
          {pending ? "جارٍ الحفظ..." : "حفظ التعديلات"}
        </Button>
        <Button type="button" variant="ghost" onClick={onDone} className="px-4! py-2! text-xs">
          إلغاء
        </Button>
      </div>
    </form>
  );
}
