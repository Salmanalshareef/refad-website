"use client";

import { useActionState } from "react";
import { createMember } from "@/app/actions/admin/members";
import { Button } from "@/components/shared/Button";

export function MemberForm() {
  const [state, action, pending] = useActionState(createMember, undefined);

  return (
    <form action={action} className="grid gap-3 sm:grid-cols-2">
      <input
        name="full_name"
        placeholder="الاسم الكامل"
        required
        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
      />
      <input
        name="national_id"
        placeholder="رقم الهوية الوطنية (اختياري)"
        dir="ltr"
        inputMode="numeric"
        maxLength={10}
        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
      />
      <input
        name="phone"
        dir="ltr"
        placeholder="رقم الجوال"
        required
        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
      />
      <input
        name="email"
        type="email"
        dir="ltr"
        placeholder="البريد الإلكتروني (اختياري)"
        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
      />
      <input
        name="password"
        type="text"
        dir="ltr"
        placeholder="كلمة مرور مؤقتة"
        required
        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
      />

      {state?.error && (
        <p className="text-sm font-medium text-red-600 sm:col-span-2">{state.error}</p>
      )}

      <div className="sm:col-span-2">
        <Button type="submit" disabled={pending} className="px-4! py-2! text-xs">
          {pending ? "جارٍ الإنشاء..." : "إنشاء حساب"}
        </Button>
      </div>
    </form>
  );
}
