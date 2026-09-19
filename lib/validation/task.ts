import * as z from "zod";

const emptyToUndefined = (v: unknown) => (v === "" ? undefined : v);

export const TaskFormSchema = z.object({
  id: z.string().trim().optional(),
  title: z.string().trim().min(2, "الرجاء إدخال عنوان المهمة."),
  description: z.preprocess(emptyToUndefined, z.string().trim().optional()),
  assignee_id: z.preprocess(emptyToUndefined, z.string().trim().optional()),
  status: z.enum(["todo", "in_progress", "done"]),
  due_date: z.preprocess(emptyToUndefined, z.string().trim().optional()),
});

export type TaskFormState = { error?: string; success?: boolean } | undefined;
