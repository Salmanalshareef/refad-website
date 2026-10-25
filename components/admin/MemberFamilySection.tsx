"use client";

import { useActionState, useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  addChild,
  addSpouse,
  deleteChild,
  deleteSpouse,
} from "@/app/actions/admin/member-family";
import { Button } from "@/components/shared/Button";
import { HijriDateInput } from "@/components/shared/HijriDateInput";
import type { FamilyMember, Gender, Spouse } from "@/types/db";

type Child = Pick<FamilyMember, "id" | "full_name" | "gender" | "is_living">;

const inputClasses =
  "w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500";

function RemoveButton({
  onRemove,
  label,
}: {
  onRemove: () => Promise<{ error?: string } | void>;
  label: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <>
      <button
        type="button"
        aria-label={label}
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            setError(null);
            const result = await onRemove();
            if (result && "error" in result && result.error) setError(result.error);
          })
        }
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
      >
        <Trash2 className="h-4 w-4" />
      </button>
      {error && (
        <p className="w-full text-xs font-medium leading-relaxed text-red-600">{error}</p>
      )}
    </>
  );
}

/**
 * Spouses and children, entered against the member's family tree record.
 *
 * Deliberately not part of the profile form above it. That form saves the
 * member's own details in one submit; these are lists that grow an entry at a
 * time, and folding them into the same submit would mean a half-typed spouse
 * blocking a phone number correction.
 */
