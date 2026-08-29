import * as z from "zod";
import { NationalIdSchema } from "@/lib/validation/profile";

const emptyToUndefined = (v: unknown) => (v === "" ? undefined : v);

export const MemberRequestFormSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("news"),
    details: z.string().trim().min(10, "الرجاء وصف الطلب بما لا يقل عن 10 أحرف."),
  }),
  z.object({
    type: z.literal("family_member"),
    first_name: z.string().trim().min(1, "الرجاء إدخال الاسم الأول."),
    second_name: z.preprocess(emptyToUndefined, z.string().trim().optional()),
    third_name: z.preprocess(emptyToUndefined, z.string().trim().optional()),
    fourth_name: z.preprocess(emptyToUndefined, z.string().trim().optional()),
    national_id: NationalIdSchema,
  }),
  z.object({
    type: z.literal("other"),
    details: z.string().trim().min(10, "الرجاء وصف الطلب بما لا يقل عن 10 أحرف."),
  }),
]);

export type MemberRequestFormState =
  | {
      error?: string;
      success?: boolean;
    }
  | undefined;
