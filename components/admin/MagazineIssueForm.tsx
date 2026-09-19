"use client";

import { useActionState } from "react";
import { createMagazineIssue } from "@/app/actions/admin/magazine";
import { useSaveOutcome } from "@/lib/use-save-outcome";
import { Button } from "@/components/shared/Button";

export function MagazineIssueForm() {
  const [state, action, pending] = useActionState(createMagazineIssue, undefined);
  const { showSaved } = useSaveOutcome(state);

  return (
    <form action={action} className="grid gap-3 sm:grid-cols-2">
      <input
        name="title"
        placeholder="عنوان العدد"
        required
        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
      />
      <input
        name="published_date"
        type="date"
        required
        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
      />
      <input
        name="issue_label"
        placeholder="رقم العدد (اختياري)"
        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm sm:col-span-2"
      />
      <input
        name="file"
        type="file"
        accept="application/pdf"
        required
        className="text-sm sm:col-span-2"
      />

      {state?.error && (
        <p className="text-sm font-medium text-red-600 sm:col-span-2">{state.error}</p>
      )}
      {showSaved && (
        <p className="text-sm font-medium text-primary-700 sm:col-span-2">تم الحفظ بنجاح.</p>
      )}

      <div className="sm:col-span-2">
        <Button type="submit" disabled={pending} className="px-4! py-2! text-xs">
          {pending ? "جارٍ الرفع..." : "رفع العدد"}
        </Button>
      </div>
    </form>
  );
}
