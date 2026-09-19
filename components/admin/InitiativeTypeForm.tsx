"use client";

import { useActionState, useRef, useState } from "react";
import { saveInitiativeType } from "@/app/actions/admin/initiative-types";
import { useSaveOutcome } from "@/lib/use-save-outcome";
import { Button } from "@/components/shared/Button";
import { InitiativeIcon } from "@/components/shared/InitiativeIcon";
import type { InitiativeType } from "@/types/db";

export function InitiativeTypeForm({
  type,
  onDone,
}: {
  type?: InitiativeType;
  onDone?: () => void;
}) {
  const [state, action, pending] = useActionState(saveInitiativeType, undefined);
  const { showSaved } = useSaveOutcome(state, onDone);
  const [previewUrl, setPreviewUrl] = useState(type?.icon ?? null);
  const [removeIcon, setRemoveIcon] = useState(false);
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

  return (
    <form action={action} className="grid gap-3 sm:grid-cols-2">
      {type && <input type="hidden" name="id" value={type.id} />}
      <input type="hidden" name="current_icon_url" value={type?.icon ?? ""} />
      <input type="hidden" name="remove_icon" value={removeIcon ? "true" : "false"} />

      <input
        name="title"
        placeholder="اسم النوع (مثال: الدعم الاجتماعي)"
        defaultValue={type?.title}
        required
        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
      />
      <input
        name="order_index"
        type="number"
        placeholder="الترتيب"
        defaultValue={type?.order_index ?? 0}
        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
      />
      <textarea
        name="description"
        placeholder="وصف مختصر يظهر للزوار على الموقع العام (اختياري)"
        defaultValue={type?.description ?? ""}
        rows={2}
        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm sm:col-span-2"
      />

      <div className="sm:col-span-2">
        <label className="mb-1.5 block text-xs font-medium text-neutral-600">
          أيقونة النوع (SVG أو PNG أو WebP)
        </label>
        <div className="flex items-center gap-3">
          <div className="image-plate flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-neutral-200">
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

      {state?.error && (
        <p className="text-sm font-medium text-red-600 sm:col-span-2">{state.error}</p>
      )}
      {showSaved && (
        <p className="text-sm font-medium text-primary-700 sm:col-span-2">تم الحفظ بنجاح.</p>
      )}

      <div className="flex gap-2 sm:col-span-2">
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
