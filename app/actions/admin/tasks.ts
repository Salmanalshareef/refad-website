"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import { TaskFormSchema, type TaskFormState } from "@/lib/validation/task";

export async function saveTask(
  _prevState: TaskFormState,
  formData: FormData
): Promise<TaskFormState> {
  await requireAdmin();

  const validatedFields = TaskFormSchema.safeParse({
    id: formData.get("id") || undefined,
    title: formData.get("title"),
    description: formData.get("description"),
    assignee_id: formData.get("assignee_id"),
    status: formData.get("status"),
    due_date: formData.get("due_date"),
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0]?.message };
  }

  const { id, title, description, assignee_id, status, due_date } = validatedFields.data;

  try {
    if (id) {
      await sql`
        UPDATE tasks
        SET title = ${title}, description = ${description ?? null},
            assignee_id = ${assignee_id ?? null}, status = ${status},
            due_date = ${due_date ?? null}
        WHERE id = ${id}
      `;
    } else {
      await sql`
        INSERT INTO tasks (title, description, assignee_id, status, due_date)
        VALUES (${title}, ${description ?? null}, ${assignee_id ?? null}, ${status}, ${due_date ?? null})
      `;
    }
  } catch {
    return { error: "تعذر حفظ المهمة." };
  }

  revalidatePath("/portal/admin/tasks");
  return { success: true };
}

export async function deleteTask(id: string) {
  await requireAdmin();
  await sql`DELETE FROM tasks WHERE id = ${id}`;

  revalidatePath("/portal/admin/tasks");
}
