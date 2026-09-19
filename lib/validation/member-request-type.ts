import * as z from "zod";

const emptyToUndefined = (v: unknown) => (v === "" || v == null ? undefined : v);

export const MemberRequestFieldKindSchema = z.enum([
  "text",
  "number",
  "long_text",
  "applicant_name",
]);

export const MemberRequestFieldInputSchema = z.object({
  label: z.string().trim().min(1, "الرجاء إدخال اسم الحقل."),
  kind: MemberRequestFieldKindSchema,
  applicant_name_index: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().min(1).max(4).optional()
  ),
  is_required: z.boolean(),
});

export const MemberRequestTypeFormSchema = z.object({
  id: z.string().trim().optional(),
  title: z.string().trim().min(2, "الرجاء إدخال اسم نوع الطلب."),
  notice: z.preprocess(emptyToUndefined, z.string().trim().optional()),
  collects_attachment: z.preprocess((v) => v === "on" || v === true, z.boolean()),
  order_index: z.coerce.number().int().default(0),
  fields: z.array(MemberRequestFieldInputSchema),
});

export type MemberRequestFieldInput = z.infer<typeof MemberRequestFieldInputSchema>;
export type MemberRequestTypeFormState = { error?: string } | undefined;
