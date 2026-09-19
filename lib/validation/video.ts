import * as z from "zod";

const emptyToUndefined = (v: unknown) => (v === "" ? undefined : v);

export const VideoFormSchema = z.object({
  id: z.string().trim().optional(),
  title: z.string().trim().min(2, "الرجاء إدخال عنوان الفيديو."),
  description: z.preprocess(emptyToUndefined, z.string().trim().optional()),
  video_url: z.url("الرجاء إدخال رابط فيديو صحيح."),
  published_date: z.string().trim().min(1, "الرجاء تحديد تاريخ النشر."),
});

export type VideoFormState = { error?: string; success?: boolean } | undefined;
