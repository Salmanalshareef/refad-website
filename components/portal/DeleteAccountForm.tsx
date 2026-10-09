"use client";

import { useActionState } from "react";
import Link from "next/link";
import { CircleCheck, TriangleAlert } from "lucide-react";
import { requestAccountDeletion } from "@/app/actions/account-deletion";
import { Button } from "@/components/shared/Button";

const CONSEQUENCES = [
  "لن تتمكن من تسجيل الدخول إلى البوابة أو تقديم أي طلبات جديدة.",
  "سيتوقف وصولك إلى شجرة الأسرة والمبادرات والأخبار الخاصة بالأعضاء.",
  "تبقى طلباتك واشتراكاتك السابقة محفوظة لدى الصندوق للسجلات النظامية.",
  "يبقى اسمك في شجرة الأسرة، لأنه جزء من سجل الأسرة وليس من حسابك.",
];

export function DeleteAccountForm({ hasPending }: { hasPending: boolean }) {
  const [state, action, pending] = useActionState(requestAccountDeletion, undefined);

  if (state?.success || hasPending) {
    return (
      <div className="rounded-2xl border border-primary-200 bg-primary-50 p-6 text-center">
        <CircleCheck className="mx-auto mb-3 h-10 w-10 text-primary-700" />
        <p className="font-medium text-primary-900">
          تم استلام طلب حذف حسابك وهو قيد المراجعة.
        </p>
        <p className="mt-2 text-sm text-primary-800">
          ستتمكن من استخدام حسابك بشكل طبيعي حتى تتم الموافقة على الطلب.
        </p>
        <Link
          href="/portal"
          className="mt-4 inline-block text-sm font-medium text-primary-700 hover:underline"
        >
          العودة إلى لوحة التحكم
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
        <div className="mb-3 flex items-center gap-2">
          <TriangleAlert className="h-5 w-5 shrink-0 text-red-600" />
          <h2 className="font-bold text-red-600">ماذا يحدث عند إغلاق حسابك؟</h2>
        </div>
        <ul className="space-y-2">
          {CONSEQUENCES.map((line) => (
            <li key={line} className="flex gap-2 text-sm text-neutral-800">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-red-600" />
              {line}
            </li>
          ))}
        </ul>
      </div>

      <form action={action} className="space-y-4">
        <div>
          <label htmlFor="reason" className="mb-1.5 block text-sm font-medium text-neutral-800">
            سبب طلب الحذف (اختياري)
          </label>
          <textarea
            id="reason"
            name="reason"
            rows={3}
            placeholder="يساعدنا معرفة السبب على تحسين الخدمة."
            className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>

        <div>
          <label htmlFor="confirm" className="mb-1.5 block text-sm font-medium text-neutral-800">
            للتأكيد، اكتب كلمة <span className="font-bold">حذف</span>
          </label>
          <input
            id="confirm"
            name="confirm"
            required
            autoComplete="off"
            className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
          />
        </div>

        {state?.error && <p className="text-sm font-medium text-red-600">{state.error}</p>}

        <div className="flex flex-wrap gap-3">
          <Button
            type="submit"
            disabled={pending}
            className="bg-red-700! hover:bg-red-800! focus-visible:outline-red-700!"
          >
            {pending ? "جارٍ الإرسال..." : "إرسال طلب حذف الحساب"}
          </Button>
          <Button href="/portal" variant="ghost">
            إلغاء
          </Button>
        </div>
      </form>
    </div>
  );
}
