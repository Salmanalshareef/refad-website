import * as z from "zod";
import { NationalIdSchema } from "@/lib/validation/profile";

const emptyToUndefined = (v: unknown) => (v === "" ? undefined : v);

export const RegistrationRequestFormSchema = z
  .object({
    first_name: z.string().trim().min(1, "الرجاء إدخال الاسم الأول."),
    second_name: z.string().trim().min(1, "الرجاء إدخال الاسم الثاني."),
    third_name: z.string().trim().min(1, "الرجاء إدخال الاسم الثالث."),
    fourth_name: z.string().trim().min(1, "الرجاء إدخال الاسم الرابع."),
    national_id: NationalIdSchema,
    gender: z.enum(["male", "female"], { message: "الرجاء اختيار الجنس." }),
    birth_date: z.string().min(1, "الرجاء اختيار تاريخ الميلاد."),
    phone: z.string().trim().min(9, "الرجاء إدخال رقم جوال صحيح."),
    email: z.preprocess(emptyToUndefined, z.email("الرجاء إدخال بريد إلكتروني صحيح.").optional()),
    password: z.string().min(8, "يجب أن تتكون كلمة المرور من 8 أحرف على الأقل."),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "كلمتا المرور غير متطابقتين.",
    path: ["confirm_password"],
  });

export type RegistrationRequestFormState =
  | {
      error?: string;
      success?: boolean;
    }
  | undefined;
