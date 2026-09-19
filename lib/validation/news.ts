import * as z from "zod";

export const NewsItemFormSchema = z.object({
  id: z.string().trim().optional(),
  category: z.enum(["family", "fund"]),
  title: z.string().trim().min(2, "الرجاء إدخال عنوان الخبر."),
  body: z.string().trim().min(5, "الرجاء إدخال نص الخبر."),
  published_date: z.string().trim().min(1, "الرجاء تحديد تاريخ النشر."),
  audience: z.enum(["none", "site_and_members", "members_only"]),
});

export type NewsItemFormState = { error?: string; success?: boolean } | undefined;
