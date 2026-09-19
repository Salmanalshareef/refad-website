import * as z from "zod";

export const MagazineIssueFormSchema = z.object({
  title: z.string().trim().min(2, "الرجاء إدخال عنوان العدد."),
  issue_label: z.string().trim().optional(),
  published_date: z.string().trim().min(1, "الرجاء تحديد تاريخ النشر."),
});

export type MagazineIssueFormState = { error?: string; success?: boolean } | undefined;
