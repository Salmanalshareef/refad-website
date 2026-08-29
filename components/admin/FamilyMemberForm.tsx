"use client";

import { useActionState, useState } from "react";
import { saveFamilyMember } from "@/app/actions/admin/family-members";
import { Button } from "@/components/shared/Button";
import { HijriYearInput } from "@/components/shared/HijriYearInput";
import type { FamilyMemberWithProfile } from "@/types/db";

export function FamilyMemberForm({
  member,
  allMembers,
  onDone,
}: {
  member?: FamilyMemberWithProfile;
  allMembers: FamilyMemberWithProfile[];
  onDone?: () => void;
}) {
  const [state, action, pending] = useActionState(saveFamilyMember, undefined);
  const [isLiving, setIsLiving] = useState(member?.is_living ?? true);
  const [fatherId, setFatherId] = useState(member?.father_id ?? "");
  const candidateParents = allMembers.filter((m) => m.id !== member?.id);
  const isMember = Boolean(member?.profile_id);

  const nameParts = member?.full_name.trim().split(/\s+/) ?? [];
  const [firstName, secondName, thirdName] = nameParts;
  const fourthName = nameParts.slice(3).join(" ") || nameParts[3];

  const selectedFather = candidateParents.find((m) => m.id === fatherId);

  return (
    <form action={action} className="grid gap-3 sm:grid-cols-2">
      {member && <input type="hidden" name="id" value={member.id} />}
      <input
        name="first_name"
        placeholder="الاسم الأول"
        defaultValue={firstName ?? ""}
        required
        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
      />
      <input
        name="second_name"
        placeholder="الاسم الثاني"
        defaultValue={secondName ?? ""}
        required
        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
      />
      <input
        name="third_name"
        placeholder="الاسم الثالث"
        defaultValue={thirdName ?? ""}
        required
        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
      />
      <input
        name="fourth_name"
        placeholder="الاسم الرابع"
        defaultValue={fourthName ?? ""}
        required
        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
      />
      <input
        name="national_id"
        placeholder="رقم الهوية الوطنية (لربط الحساب لاحقًا)"
        dir="ltr"
        inputMode="numeric"
        maxLength={10}
        defaultValue={member?.national_id ?? ""}
        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
      />
      <select
        name="gender"
        defaultValue={member?.gender ?? "male"}
        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm sm:col-span-2"
      >
        <option value="male">ذكر</option>
        <option value="female">أنثى</option>
      </select>
      <select
        name="is_living"
        value={String(isLiving)}
        onChange={(e) => setIsLiving(e.target.value === "true")}
        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm sm:col-span-2"
      >
        <option value="true">حي</option>
        <option value="false">متوفى</option>
      </select>
      <div className="grid gap-2 sm:col-span-2">
        {isMember ? (
          <HijriYearInput
            id="birth_date"
            name="birth_date"
            label="تاريخ الميلاد"
            defaultValue={member?.profile_birth_date}
            readOnly
          />
        ) : (
          <HijriYearInput
            id="birth_date"
            name="birth_date"
            label="تاريخ الميلاد"
            defaultValue={member?.birth_date}
          />
        )}
        <HijriYearInput
          id="death_date"
          name="death_date"
          label="تاريخ الوفاة"
          defaultValue={member?.death_date}
          disabled={isLiving}
        />
      </div>
      <select
        name="father_id"
        value={fatherId}
        onChange={(e) => setFatherId(e.target.value)}
        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
      >
        <option value="">بدون أب محدد</option>
        {candidateParents.map((m) => (
          <option key={m.id} value={m.id}>
            {m.full_name}
          </option>
        ))}
      </select>
      <input
        value={selectedFather?.national_id ?? ""}
        disabled
        placeholder="رقم هوية الأب — يظهر تلقائيًا إذا كان مسجلاً"
        dir="ltr"
        className="rounded-lg border border-neutral-200 bg-neutral-100 px-3 py-2 text-sm text-neutral-500"
      />
      <input
        name="mother_name"
        placeholder="اسم الأم"
        defaultValue={member?.mother_name ?? ""}
        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm sm:col-span-2"
      />

      {state?.error && (
        <p className="text-sm font-medium text-red-600 sm:col-span-2">{state.error}</p>
      )}

      <div className="flex gap-2 sm:col-span-2">
        <Button type="submit" disabled={pending} className="px-4! py-2! text-xs">
          {pending ? "جارٍ الحفظ..." : member ? "حفظ التعديلات" : "إضافة فرد"}
        </Button>
        {onDone && (
          <Button type="button" variant="ghost" onClick={onDone} className="px-4! py-2! text-xs">
            إلغاء
          </Button>
        )}
      </div>
    </form>
  );
}
