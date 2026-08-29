import * as z from "zod";

const emptyToUndefined = (v: unknown) => (v === "" ? undefined : v);

export const ProfileFormSchema = z.object({
  phone: z.string().trim().min(9, "الرجاء إدخال رقم جوال صحيح."),
  email: z.preprocess(emptyToUndefined, z.email("الرجاء إدخال بريد إلكتروني صحيح.").optional()),
});

export const NationalIdSchema = z
  .string()
  .trim()
  .regex(/^\d{10}$/, "رقم الهوية الوطنية يجب أن يتكون من 10 أرقام.");

export type ProfileFormState =
  | {
      error?: string;
      success?: boolean;
    }
  | undefined;
