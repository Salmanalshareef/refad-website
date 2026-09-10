"use client";

import { useActionState } from "react";
import { updateProfile } from "@/app/actions/profile";
import { Button } from "@/components/shared/Button";
import { formatHijriDisplay } from "@/lib/hijri";
import {
  educationLevelLabels,
  employmentStatusLabels,
  maritalStatusLabels,
} from "@/lib/labels/profile";
import type { EducationLevel, EmploymentStatus, MaritalStatus } from "@/types/db";

export function ProfileForm({
  memberNumber,
  fullName,
  phone,
  nationalId,
  email,
  birthDate,
  maritalStatus,
  educationLevel,
  employmentStatus,
}: {
  memberNumber: number;
  fullName: string;
  phone: string;
  nationalId: string | null;
  email: string | null | undefined;
  birthDate: string | null;
  maritalStatus: MaritalStatus | null;
  educationLevel: EducationLevel | null;
  employmentStatus: EmploymentStatus | null;
}) {
  const [state, action, pending] = useActionState(updateProfile, undefined);

  return (
    <form action={action} className="max-w-lg space-y-5">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-neutral-800">
          الرقم التعريفي
        </label>
        <input
          dir="ltr"
          value={`#${memberNumber}`}
          disabled
          className="w-full rounded-lg border border-neutral-200 bg-neutral-100 px-4 py-2.5 text-right text-sm text-neutral-500"
        />
      </div>

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
          className="w-full rounded-lg border border-neutral-200 bg-neutral-100 px-4 py-2.5 text-right text-sm text-neutral-500"
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
          className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-right text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
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
          className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-right text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
      </div>

      <div>
        <label
          htmlFor="marital_status"
          className="mb-1.5 block text-sm font-medium text-neutral-800"
        >
          الحالة الاجتماعية (اختياري)
        </label>
        <select
          id="marital_status"
          name="marital_status"
          defaultValue={maritalStatus ?? ""}
          className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        >
          <option value="">غير محدد</option>
          {Object.entries(maritalStatusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="education_level"
          className="mb-1.5 block text-sm font-medium text-neutral-800"
        >
          المؤهل الدراسي (اختياري)
        </label>
        <select
          id="education_level"
          name="education_level"
          defaultValue={educationLevel ?? ""}
          className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        >
          <option value="">غير محدد</option>
          {Object.entries(educationLevelLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="employment_status"
          className="mb-1.5 block text-sm font-medium text-neutral-800"
        >
          الحالة المهنية (اختياري)
        </label>
        <select
          id="employment_status"
          name="employment_status"
          defaultValue={employmentStatus ?? ""}
          className="w-full rounded-lg border border-neutral-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        >
          <option value="">غير محدد</option>
          {Object.entries(employmentStatusLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
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