export function MemberFamilySection({
  familyMemberId,
  parentGender,
  spouses,
  offspring,
}: {
  /** Null when the account has no tree record matched to it. */
  familyMemberId: string | null;
  parentGender: Gender | null;
  spouses: Spouse[];
  /** Named offspring because "children" is reserved as a JSX prop. */
  offspring: Child[];
}) {
  const [spouseState, spouseAction, spousePending] = useActionState(addSpouse, undefined);
  const [childState, childAction, childPending] = useActionState(addChild, undefined);
  const [showSpouseForm, setShowSpouseForm] = useState(false);
  const [showChildForm, setShowChildForm] = useState(false);

  if (!familyMemberId) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-4">
        <h3 className="text-sm font-semibold text-neutral-700">عائلة العضو</h3>
        <p className="mt-1.5 text-xs leading-relaxed text-neutral-500">
          لا يمكن إضافة أفراد العائلة قبل ربط الحساب بسجله في شجرة الأسرة. يتم
          الربط برقم الهوية الوطنية من صفحة أفراد الأسرة.
        </p>
      </div>
    );
  }

  const motherOnly = parentGender === "female";

  return (
    <div className="space-y-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
      <div>
        <h3 className="text-sm font-semibold text-neutral-700">عائلة العضو</h3>
        <p className="mt-1 text-xs leading-relaxed text-neutral-500">
          تُحفظ هذه البيانات في شجرة الأسرة، وتظهر للعضو في تبويب «عائلتي» للاطلاع
          فقط.
          {motherOnly &&
            " الأبناء المضافون لعضوة يظهرون في عائلتها فقط، إذ إن الشجرة تعرض خط الآباء."}
        </p>
      </div>

      {/* ── Spouses ────────────────────────────────────────────────────── */}
      <div>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-xs font-semibold text-neutral-600">
            الأزواج / الزوجات ({spouses.length})
          </h4>
          <button
            type="button"
            onClick={() => setShowSpouseForm((open) => !open)}
            className="inline-flex items-center gap-1 rounded-lg border border-primary-200 px-2.5 py-1.5 text-xs font-semibold text-primary-700 hover:bg-primary-50"
          >
            <Plus className="h-3.5 w-3.5" />
            إضافة زوج / زوجة
          </button>
        </div>

        {spouses.length > 0 && (
          <ul className="mb-2 divide-y divide-neutral-200 overflow-hidden rounded-lg border border-neutral-200 bg-white">
            {spouses.map((spouse) => (
              <li key={spouse.id} className="flex flex-wrap items-center gap-2 px-3 py-2">
                <span className="min-w-0 flex-1 text-sm text-neutral-800">
                  {spouse.full_name}
                </span>
                <span className="shrink-0 text-xs text-neutral-500">
                  {spouse.relation === "husband" ? "زوج" : "زوجة"}
                </span>
                {spouse.national_id && (
                  <span dir="ltr" className="shrink-0 text-xs text-neutral-500">
                    {spouse.national_id}
                  </span>
                )}
                <RemoveButton
                  label={`حذف ${spouse.full_name}`}
                  onRemove={() => deleteSpouse(spouse.id)}
                />
              </li>
            ))}
          </ul>
        )}

        {showSpouseForm && (
          <form action={spouseAction} className="grid gap-2 sm:grid-cols-[auto_1fr_1fr_auto]">
            <input type="hidden" name="member_id" value={familyMemberId} />
            {/* Defaults to the opposite of the member's own sex, which is right
                nearly always and is still a choice rather than an assumption. */}
            <select
              name="relation"
              defaultValue={motherOnly ? "husband" : "wife"}
              className={inputClasses}
            >
              <option value="wife">زوجة</option>
              <option value="husband">زوج</option>
            </select>
            <input
              name="full_name"
              placeholder="اسم الزوج / الزوجة"
              required
              className={inputClasses}
            />
            <input
              name="national_id"
              dir="ltr"
              inputMode="numeric"
              placeholder="رقم الهوية (اختياري)"
              className={inputClasses + " text-right"}
            />
            <Button type="submit" disabled={spousePending} className="px-4 py-2 text-xs">
              {spousePending ? "جارٍ الحفظ..." : "حفظ"}
            </Button>
            {spouseState?.error && (
              <p className="text-xs font-medium text-red-600 sm:col-span-4">
                {spouseState.error}
              </p>
            )}
          </form>
        )}
      </div>

      {/* ── Children ───────────────────────────────────────────────────── */}
      <div className="border-t border-neutral-200 pt-4">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-xs font-semibold text-neutral-600">
            الأبناء والبنات ({offspring.length})
          </h4>
          <button
            type="button"
            onClick={() => setShowChildForm((open) => !open)}
            className="inline-flex items-center gap-1 rounded-lg border border-primary-200 px-2.5 py-1.5 text-xs font-semibold text-primary-700 hover:bg-primary-50"
          >
            <Plus className="h-3.5 w-3.5" />
            إضافة ابن / ابنة
          </button>
        </div>

        {offspring.length > 0 && (
          <ul className="mb-2 divide-y divide-neutral-200 overflow-hidden rounded-lg border border-neutral-200 bg-white">
            {offspring.map((child) => (
              <li key={child.id} className="flex flex-wrap items-center gap-2 px-3 py-2">
                <span className="min-w-0 flex-1 text-sm text-neutral-800">
                  {child.full_name}
                </span>
                <span className="shrink-0 text-xs text-neutral-500">
                  {child.gender === "female" ? "ابنة" : "ابن"}
                </span>
                <RemoveButton
                  label={`حذف ${child.full_name}`}
                  onRemove={() => deleteChild(child.id)}
                />
              </li>
            ))}
          </ul>
        )}

        {showChildForm && (
          <form action={childAction} className="grid gap-2 sm:grid-cols-2">
            <input type="hidden" name="member_id" value={familyMemberId} />
            <input
              name="full_name"
              placeholder="اسم الابن / الابنة"
              required
              className={inputClasses + " sm:col-span-2"}
            />
            <select name="gender" defaultValue="male" className={inputClasses}>
              <option value="male">ذكر</option>
              <option value="female">أنثى</option>
            </select>
            <HijriDateInput
              id={`child_birth_${familyMemberId}`}
              name="birth_date"
              label="تاريخ الميلاد"
              optional
            />
            <Button
              type="submit"
              disabled={childPending}
              className="px-4 py-2 text-xs sm:col-span-2"
            >
              {childPending ? "جارٍ الحفظ..." : "حفظ"}
            </Button>
            {childState?.error && (
              <p className="text-xs font-medium text-red-600 sm:col-span-2">
                {childState.error}
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
