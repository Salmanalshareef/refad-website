import * as z from "zod";

const emptyToUndefined = (v: unknown) => (v === "" ? undefined : v);

export const InitiativeTypeFormSchema = z.object({
  id: z.string().trim().optional(),
  title: z.string().trim().min(2, "الرجاء إدخال اسم النوع."),
  description: z.preprocess(emptyToUndefined, z.string().trim().optional()),
  order_index: z.coerce.number().int().default(0),
});

export type InitiativeTypeFormState = { error?: string; success?: boolean } | undefined;
