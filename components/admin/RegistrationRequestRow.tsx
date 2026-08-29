"use client";

import { useState, useTransition } from "react";
import { Check, ChevronDown, ChevronUp, UserPlus, X } from "lucide-react";
import {
  approveRegistrationRequest,
  rejectRegistrationRequest,
} from "@/app/actions/admin/registration-requests";
import {
  registrationRequestStatusLabels,
  registrationRequestStatusStyles,
} from "@/lib/labels/registration-requests";
import { formatHijriDisplay } from "@/lib/hijri";
import type { RegistrationRequest } from "@/types/db";

export function RegistrationRequestRow({ request }: { request: RegistrationRequest }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [generatedPassword, setGeneratedPassword] = useState<string | undefined>();

  const pending = request.status === "pending" && !generatedPassword;

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-start"
      >
        <div className="flex items-center gap-3">
          <UserPlus className="h-5 w-5 shrink-0 text-primary-700" />
          <div>
            <p className="font-medium text-primary-900">
              {request.full_name}
              <span
                className={`ms-2 rounded-full px-2 py-0.5 text-xs font-semibold ${registrationRequestStatusStyles[request.status]}`}
              >
                {registrationRequestStatusLabels[request.status]}
              </span>
            </p>
            <p dir="ltr" className="text-end text-xs text-neutral-500">
              {request.phone}
            </p>
          </div>
        </div>
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {open && (
        <div className="mt-4 space-y-3 border-t border-neutral-100 pt-4 text-sm">
          <div className="grid gap-2 sm:grid-cols-2">
            <p>
              <span className="text-xs text-neutral-500">رقم الهوية الوطنية: </span>
              <span dir="ltr">{request.national_id}</span>
            </p>
            <p>
              <span className="text-xs text-neutral-500">رقم الجوال: </span>
              <span dir="ltr">{request.phone}</span>
            </p>
            {request.birth_date && (
              <p>
                <span className="text-xs text-neutral-500">تاريخ الميلاد: </span>
                <span>{formatHijriDisplay(request.birth_date)}</span>
              </p>
            )}
            {request.email && (
              <p>
                <span className="text-xs text-neutral-500">البريد الإلكتروني: </span>
                <span dir="ltr">{request.email}</span>
              </p>
            )}
          </div>

          {generatedPassword && (
            <div className="rounded-lg bg-primary-50 p-3 text-primary-800">
              <p className="font-semibold">تم إنشاء الحساب بنجاح.</p>
              <p className="mt-1">
                كلمة المرور المؤقتة: <span dir="ltr" className="font-mono font-bold">{generatedPassword}</span>
              </p>
              <p className="mt-1 text-xs">
                يرجى إرسال هذه البيانات للعضو — لن تظهر كلمة المرور مرة أخرى.
              </p>
            </div>
          )}

          {error && <p className="text-red-600">{error}</p>}

          {pending && (
            <>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-neutral-600">
                  ملاحظة عند الرفض (اختياري)
                </label>
                <textarea
                  value={comment}
                  disabled={isPending}
                  onChange={(e) => setComment(e.target.value)}
                  rows={2}
                  placeholder="سبب الرفض..."
                  className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() =>
                    startTransition(async () => {
                      setError(undefined);
                      const result = await approveRegistrationRequest(request.id);
                      if (result.error) {
                        setError(result.error);
                      } else if (result.password) {
                        setGeneratedPassword(result.password);
                      }
                    })
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-xs font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
                >
                  <Check className="h-3.5 w-3.5" />
                  {isPending ? "جارٍ المعالجة..." : "قبول الطلب"}
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() =>
                    startTransition(async () => {
                      setError(undefined);
                      await rejectRegistrationRequest(request.id, comment);
                    })
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  <X className="h-3.5 w-3.5" />
                  رفض الطلب
                </button>
              </div>
            </>
          )}

          {request.admin_comment && (
            <p className="rounded-lg bg-neutral-50 p-3 text-neutral-700">
              <span className="font-semibold">ملاحظة الإدارة: </span>
              {request.admin_comment}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
