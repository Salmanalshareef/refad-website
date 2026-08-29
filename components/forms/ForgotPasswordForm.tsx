"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "@/app/actions/auth";
import { Button } from "@/components/shared/Button";

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, undefined);

  if (state?.success) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-primary-800">
          إذا كان رقم الجوال مسجلاً لدينا، فسيتم التواصل معك لإعادة تعيين
          كلمة المرور.
        </p>
        <Link href="/login" className="text-sm font-medium text-primary-700 hover:underline">
          العودة إلى تسجيل الدخول
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5">
      <div>
        <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-neutral-800">
          رقم الجوال
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          dir="ltr"
          required
          className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
      </div>

      {state?.error && <p className="text-sm font-medium text-red-600">{state.error}</p>}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "جارٍ الإرسال..." : "إرسال رابط إعادة التعيين"}
      </Button>

      <p className="text-center text-sm text-neutral-600">
        <Link href="/login" className="font-medium text-primary-700 hover:underline">
          العودة إلى تسجيل الدخول
        </Link>
      </p>
    </form>
  );
}
