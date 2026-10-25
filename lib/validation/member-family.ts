import * as z from "zod";
import { NationalIdSchema } from "@/lib/validation/profile";

const emptyToUndefined = (v: unknown) => (v === "" || v == null ? undefined : v);

export const AddSpouseSchema = z.object({
  member_id: z.string().trim().min(1),
  full_name: z.string().trim().min(2, "الرجاء إدخال اسم الزوج أو الزوجة."),
  // Optional because a spouse who married in from another family often has no
  // record here at all, and a name is enough to say who she is.
  national_id: z.preprocess(emptyToUndefined, NationalIdSchema.optional()),
});

export const AddChildSchema = z.object({
  member_id: z.string().trim().min(1),
  full_name: z.string().trim().min(2, "الرجاء إدخال اسم الابن أو الابنة."),
  gender: z.enum(["male", "female"]),
  // The Hijri picker submits a Gregorian date, and an unfilled one submits
  // nothing at all rather than an empty string.
  birth_date: z.preprocess(emptyToUndefined, z.string().optional()),
});

export type MemberFamilyFormState =
  | { error?: string; success?: boolean }
  | undefined;
