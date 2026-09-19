import * as z from "zod";

// A conditionally-rendered input is absent from FormData entirely, so
// formData.get() yields null rather than "". Both mean "not provided".
const emptyToUndefined = (v: unknown) => (v === "" || v == null ? undefined : v);
const optionalText = z.preprocess(emptyToUndefined, z.string().trim().optional());

export const InitiativeFormSchema = z
  .object({
    id: z.string().trim().optional(),
    initiative_type_id: z.string().trim().min(1, "الرجاء اختيار نوع المبادرة."),
    title: z.string().trim().min(2, "الرجاء إدخال عنوان الخدمة."),
    description: z.string().trim().min(5, "الرجاء إدخال وصف الخدمة."),
    requirements: optionalText,
    date_mode: z.enum(["single", "period"]).default("period"),
    start_date: optionalText,
    end_date: optionalText,
    age_group: optionalText,
    target_audience: optionalText,
    file_label: optionalText,
    // A pasted link. An uploaded file bypasses this and is validated by type.
    file_link: z.preprocess(
      (val) => (val === "" || val == null ? undefined : val),
      z
        .string()
        .trim()
        .url("الرجاء إدخال رابط صحيح يبدأ بـ http أو https.")
        .optional()
    ),
    order_index: z.coerce.number().int().default(0),
  })
  // A "single" initiative has one date and no period; a "period" one has both
  // ends. Clearing the unused field keeps stale values from a mode switch out
  // of the database, where they would otherwise still drive the display.
  .transform((data) =>
    data.date_mode === "single"
      ? { ...data, end_date: undefined }
      : data
  )
  .superRefine((data, ctx) => {
    if (data.date_mode === "single") {
      if (!data.start_date) {
        ctx.addIssue({
          code: "custom",
          path: ["start_date"],
          message: "الرجاء إدخال تاريخ المبادرة.",
        });
      }
      return;
    }

    if (!data.start_date || !data.end_date) {
      ctx.addIssue({
        code: "custom",
        path: ["start_date"],
        message: "الرجاء إدخال تاريخ بداية ونهاية فترة التقديم.",
      });
      return;
    }

    if (data.end_date < data.start_date) {
      ctx.addIssue({
        code: "custom",
        path: ["end_date"],
        message: "تاريخ النهاية يجب أن يكون بعد تاريخ البداية.",
      });
    }
  });

export type InitiativeFormState = { error?: string; success?: boolean } | undefined;
