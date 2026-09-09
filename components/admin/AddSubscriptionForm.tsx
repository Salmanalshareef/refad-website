"use client";

import { useActionState, useMemo, useState } from "react";
import { createSubscriptionForMember } from "@/app/actions/admin/subscriptions";
import { Button } from "@/components/shared/Button";
import type { Profile } from "@/types/db";

export function AddSubscriptionForm({ profiles }: { profiles: Profile[] }) {
  const [state, action, pending] = useActionState(createSubscriptionForMember, undefined);
  const [open, setOpen] = useState(false);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-xl border border-dashed border-primary-300 bg-primary-50/50 px-4 py-3 text-sm font-semibold text-primary-700 hover:bg-primary-50"
      >
        + إضافة اشتراك لعضو
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-primary-200 bg-primary-50/40 p-4">
      <form action={action} className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-medium text-neutral-600">العضو</label>
          <select
            name="profile_id"
            required
            defaultValue=""
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          >
            <option value="" disabled>
              اختر العضو
            </option>
            {profiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.full_name} (#{profile.member_number})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-neutral-600">المبلغ (ر.س)</label>
          <input
            name="amount"
            type="number"
            step="0.01"
            min="0"
            dir="ltr"
            required
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-neutral-600">السنة المالية</label>
          <input
            name="fiscal_year"
            type="number"
            dir="ltr"
            defaultValue={currentYear}
            required
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-neutral-600">تاريخ التقديم</label>
          <input
            name="requested_date"
            type="date"
            defaultValue={today}
            required
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-neutral-600">الحالة</label>
          <select
            name="status"
            defaultValue="pending"
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          >
            <option value="pending">قيد المراجعة</option>
            <option value="active">نشط مباشرة (تم الاعتماد)</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-medium text-neutral-600">
            إيصال التحويل (اختياري)
          </label>
          <input
            name="receipt_file"
            type="file"
            accept="application/pdf,image/jpeg,image/png,image/webp"
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-medium text-neutral-600">
            ملاحظات (اختياري)
          </label>
          <textarea
            name="notes"
            rows={2}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>

        {state?.error && (
          <p className="text-sm font-medium text-red-600 sm:col-span-2">{state.error}</p>
        )}
        {state?.success && (
          <p className="text-sm font-medium text-primary-700 sm:col-span-2">
            تمت إضافة الاشتراك بنجاح.
          </p>
        )}

        <div className="flex gap-2 sm:col-span-2">
          <Button type="submit" disabled={pending} className="px-4! py-2! text-xs">
            {pending ? "جارٍ الحفظ..." : "إضافة الاشتراك"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setOpen(false)}
            className="px-4! py-2! text-xs"
          >
            إلغاء
          </Button>
        </div>
      </form>
    </div>
  );
}
