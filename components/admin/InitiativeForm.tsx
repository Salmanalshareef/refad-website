"use client";

import { useActionState, useRef, useState } from "react";
import { saveInitiative } from "@/app/actions/admin/initiatives";
import { Button } from "@/components/shared/Button";
import { InitiativeIcon } from "@/components/shared/InitiativeIcon";
import type { Initiative, InitiativeDateMode, InitiativeType } from "@/types/db";

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
  const [previewUrl, setPreviewUrl] = useState(initiative?.icon ?? null);
  const [removeIcon, setRemoveIcon] = useState(false);
  const [dateMode, setDateMode] = useState<InitiativeDateMode>(
    initiative?.date_mode ?? "period"
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    setRemoveIcon(false);
  }

  function handleRemove() {
    setPreviewUrl(null);
    setRemoveIcon(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

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
      <input type="hidden" name="current_icon_url" value={initiative?.icon ?? ""} />
      <input type="hidden" name="remove_icon" value={removeIcon ? "true" : "false"} />
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

      <div className="sm:col-span-2">
        <label className="mb-1.5 block text-xs font-medium text-neutral-600">
          أيقونة الخدمة (SVG أو PNG أو WebP)
        </label>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 text-primary-700">
            <InitiativeIcon src={previewUrl} size={28} />
          </div>
          <input
            ref={fileInputRef}
            name="icon_file"
            type="file"
            accept="image/svg+xml,image/png,image/webp"
            onChange={handleFileChange}
            className="flex-1 text-sm"
          />
          {previewUrl && (
            <button
              type="button"
              onClick={handleRemove}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
            >
              إزالة
            </button>
          )}
        </div>
      </div>
      <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 sm:col-span-2">
        <p className="mb-2 text-xs font-medium text-neutral-600">التاريخ</p>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-1.5 text-sm text-neutral-800">
            <input
              type="radio"
              name="date_mode"
              value="single"
              checked={dateMode === "single"}
              onChange={() => setDateMode("single")}
            />
            تاريخ محدد للمبادرة
          </label>
          <label className="flex items-center gap-1.5 text-sm text-neutral-800">
            <input
              type="radio"
              name="date_mode"
              value="period"
              checked={dateMode === "period"}
              onChange={() => setDateMode("period")}
            />
            فترة تقديم (من - إلى)
          </label>
        </div>

        <div className="mt-3 flex flex-wrap gap-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-neutral-600">
              {dateMode === "single" ? "تاريخ المبادرة" : "بداية فترة التقديم"}
            </label>
            <input
              name="start_date"
              type="date"
              defaultValue={initiative?.start_date ?? ""}
              className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
          {dateMode === "period" && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-neutral-600">
                نهاية فترة التقديم
              </label>
              <input
                name="end_date"
                type="date"
                defaultValue={initiative?.end_date ?? ""}
                className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
              />
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-neutral-600">
          الفئة العمرية (اختياري)
        </label>
        <input
          name="age_group"
          defaultValue={initiative?.age_group ?? ""}
          placeholder="مثال: من 18 إلى 25 سنة"
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-neutral-600">
          الفئة المستهدفة (اختياري)
        </label>
        <input
          name="target_audience"
          defaultValue={initiative?.target_audience ?? ""}
          placeholder="مثال: طلاب الجامعات"
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>

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
