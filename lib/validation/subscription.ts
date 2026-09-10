import * as z from "zod";

const emptyToUndefined = (v: unknown) => (v === "" ? undefined : v);

export const SubscriptionRequestFormSchema = z.object({
  amount: z.coerce.number().positive("الرجاء إدخال مبلغ صحيح."),
  notes: z.preprocess(emptyToUndefined, z.string().trim().optional()),
});

export type SubscriptionRequestFormState =
  | { error?: string; success?: boolean }
  | undefined;

export const SubscriptionEditFormSchema = z.object({
  id: z.string().trim().min(1),
  amount: z.coerce.number().positive("الرجاء إدخال مبلغ صحيح."),
  requested_date: z.string().trim().min(1, "الرجاء تحديد تاريخ التقديم."),
});

export type SubscriptionEditFormState = { error?: string } | undefined;

export const AdminCreateSubscriptionFormSchema = z.object({
  profile_id: z.string().trim().min(1, "الرجاء اختيار العضو."),
  amount: z.coerce.number().positive("الرجاء إدخال مبلغ صحيح."),
  fiscal_year: z.coerce.number().int().min(1900, "الرجاء إدخال سنة مالية صحيحة."),
  requested_date: z.string().trim().min(1, "الرجاء تحديد تاريخ التقديم."),
  status: z.enum(["pending", "active"]),
  notes: z.preprocess(emptyToUndefined, z.string().trim().optional()),
});

export type AdminCreateSubscriptionFormState =
  | { error?: string; success?: boolean }
  | undefined;

export const BankInfoFormSchema = z.object({
  account_name: z.string().trim().min(1, "الرجاء إدخال اسم الحساب."),
  bank_name: z.string().trim().min(1, "الرجاء إدخال اسم البنك."),
  account_number: z.string().trim().min(1, "الرجاء إدخال رقم الحساب."),
  iban: z.string().trim().min(1, "الرجاء إدخال رقم الآيبان."),
});

export type BankInfoFormState = { error?: string } | undefined;
