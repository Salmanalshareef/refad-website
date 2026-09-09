import * as z from "zod";
import { NationalIdSchema } from "@/lib/validation/profile";

const emptyToUndefined = (v: unknown) => (v === "" ? undefined : v);

export const CreateMemberFormSchema = z.object({
  full_name: z.string().trim().min(2, "الرجاء إدخال الاسم الكامل."),
  national_id: z.preprocess(emptyToUndefined, NationalIdSchema.optional()),
  phone: z.string().trim().min(9, "الرجاء إدخال رقم جوال صحيح."),
  email: z.preprocess(emptyToUndefined, z.email("الرجاء إدخال بريد إلكتروني صحيح.").optional()),
  password: z.string().min(8, "يجب أن تتكون كلمة المرور من 8 أحرف على الأقل."),
});

export const EditMemberFormSchema = z.object({
  full_name: z.string().trim().min(2, "الرجاء إدخال الاسم الكامل."),
  national_id: z.preprocess(emptyToUndefined, NationalIdSchema.optional()),
  gender: z.preprocess(emptyToUndefined, z.enum(["male", "female"]).optional()),
  birth_date: z.preprocess(emptyToUndefined, z.string().optional()),
  phone: z.string().trim().min(9, "الرجاء إدخال رقم جوال صحيح."),
  email: z.preprocess(emptyToUndefined, z.email("الرجاء إدخال بريد إلكتروني صحيح.").optional()),
});

export type MemberFormState = { error?: string } | undefined;
