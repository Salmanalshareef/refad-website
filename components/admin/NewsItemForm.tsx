"use client";

import { useActionState, useRef, useState } from "react";
import { newsAudienceLabels, newsAudienceOptions } from "@/lib/labels/news";
import Image from "next/image";
import { Newspaper } from "lucide-react";
import { saveNewsItem } from "@/app/actions/admin/news";
import { newsCategoryLabels } from "@/lib/labels/news";
import { Button } from "@/components/shared/Button";
import type { NewsItem } from "@/types/db";

export function NewsItemForm({
  item,
  defaultCategory,
  onDone,
}: {
  item?: NewsItem;
  defaultCategory: "family" | "fund";
  onDone?: () => void;
}) {
  const [state, action, pending] = useActionState(saveNewsItem, undefined);
  const [previewUrl, setPreviewUrl] = useState(item?.image_url ?? null);
  const [removeImage, setRemoveImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    setRemoveImage(false);
  }

  function handleRemove() {
    setPreviewUrl(null);
    setRemoveImage(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <form action={action} className="grid gap-3 sm:grid-cols-2">
      {item && <input type="hidden" name="id" value={item.id} />}
      <input type="hidden" name="category" value={item?.category ?? defaultCategory} />
      <input type="hidden" name="current_image_url" value={item?.image_url ?? ""} />
      <input type="hidden" name="remove_image" value={removeImage ? "true" : "false"} />
      <input
        name="title"
        placeholder="عنوان الخبر"
        defaultValue={item?.title}
        required
        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm sm:col-span-2"
      />
      <input
        name="published_date"
        type="date"
        defaultValue={item?.published_date}
        required
        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
      />
      <label className="flex items-center gap-2 text-sm text-neutral-700">
        <span className="shrink-0 text-xs font-medium text-neutral-600">النشر</span>
        <select
          name="audience"
          defaultValue={item?.audience ?? "site_and_members"}
          className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        >
          {newsAudienceOptions.map((audience) => (
            <option key={audience} value={audience}>
              {newsAudienceLabels[audience]}
            </option>
          ))}
        </select>
      </label>
      <textarea
        name="body"
        placeholder="نص الخبر"
        defaultValue={item?.body}
        required
        rows={3}
        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm sm:col-span-2"
      />

      <div className="sm:col-span-2">
        <label className="mb-1.5 block text-xs font-medium text-neutral-600">
          صورة الخبر (اختياري — JPEG أو PNG أو WebP)
        </label>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-400">
            {previewUrl ? (
              <Image
                src={previewUrl}
                alt=""
                width={64}
                height={48}
                unoptimized
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <Newspaper className="h-5 w-5" />
            )}
          </div>
          <input
            ref={fileInputRef}
            name="image_file"
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

      <div className="flex gap-2 sm:col-span-2">
        <Button type="submit" disabled={pending} className="px-4! py-2! text-xs">
          {pending ? "جارٍ الحفظ..." : item ? "حفظ التعديلات" : `إضافة خبر (${newsCategoryLabels[defaultCategory]})`}
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
