"use client";

import { useActionState } from "react";
import { saveTask } from "@/app/actions/admin/tasks";
import { useSaveOutcome } from "@/lib/use-save-outcome";
import { taskStatusLabels } from "@/lib/labels/tasks";
import { Button } from "@/components/shared/Button";
import type { Profile, Task } from "@/types/db";

export function TaskForm({
  task,
  assignees,
  onDone,
}: {
  task?: Task;
  assignees: Profile[];
  onDone?: () => void;
}) {
  const [state, action, pending] = useActionState(saveTask, undefined);
  const { showSaved } = useSaveOutcome(state, onDone);

  return (
    <form action={action} className="grid gap-3 sm:grid-cols-2">
      {task && <input type="hidden" name="id" value={task.id} />}
      <input
        name="title"
        placeholder="عنوان المهمة"
        defaultValue={task?.title}
        required
        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm sm:col-span-2"
      />
      <textarea
        name="description"
        placeholder="وصف المهمة (اختياري)"
        defaultValue={task?.description ?? ""}
        rows={2}
        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm sm:col-span-2"
      />
      <select
        name="assignee_id"
        defaultValue={task?.assignee_id ?? ""}
        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
      >
        <option value="">غير مُسندة</option>
        {assignees.map((profile) => (
          <option key={profile.id} value={profile.id}>
            {profile.full_name}
          </option>
        ))}
      </select>
      <select
        name="status"
        defaultValue={task?.status ?? "todo"}
        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
      >
        {Object.entries(taskStatusLabels).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <input
        name="due_date"
        type="date"
        defaultValue={task?.due_date ?? ""}
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
          {pending ? "جارٍ الحفظ..." : task ? "حفظ التعديلات" : "إضافة مهمة"}
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
