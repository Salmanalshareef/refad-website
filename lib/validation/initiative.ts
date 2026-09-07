import * as z from "zod";

const emptyToUndefined = (v: unknown) => (v === "" ? undefined : v);

export const InitiativeFormSchema = z.object({
  id: z.string().trim().optional(),
  initiative_type_id: z.string().trim().min(1, "الرجاء اختيار نوع المبادرة."),
  title: z.string().trim().min(2, "الرجاء إدخال عنوان الخدمة."),
  description: z.string().trim().min(5, "الرجاء إدخال وصف الخدمة."),
  requirements: z.preprocess(emptyToUndefined, z.string().trim().optional()),
  order_index: z.coerce.number().int().default(0),
});

export type InitiativeFormState = { error?: string } | undefined;
