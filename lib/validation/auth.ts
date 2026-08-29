import * as z from "zod";

export const LoginFormSchema = z.object({
  phone: z.string().trim().min(1, "الرجاء إدخال رقم الجوال."),
  password: z.string().min(1, "الرجاء إدخال كلمة المرور."),
});

export type LoginFormState =
  | {
      error?: string;
    }
  | undefined;

export const ForgotPasswordFormSchema = z.object({
  phone: z.string().trim().min(1, "الرجاء إدخال رقم الجوال."),
});

export type ForgotPasswordFormState =
  | {
      error?: string;
      success?: boolean;
    }
  | undefined;
