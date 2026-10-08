import * as z from "zod";

/** Shared by the reset form and the in-profile change form. */
export const NewPasswordSchema = z
  .string()
  .min(8, "كلمة المرور يجب أن تتكون من 8 أحرف على الأقل.");

export const RequestResetSchema = z.object({
  phone: z.string().trim().min(1, "الرجاء إدخال رقم الجوال."),
});

export const ResetPasswordSchema = z
  .object({
    phone: z.string().trim().min(1, "الرجاء إدخال رقم الجوال."),
    code: z
      .string()
      .trim()
      .regex(/^\d{6}$/, "الرمز يتكون من 6 أرقام."),
    password: NewPasswordSchema,
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    path: ["confirm_password"],
    message: "كلمتا المرور غير متطابقتين.",
  });

export const ChangePasswordSchema = z
  .object({
    current_password: z.string().min(1, "الرجاء إدخال كلمة المرور الحالية."),
    password: NewPasswordSchema,
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    path: ["confirm_password"],
    message: "كلمتا المرور غير متطابقتين.",
  })
  .refine((data) => data.password !== data.current_password, {
    path: ["password"],
    message: "كلمة المرور الجديدة يجب أن تختلف عن الحالية.",
  });

export type RequestResetState =
  | { error?: string; success?: boolean; smsUnavailable?: boolean }
  | undefined;

export type ResetPasswordState = { error?: string; success?: boolean } | undefined;

export type ChangePasswordState = { error?: string; success?: boolean } | undefined;
