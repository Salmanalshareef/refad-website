import * as z from "zod";

export const BoardMemberFormSchema = z.object({
  id: z.string().trim().optional(),
  full_name: z.string().trim().min(2, "الرجاء إدخال الاسم الكامل."),
  role_title: z.string().trim().min(2, "الرجاء إدخال المسمى الوظيفي."),
  bio: z.string().trim().optional(),
  order_index: z.coerce.number().int().default(0),
});

export type BoardMemberFormState = { error?: string; success?: boolean } | undefined;
