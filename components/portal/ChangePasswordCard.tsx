"use client";

import { useActionState, useRef } from "react";
import { KeyRound } from "lucide-react";
import { changePassword } from "@/app/actions/password-reset";
import { Button } from "@/components/shared/Button";

const inputClasses =
  "w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500";

export function ChangePasswordCard() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(
    async (prev: Awaited<ReturnType<typeof changePassword>>, formData: FormData) => {
      const result = await changePassword(prev, formData);
      // Clearing on success matters more here than elsewhere: leaving the old
      // and new passwords sitting in the fields is worth avoiding.
      if (result?.success) formRef.current?.reset();
      return result;
    },
    undefined
  );

  return (
    <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-700">
          <KeyRound className="h-4 w-4" />
        </span>
        <h2 className="font-bold text-primary-900">تغيير كلمة المرور</h2>
      </div>

      <form ref={formRef} action={action} className="space-y-4">
        <div>
          <label
            htmlFor="current_password"
            className="mb-1.5 block text-sm font-medium text-neutral-800"
          >
            كلمة المرور الحالية
          </label>
          <input
            id="current_password"
            name="current_password"
            type="password"
            autoComplete="current-password"
            required
            className={inputClasses}
          />
        </div>

        <div>
          <label htmlFor="new_password" className="mb-1.5 block text-sm font-medium text-neutral-800">
            كلمة المرور الجديدة
          </label>
          <input
            id="new_password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            className={inputClasses}
          />
          <p className="mt-1 text-xs text-neutral-500">8 أحرف على الأقل.</p>
        </div>

        <div>
          <label
            htmlFor="confirm_new_password"
            className="mb-1.5 block text-sm font-medium text-neutral-800"
          >
            تأكيد كلمة المرور الجديدة
          </label>
          <input
            id="confirm_new_password"
            name="confirm_password"
            type="password"
            autoComplete="new-password"
            required
            className={inputClasses}
          />
        </div>

        {state?.error && <p className="text-sm font-medium text-red-600">{state.error}</p>}
        {state?.success && (
          <p className="text-sm font-medium text-primary-700">تم تحديث كلمة المرور بنجاح.</p>
        )}

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "جارٍ الحفظ..." : "تحديث كلمة المرور"}
        </Button>
      </form>
    </div>
  );
}
