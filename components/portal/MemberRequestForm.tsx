"use client";

import { useActionState, useMemo, useState } from "react";
import { submitMemberRequest } from "@/app/actions/member-requests";
import { memberRequestTypeLabels } from "@/lib/labels/member-requests";
import { Button } from "@/components/shared/Button";
import type { MemberRequestType } from "@/types/db";

const inputClasses =
  "w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500";
const readOnlyClasses =
  "w-full rounded-lg border border-neutral-200 bg-neutral-100 px-4 py-2.5 text-sm text-neutral-500";

export function MemberRequestForm({
  applicantFullName,
  memberNumber,
}: {
  applicantFullName: string;
  memberNumber: number;
}) {
  const [state, action, pending] = useActionState(submitMemberRequest, undefined);
  const [type, setType] = useState<MemberRequestType>("news");

  const [applicantFirst, applicantSecond, applicantThird] = useMemo(
    () => applicantFullName.trim().split(/\s+/),
    [applicantFullName]
  );

  return (
    <form action={action} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="mb-1.5 text-sm font-medium text-neutral-800">مقدّم الطلب</p>
          <p className={readOnlyClasses}>{applicantFullName}</p>
        </div>
        <div>
          <p className="mb-1.5 text-sm font-medium text-neutral-800">الرقم التعريفي</p>
          <p dir="ltr" className={readOnlyClasses}>
            #{memberNumber}
          </p>
        </div>
      </div>

      <div>
        <label htmlFor="type" className="mb-1.5 block text-sm font-medium text-neutral-800">
          نوع الطلب
        </label>
        <select
          id="type"
          name="type"
          value={type}
          onChange={(e) => setType(e.target.value as MemberRequestType)}
          className={inputClasses}
        >
          {Object.entries(memberRequestTypeLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {type === "family_member" ? (
        <>
          <div className="rounded-lg border border-gold-200 bg-gold-50 p-4">
            <p className="text-sm text-gold-800">
              لضمان قبول طلب إضافة فرد العائلة، يجب أن تتم إضافته من قِبل والده.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="first_name" className="mb-1.5 block text-sm font-medium text-neutral-800">
                الاسم الأول
              </label>
              <input id="first_name" name="first_name" required className={inputClasses} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-800">الاسم الثاني</label>
              <input
                name="second_name"
                readOnly
                defaultValue={applicantFirst ?? ""}
                className={readOnlyClasses}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-800">الاسم الثالث</label>
              <input
                name="third_name"
                readOnly
                defaultValue={applicantSecond ?? ""}
                className={readOnlyClasses}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-800">الاسم الرابع</label>
              <input
                name="fourth_name"
                readOnly
                defaultValue={applicantThird ?? ""}
                className={readOnlyClasses}
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
              className={inputClasses}
            />
          </div>

          <div>
            <label htmlFor="mother_name" className="mb-1.5 block text-sm font-medium text-neutral-800">
              اسم الأم كاملاً
            </label>
            <input id="mother_name" name="mother_name" required className={inputClasses} />
          </div>
        </>
      ) : (
        <div className={type === "news" ? "grid gap-4 sm:grid-cols-2" : undefined}>
          <div>
            <label htmlFor="details" className="mb-1.5 block text-sm font-medium text-neutral-800">
              تفاصيل الطلب
            </label>
            <textarea
              id="details"
              name="details"
              rows={4}
              placeholder="اكتب تفاصيل طلبك هنا..."
              className={inputClasses}
            />
          </div>

          {type === "news" && (
            <div>
              <label htmlFor="image_file" className="mb-1.5 block text-sm font-medium text-neutral-800">
                صورة مرفقة (اختياري)
              </label>
              <input
                id="image_file"
                name="image_file"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm"
              />
            </div>
          )}
        </div>
      )}

      {state?.error && <p className="text-sm font-medium text-red-600">{state.error}</p>}
      {state?.success && (
        <p className="text-sm font-medium text-primary-700">تم إرسال طلبك بنجاح.</p>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "جارٍ الإرسال..." : "إرسال الطلب"}
      </Button>
    </form>
  );
}
