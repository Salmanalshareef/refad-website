"use client";

import { useActionState, useRef, useState } from "react";
import { saveBoardMember } from "@/app/actions/admin/board";
import { useSaveOutcome } from "@/lib/use-save-outcome";
import { Button } from "@/components/shared/Button";
import { MemberPhoto } from "@/components/shared/MemberPhoto";
import type { BoardMember } from "@/types/db";

export function BoardMemberForm({
  member,
  onDone,
}: {
  member?: BoardMember;
  onDone?: () => void;
}) {
  const [state, action, pending] = useActionState(saveBoardMember, undefined);
  const { showSaved } = useSaveOutcome(state, onDone);
  const [previewUrl, setPreviewUrl] = useState(member?.photo_url ?? null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    setRemovePhoto(false);
  }

  function handleRemove() {
    setPreviewUrl(null);
    setRemovePhoto(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <form action={action} className="grid gap-3 sm:grid-cols-2">
      {member && <input type="hidden" name="id" value={member.id} />}
      <input type="hidden" name="current_photo_url" value={member?.photo_url ?? ""} />
      <input type="hidden" name="remove_photo" value={removePhoto ? "true" : "false"} />

      <input
        name="full_name"
        placeholder="الاسم الكامل"
        defaultValue={member?.full_name}
        required
        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
      />
      <input
        name="role_title"
        placeholder="المسمى الوظيفي"
        defaultValue={member?.role_title}
        required
        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
      />
      <input
        name="order_index"
        type="number"
        placeholder="الترتيب"
        defaultValue={member?.order_index ?? 0}
        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
      />
      <input
        name="bio"
        placeholder="نبذة (اختياري)"
        defaultValue={member?.bio ?? ""}
        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
      />

      <div className="sm:col-span-2">
        <label className="mb-1.5 block text-xs font-medium text-neutral-600">
          الصورة الشخصية (JPEG أو PNG أو WebP)
        </label>
        <div className="flex items-center gap-3">
          <MemberPhoto src={previewUrl} size={48} />
          <input
            ref={fileInputRef}
            name="photo_file"
            type="file"
            accept="image/jpeg,image/png,image/webp"
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
          {pending ? "جارٍ الحفظ..." : member ? "حفظ التعديلات" : "إضافة عضو"}
        </Button>
        {onDone && (
          <Button
            type="button"
            variant="ghost"
            onClick={onDone}
            className="px-4! py-2! text-xs"
          >
            إلغاء
          </Button>
        )}
      </div>
    </form>
  );
}
