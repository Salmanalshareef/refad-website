import * as z from "zod";
import { NationalIdSchema } from "@/lib/validation/profile";

const emptyToUndefined = (v: unknown) => (v === "" ? undefined : v);

export const FamilyMemberFormSchema = z.object({
  id: z.string().trim().optional(),
  first_name: z.string().trim().min(1, "الرجاء إدخال الاسم الأول."),
  second_name: z.string().trim().min(1, "الرجاء إدخال الاسم الثاني."),
  third_name: z.string().trim().min(1, "الرجاء إدخال الاسم الثالث."),
  fourth_name: z.string().trim().min(1, "الرجاء إدخال الاسم الرابع."),
  national_id: z.preprocess(emptyToUndefined, NationalIdSchema.optional()),
  gender: z.enum(["male", "female"]),
  birth_date: z.preprocess(emptyToUndefined, z.string().optional()),
  death_date: z.preprocess(emptyToUndefined, z.string().optional()),
  is_living: z.enum(["true", "false"]).transform((v) => v === "true"),
  father_id: z.preprocess(emptyToUndefined, z.string().optional()),
  mother_name: z.preprocess(emptyToUndefined, z.string().trim().optional()),
});

export type FamilyMemberFormState = { error?: string; success?: boolean } | undefined;
