"use client";

import { useActionState } from "react";
import { saveVideo } from "@/app/actions/admin/videos";
import { useSaveOutcome } from "@/lib/use-save-outcome";
import { Button } from "@/components/shared/Button";
import type { Video } from "@/types/db";

export function VideoForm({ video, onDone }: { video?: Video; onDone?: () => void }) {
  const [state, action, pending] = useActionState(saveVideo, undefined);
  const { showSaved } = useSaveOutcome(state, onDone);

  return (
    <form action={action} className="grid gap-3 sm:grid-cols-2">
      {video && <input type="hidden" name="id" value={video.id} />}
      <input
        name="title"
        placeholder="عنوان الفيديو"
        defaultValue={video?.title}
        required
        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
      />
      <input
        name="published_date"
        type="date"
        defaultValue={video?.published_date}
        required
        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
      />
      <input
        name="video_url"
        dir="ltr"
        placeholder="رابط الفيديو (YouTube أو Vimeo)"
        defaultValue={video?.video_url}
        required
        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm sm:col-span-2"
      />
      <input
        name="description"
        placeholder="وصف مختصر (اختياري)"
        defaultValue={video?.description ?? ""}
        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm sm:col-span-2"
      />

      {state?.error && (
        <p className="text-sm font-medium text-red-600 sm:col-span-2">{state.error}</p>
      )}
      {showSaved && (
        <p className="text-sm font-medium text-primary-700 sm:col-span-2">تم الحفظ بنجاح.</p>
      )}

      <div className="flex gap-2 sm:col-span-2">
        <Button type="submit" disabled={pending} className="px-4! py-2! text-xs">
          {pending ? "جارٍ الحفظ..." : video ? "حفظ التعديلات" : "إضافة فيديو"}
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
