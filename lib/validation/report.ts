import * as z from "zod";

export const ReportFormSchema = z.object({
  type: z.enum(["financial", "performance", "minutes"]),
  title: z.string().trim().min(2, "الرجاء إدخال عنوان التقرير."),
  period_label: z.string().trim().optional(),
  published_date: z.string().trim().min(1, "الرجاء تحديد تاريخ النشر."),
});

export type ReportFormState = { error?: string; success?: boolean } | undefined;
