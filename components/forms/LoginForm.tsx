"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login } from "@/app/actions/auth";
import { Button } from "@/components/shared/Button";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <form action={action} className="space-y-5">
      {next && <input type="hidden" name="next" value={next} />}

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

      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-neutral-800">
          كلمة المرور
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
      </div>

      {state?.error && <p className="text-sm font-medium text-red-600">{state.error}</p>}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "جارٍ الدخول..." : "تسجيل الدخول"}
      </Button>

      <p className="text-center text-sm text-neutral-600">
        <Link href="/forgot-password" className="font-medium text-primary-700 hover:underline">
          نسيت كلمة المرور؟
        </Link>
      </p>
      <p className="text-center text-sm text-neutral-600">
        ليس لديك حساب؟{" "}
        <Link href="/register" className="font-medium text-primary-700 hover:underline">
          طلب تسجيل عضوية جديدة
        </Link>
      </p>
    </form>
  );
}
