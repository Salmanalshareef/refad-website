"use client";

import { useActionState } from "react";
import { updateMemberProfile } from "@/app/actions/admin/members";
import { Button } from "@/components/shared/Button";
import { HijriDateInput } from "@/components/shared/HijriDateInput";
import {
  educationLevelLabels,
  employmentStatusLabels,
  maritalStatusLabels,
} from "@/lib/labels/profile";
import type { ProfileWithEmail } from "@/types/db";

export function EditMemberForm({
  profile,
  onDone,
}: {
  profile: ProfileWithEmail;
  onDone: () => void;
}) {
  const [state, action, pending] = useActionState(updateMemberProfile, undefined);

  return (
    <form action={action} className="grid gap-3 sm:grid-cols-2">
      <input type="hidden" name="id" value={profile.id} />

      <input
        name="full_name"
        placeholder="الاسم الكامل"
        defaultValue={profile.full_name}
        required
        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
      />
      <input
        name="national_id"
        placeholder="رقم الهوية الوطنية"
        dir="ltr"
        inputMode="numeric"
        maxLength={10}
        defaultValue={profile.national_id ?? ""}
        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
      />
      <select
        name="gender"
        defaultValue={profile.gender ?? ""}
        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
      >
        <option value="">الجنس (غير محدد)</option>
        <option value="male">ذكر</option>
        <option value="female">أنثى</option>
      </select>
      <input
        name="phone"
        dir="ltr"
        placeholder="رقم الجوال"
        defaultValue={profile.phone}
        required
        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
      />
      <input
        name="email"
        type="email"
        dir="ltr"
        placeholder="البريد الإلكتروني (اختياري)"
        defaultValue={profile.email ?? ""}
        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
      />
      <HijriDateInput
        id={`birth_date_${profile.id}`}
        name="birth_date"
        label="تاريخ الميلاد"
        defaultValue={profile.birth_date}
      />
      <select
        name="marital_status"
        defaultValue={profile.marital_status ?? ""}
        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
      >
        <option value="">الحالة الاجتماعية (غير محدد)</option>
        {Object.entries(maritalStatusLabels).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <select
        name="education_level"
        defaultValue={profile.education_level ?? ""}
        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
      >
        <option value="">المؤهل الدراسي (غير محدد)</option>
        {Object.entries(educationLevelLabels).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <select
        name="employment_status"
        defaultValue={profile.employment_status ?? ""}
        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm sm:col-span-2"
      >
        <option value="">الحالة المهنية (غير محدد)</option>
        {Object.entries(employmentStatusLabels).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      {state?.error && (
        <p className="text-sm font-medium text-red-600 sm:col-span-2">{state.error}</p>
      )}

      <div className="flex gap-2 sm:col-span-2">
        <Button type="submit" disabled={pending} className="px-4! py-2! text-xs">
          {pending ? "جارٍ الحفظ..." : "حفظ التعديلات"}
        </Button>
        <Button type="button" variant="ghost" onClick={onDone} className="px-4! py-2! text-xs">
          إلغاء
        </Button>
      </div>
    </form>
  );
}
