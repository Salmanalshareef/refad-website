"use client";

import { useActionState, useRef, useState } from "react";
import { updateProfile } from "@/app/actions/profile";
import { Button } from "@/components/shared/Button";
import { MemberPhoto } from "@/components/shared/MemberPhoto";
import { formatHijriDisplay } from "@/lib/hijri";
import {
  educationLevelLabels,
  employmentStatusLabels,
  maritalStatusLabels,
} from "@/lib/labels/profile";
import type { EducationLevel, EmploymentStatus, MaritalStatus } from "@/types/db";

// Comfortably under the 8mb Server Action body limit in next.config.ts, which
// also has to carry the multipart overhead and the rest of the form.
const MAX_AVATAR_BYTES = 6 * 1024 * 1024;

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
  avatarUrl,
  showBirthDate,
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
  avatarUrl: string | null;
  showBirthDate: boolean;
}) {
  const [state, action, pending] = useActionState(updateProfile, undefined);
  const [preview, setPreview] = useState(avatarUrl);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <form action={action} className="max-w-lg space-y-5">
      <input type="hidden" name="current_avatar_url" value={avatarUrl ?? ""} />
      <input type="hidden" name="remove_avatar" value={removeAvatar ? "true" : "false"} />

      <div>
        <label className="mb-1.5 block text-sm font-medium text-neutral-800">
          الصورة الشخصية (اختياري)
        </label>
        <p className="mb-2 text-xs text-neutral-500">
          تظهر صورتك في بطاقتك داخل شجرة الأسرة.
        </p>
        <div className="flex items-center gap-4">
          <MemberPhoto src={preview} size={72} />
          <div className="flex-1">
            <input
              ref={fileInputRef}
              name="avatar_file"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                // Caught here so an oversized photo gets a readable message
                // rather than a Server Action that fails on the body limit.
                if (file.size > MAX_AVATAR_BYTES) {
                  setAvatarError(
                    "حجم الصورة كبير جدًا. الحد الأقصى 6 ميجابايت."
                  );
                  setPreview(avatarUrl);
                  e.target.value = "";
                  return;
                }
                setAvatarError(null);
                setPreview(URL.createObjectURL(file));
                setRemoveAvatar(false);
              }}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
          {preview && (
            <button
              type="button"
              onClick={() => {
                setPreview(null);
                setRemoveAvatar(true);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
            >
              إزالة
            </button>
          )}
        </div>
        {avatarError && (
          <p className="mt-2 text-sm font-medium text-red-600">{avatarError}</p>
        )}
      </div>

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

        <label className="mt-2 flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2.5">
          <span className="text-sm text-neutral-800">
            إظهار تاريخ ميلادي في شجرة الأسرة
            <span className="block text-xs text-neutral-500">
              عند الإيقاف لن يظهر تاريخ ميلادك لأفراد الأسرة.
            </span>
          </span>
          <span className="relative inline-flex shrink-0">
            <input
              type="checkbox"
              name="show_birth_date"
              defaultChecked={showBirthDate}
              className="peer sr-only"
            />
            <span className="h-6 w-11 rounded-full bg-neutral-300 transition-colors peer-checked:bg-primary-600" />
            <span className="pointer-events-none absolute top-0.5 start-0.5 h-5 w-5 rounded-full bg-neutral-50 shadow-sm transition-transform peer-checked:-translate-x-5 rtl:peer-checked:translate-x-[-1.25rem]" />
          </span>
        </label>
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
