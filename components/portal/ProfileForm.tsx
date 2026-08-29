"use client";

import { useActionState } from "react";
import { updateProfile } from "@/app/actions/profile";
import { Button } from "@/components/shared/Button";
import { formatHijriDisplay } from "@/lib/hijri";

export function ProfileForm({
  fullName,
  phone,
  nationalId,
  email,
  birthDate,
}: {
  fullName: string;
  phone: string;
  nationalId: string | null;
  email: string | null | undefined;
  birthDate: string | null;
}) {
  const [state, action, pending] = useActionState(updateProfile, undefined);

  return (
    <form action={action} className="max-w-lg space-y-5">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-neutral-800">
          الاسم الكامل
        </label>
        <input
          value={fullName}
          disabled
          placeholder="يتم تعديله من قِبل الإدارة فقط"
          className="w-full rounded-lg border border-neutral-200 bg-neutral-100 px-4 py-2.5 text-sm text-neutral-500"
        />
      </div>

      <div>
        <label htmlFor="national_id" className="mb-1.5 block text-sm font-medium text-neutral-800">
          رقم الهوية الوطنية
        </label>
        <input
          id="national_id"
          dir="ltr"
          value={nationalId ?? ""}
          disabled
          placeholder="لم يتم تسجيله بعد — يتم تعديله من قِبل الإدارة فقط"
          className="w-full rounded-lg border border-neutral-200 bg-neutral-100 px-4 py-2.5 text-sm text-neutral-500"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-neutral-800">
          تاريخ الميلاد
        </label>
        <input
          value={formatHijriDisplay(birthDate) ?? ""}
          disabled
          placeholder="لم يتم تسجيله بعد — يتم تعديله من قِبل الإدارة فقط"
          className="w-full rounded-lg border border-neutral-200 bg-neutral-100 px-4 py-2.5 text-sm text-neutral-500"
        />
      </div>

      <div>
        <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-neutral-800">
          رقم الجوال
        </label>
        <input
          id="phone"
          name="phone"
          dir="ltr"
          required
          defaultValue={phone}
          className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
      </div>

      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-neutral-800">
          البريد الإلكتروني (اختياري)
        </label>
        <input
          id="email"
          name="email"
          type="email"
          dir="ltr"
          defaultValue={email ?? ""}
          className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
      </div>

      {state?.error && <p className="text-sm font-medium text-red-600">{state.error}</p>}
      {state?.success && (
        <p className="text-sm font-medium text-primary-700">تم حفظ التغييرات بنجاح.</p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "جارٍ الحفظ..." : "حفظ التغييرات"}
      </Button>
    </form>
  );
}
