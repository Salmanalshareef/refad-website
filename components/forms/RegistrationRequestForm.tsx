"use client";

import { useActionState } from "react";
import Link from "next/link";
import { submitRegistrationRequest } from "@/app/actions/registration-requests";
import { Button } from "@/components/shared/Button";
import { HijriDateInput } from "@/components/shared/HijriDateInput";

export function RegistrationRequestForm() {
  const [state, action, pending] = useActionState(submitRegistrationRequest, undefined);

  if (state?.success) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-primary-800">
          تم إرسال طلب التسجيل بنجاح. سيقوم فريق الإدارة بمراجعة طلبك والتواصل
          معك عند الموافقة عليه.
        </p>
        <Link href="/login" className="text-sm font-medium text-primary-700 hover:underline">
          العودة إلى تسجيل الدخول
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="first_name" className="mb-1.5 block text-sm font-medium text-neutral-800">
            الاسم الأول
          </label>
          <input
            id="first_name"
            name="first_name"
            required
            className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
        <div>
          <label htmlFor="second_name" className="mb-1.5 block text-sm font-medium text-neutral-800">
            الاسم الثاني
          </label>
          <input
            id="second_name"
            name="second_name"
            required
            className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
        <div>
          <label htmlFor="third_name" className="mb-1.5 block text-sm font-medium text-neutral-800">
            الاسم الثالث
          </label>
          <input
            id="third_name"
            name="third_name"
            required
            className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
        <div>
          <label htmlFor="fourth_name" className="mb-1.5 block text-sm font-medium text-neutral-800">
            الاسم الرابع
          </label>
          <input
            id="fourth_name"
            name="fourth_name"
            required
            className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="national_id" className="mb-1.5 block text-sm font-medium text-neutral-800">
          رقم الهوية الوطنية
        </label>
        <input
          id="national_id"
          name="national_id"
          dir="ltr"
          inputMode="numeric"
          maxLength={10}
          required
          className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
      </div>

      <div>
        <label htmlFor="gender" className="mb-1.5 block text-sm font-medium text-neutral-800">
          الجنس
        </label>
        <select
          id="gender"
          name="gender"
          required
          defaultValue=""
          className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        >
          <option value="" disabled>
            اختر الجنس
          </option>
          <option value="male">ذكر</option>
          <option value="female">أنثى</option>
        </select>
      </div>

      <HijriDateInput id="birth_date" name="birth_date" label="تاريخ الميلاد" />

      <div>
        <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-neutral-800">
          رقم الجوال
        </label>
        <input
          id="phone"
          name="phone"
          dir="ltr"
          required
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
          className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
      </div>

      {state?.error && <p className="text-sm font-medium text-red-600">{state.error}</p>}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "جارٍ الإرسال..." : "إرسال طلب التسجيل"}
      </Button>

      <p className="text-center text-sm text-neutral-600">
        <Link href="/login" className="font-medium text-primary-700 hover:underline">
          العودة إلى تسجيل الدخول
        </Link>
      </p>
    </form>
  );
}
