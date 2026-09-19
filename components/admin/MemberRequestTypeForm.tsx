"use client";

import { useActionState, useState } from "react";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { saveMemberRequestType } from "@/app/actions/admin/member-request-types";
import { Button } from "@/components/shared/Button";
import type { MemberRequestFieldKind, MemberRequestTypeWithFields } from "@/types/db";

type FieldRow = {
  uid: string;
  label: string;
  kind: MemberRequestFieldKind;
  applicant_name_index: number;
  is_required: boolean;
};

const KIND_OPTIONS: { value: MemberRequestFieldKind; label: string }[] = [
  { value: "text", label: "نص" },
  { value: "number", label: "أرقام فقط" },
  { value: "long_text", label: "نص طويل" },
  { value: "applicant_name", label: "يُعبأ تلقائيًا" },
];

const inputClasses = "rounded-lg border border-neutral-300 px-3 py-2 text-sm";

function newRow(): FieldRow {
  return {
    uid: crypto.randomUUID(),
    label: "",
    kind: "text",
    applicant_name_index: 1,
    is_required: true,
  };
}

export function MemberRequestTypeForm({
  type,
  onDone,
}: {
  type?: MemberRequestTypeWithFields;
  onDone?: () => void;
}) {
  const [state, action, pending] = useActionState(saveMemberRequestType, undefined);
  const [rows, setRows] = useState<FieldRow[]>(
    () =>
      type?.fields.map((field) => ({
        uid: field.id,
        label: field.label,
        kind: field.kind,
        applicant_name_index: field.applicant_name_index ?? 1,
        is_required: field.is_required,
      })) ?? [newRow()]
  );

  const update = (uid: string, patch: Partial<FieldRow>) =>
    setRows((current) => current.map((r) => (r.uid === uid ? { ...r, ...patch } : r)));

  const move = (index: number, delta: number) =>
    setRows((current) => {
      const next = [...current];
      const target = index + delta;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  return (
    <form action={action} className="space-y-4">
      {type && <input type="hidden" name="id" value={type.id} />}

      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-neutral-600">
            اسم نوع الطلب
          </label>
          <input
            name="title"
            defaultValue={type?.title ?? ""}
            placeholder="مثال: طلب إفادة"
            required
            className={"w-full " + inputClasses}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-neutral-600">الترتيب</label>
          <input
            name="order_index"
            type="number"
            defaultValue={type?.order_index ?? 0}
            className={"w-24 " + inputClasses}
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-neutral-600">
          تنبيه يظهر للعضو (اختياري)
        </label>
        <textarea
          name="notice"
          defaultValue={type?.notice ?? ""}
          rows={2}
          placeholder="نص إرشادي يظهر في صندوق ملاحظة أعلى النموذج"
          className={"w-full " + inputClasses}
        />
      </div>

      <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-medium text-neutral-600">حقول هذا النوع</p>
          <button
            type="button"
            onClick={() => setRows((current) => [...current, newRow()])}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-primary-700 hover:bg-primary-50"
          >
            <Plus className="h-3.5 w-3.5" />
            إضافة حقل
          </button>
        </div>

        {rows.length === 0 && (
          <p className="py-2 text-xs text-neutral-500">
            لا توجد حقول — سيقتصر الطلب على المرفق إن كان مفعّلًا.
          </p>
        )}

        <div className="space-y-2">
          {rows.map((row, index) => (
            <div
              key={row.uid}
              className="flex flex-wrap items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 p-2"
            >
              <button
                type="button"
                aria-label="تحريك لأعلى"
                onClick={() => move(index, -1)}
                className="cursor-grab rounded p-1 text-neutral-300 hover:bg-neutral-100 hover:text-neutral-600"
              >
                <GripVertical className="h-4 w-4" />
              </button>
              <span className="w-5 shrink-0 text-xs text-neutral-400">{index + 1}</span>

              <input
                name="field_label"
                value={row.label}
                onChange={(e) => update(row.uid, { label: e.target.value })}
                placeholder="اسم الحقل، مثال: اسم الأم"
                required
                className={"min-w-40 flex-1 " + inputClasses}
              />

              <select
                name="field_kind"
                value={row.kind}
                onChange={(e) =>
                  update(row.uid, { kind: e.target.value as MemberRequestFieldKind })
                }
                className={inputClasses}
              >
                {KIND_OPTIONS.map((kind) => (
                  <option key={kind.value} value={kind.value}>
                    {kind.label}
                  </option>
                ))}
              </select>

              {/* Submitted for every row so the parallel arrays stay aligned. */}
              <input
                type="hidden"
                name="field_applicant_index"
                value={row.kind === "applicant_name" ? row.applicant_name_index : ""}
              />
              <input
                type="hidden"
                name="field_required"
                value={row.kind === "applicant_name" ? "false" : String(row.is_required)}
              />

              {row.kind === "applicant_name" ? (
                <select
                  value={row.applicant_name_index}
                  onChange={(e) =>
                    update(row.uid, { applicant_name_index: Number(e.target.value) })
                  }
                  className={inputClasses}
                >
                  <option value={1}>الاسم الأول لمقدّم الطلب</option>
                  <option value={2}>الاسم الثاني لمقدّم الطلب</option>
                  <option value={3}>الاسم الثالث لمقدّم الطلب</option>
                  <option value={4}>الاسم الرابع لمقدّم الطلب</option>
                </select>
              ) : (
                <label className="flex items-center gap-1.5 text-xs text-neutral-700">
                  <input
                    type="checkbox"
                    checked={row.is_required}
                    onChange={(e) => update(row.uid, { is_required: e.target.checked })}
                  />
                  مطلوب
                </label>
              )}

              <button
                type="button"
                aria-label="حذف الحقل"
                onClick={() => setRows((current) => current.filter((r) => r.uid !== row.uid))}
                className="rounded-lg p-1.5 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <label className="flex items-start gap-2 rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-800">
        <input
          type="checkbox"
          name="collects_attachment"
          defaultChecked={type?.collects_attachment ?? false}
          className="mt-1"
        />
        <span>
          السماح بإرفاق ملف
          <span className="block text-xs text-neutral-500">
            صورة أو ملف PDF اختياري — منفصل عن الحقول النصية أعلاه
          </span>
        </span>
      </label>

      {state?.error && <p className="text-sm font-medium text-red-600">{state.error}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={pending} className="px-4! py-2! text-xs">
          {pending ? "جارٍ الحفظ..." : type ? "حفظ التعديلات" : "إضافة نوع"}
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
