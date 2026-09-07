"use client";

import { useActionState } from "react";
import { saveInitiative } from "@/app/actions/admin/initiatives";
import { Button } from "@/components/shared/Button";
import type { Initiative, InitiativeType } from "@/types/db";

export function InitiativeForm({
  initiative,
  types,
  onDone,
}: {
  initiative?: Initiative;
  types: InitiativeType[];
  onDone?: () => void;
}) {
  const [state, action, pending] = useActionState(saveInitiative, undefined);

  if (types.length === 0) {
    return (
      <p className="text-sm text-neutral-600">
        لا توجد أنواع مبادرات بعد. الرجاء إضافة نوع مبادرة أولًا من صفحة{" "}
        <a href="/portal/admin/initiative-types" className="font-medium text-primary-700 hover:underline">
          أنواع المبادرات
        </a>
        .
      </p>
    );
  }

  return (
    <form action={action} className="grid gap-3 sm:grid-cols-2">
      {initiative && <input type="hidden" name="id" value={initiative.id} />}
      <select
        name="initiative_type_id"
        defaultValue={initiative?.initiative_type_id ?? types[0].id}
        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
      >
        {types.map((type) => (
          <option key={type.id} value={type.id}>
            {type.title}
          </option>
        ))}
      </select>
      <input
        name="order_index"
        type="number"
        placeholder="الترتيب"
        defaultValue={initiative?.order_index ?? 0}
        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
      />
      <input
        name="title"
        placeholder="عنوان الخدمة"
        defaultValue={initiative?.title}
        required
        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm sm:col-span-2"
      />
      <textarea
        name="description"
        placeholder="الوصف"
        defaultValue={initiative?.description}
        required
        rows={2}
        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm sm:col-span-2"
      />
      <textarea
        name="requirements"
        placeholder="المتطلبات (اختياري)"
        defaultValue={initiative?.requirements ?? ""}
        rows={2}
        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm sm:col-span-2"
      />

      {state?.error && (
        <p className="text-sm font-medium text-red-600 sm:col-span-2">{state.error}</p>
      )}

      <div className="flex gap-2 sm:col-span-2">
        <Button type="submit" disabled={pending} className="px-4! py-2! text-xs">
          {pending ? "جارٍ الحفظ..." : initiative ? "حفظ التعديلات" : "إضافة خدمة"}
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
