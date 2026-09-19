"use client";

import { useState } from "react";
import { ClipboardList, Pencil } from "lucide-react";
import { TaskForm } from "@/components/admin/TaskForm";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteTask } from "@/app/actions/admin/tasks";
import { taskStatusLabels, taskStatusStyles } from "@/lib/labels/tasks";
import type { Profile, TaskWithAssignee } from "@/types/db";

export function TaskRow({
  task,
  assignees,
}: {
  task: TaskWithAssignee;
  assignees: Profile[];
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <div className="rounded-xl border border-primary-200 bg-primary-50/40 p-4">
        <TaskForm task={task} assignees={assignees} onDone={() => setEditing(false)} />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50 p-4">
      <div className="flex items-center gap-3">
        <ClipboardList className="h-5 w-5 shrink-0 text-primary-700" />
        <div>
          <p className="font-medium text-primary-900">
            {task.title}
            <span
              className={`ms-2 rounded-full px-2 py-0.5 text-xs font-semibold ${taskStatusStyles[task.status]}`}
            >
              {taskStatusLabels[task.status]}
            </span>
          </p>
          <p className="text-xs text-neutral-500">
            {task.assignee_name ?? "غير مُسندة"}
            {task.due_date ? ` — يستحق في ${task.due_date}` : ""}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-primary-700 hover:bg-primary-50"
        >
          <Pencil className="h-3.5 w-3.5" />
          تعديل
        </button>
        <DeleteButton action={() => deleteTask(task.id)} />
      </div>
    </div>
  );
}
