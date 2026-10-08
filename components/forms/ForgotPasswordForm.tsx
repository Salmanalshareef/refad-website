"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import {
  requestPasswordReset,
  resetPasswordWithCode,
} from "@/app/actions/password-reset";
import { Button } from "@/components/shared/Button";

const inputClasses =
  "w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500";

export function ForgotPasswordForm() {
  // The phone number is captured once and carried into the second step, so the
  // member does not retype it alongside the code.
  const [phone, setPhone] = useState("");
  const [codeSent, setCodeSent] = useState(false);

  const [requestState, requestAction, requesting] = useActionState(
    async (prev: Awaited<ReturnType<typeof requestPasswordReset>>, formData: FormData) => {
      const result = await requestPasswordReset(prev, formData);
      if (result?.success) setCodeSent(true);
      return result;
    },
    undefined
  );

  const [resetState, resetAction, resetting] = useActionState(
    resetPasswordWithCode,
    undefined
  );

  if (resetState?.success) {
    return (
      <div className="space-y-4 text-center">
        <ShieldCheck className="mx-auto h-10 w-10 text-primary-700" />
        <p className="text-sm text-primary-800">
          تم تحديث كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول بكلمة المرور
          الجديدة.
        </p>
        <Link
          href="/login"
          className="inline-block text-sm font-medium text-primary-700 hover:underline"
        >
          الذهاب إلى تسجيل الدخول
        </Link>
      </div>
    );
  }

  if (codeSent) {
    return (
      <form action={resetAction} className="space-y-5">
        <input type="hidden" name="phone" value={phone} />

        <p className="rounded-lg border border-primary-200 bg-primary-50 p-3 text-sm text-primary-800">
          إذا كان رقم الجوال مسجلاً لدينا، فقد أرسلنا رمزًا من 6 أرقام. صلاحية
          الرمز 10 دقائق.
        </p>

        <div>
          <label htmlFor="code" className="mb-1.5 block text-sm font-medium text-neutral-800">
            رمز التحقق
          </label>
          <input
            id="code"
            name="code"
            dir="ltr"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            required
            className={`${inputClasses} text-center tracking-[0.5em]`}
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-neutral-800">
            كلمة المرور الجديدة
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            className={inputClasses}
          />
        </div>

        <div>
          <label
            htmlFor="confirm_password"
            className="mb-1.5 block text-sm font-medium text-neutral-800"
          >
            تأكيد كلمة المرور الجديدة
          </label>
          <input
            id="confirm_password"
            name="confirm_password"
            type="password"
            autoComplete="new-password"
            required
            className={inputClasses}
          />
        </div>

        {resetState?.error && (
          <p className="text-sm font-medium text-red-600">{resetState.error}</p>
        )}

        <Button type="submit" disabled={resetting} className="w-full">
          {resetting ? "جارٍ الحفظ..." : "تعيين كلمة المرور"}
        </Button>

        <button
          type="button"
          onClick={() => setCodeSent(false)}
          className="w-full text-center text-sm font-medium text-primary-700 hover:underline"
        >
          لم يصلك الرمز؟ إعادة الإرسال
        </button>
      </form>
    );
  }

  return (
    <form action={requestAction} className="space-y-5">
      <div>
        <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-neutral-800">
          رقم الجوال
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          dir="ltr"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          className={inputClasses}
        />
      </div>

      {requestState?.error && (
        <p className="text-sm font-medium text-red-600">{requestState.error}</p>
      )}

      <Button type="submit" disabled={requesting} className="w-full">
        {requesting ? "جارٍ الإرسال..." : "إرسال رمز التحقق"}
      </Button>

      <p className="text-center text-sm text-neutral-600">
        <Link href="/login" className="font-medium text-primary-700 hover:underline">
          العودة إلى تسجيل الدخول
        </Link>
      </p>
    </form>
  );
}
