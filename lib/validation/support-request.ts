import * as z from "zod";

const emptyToUndefined = (v: unknown) => (v === "" ? undefined : v);

export const SupportRequestFormSchema = z.object({
  draft_id: z.string().trim().min(1),
  initiative_id: z.string().trim().min(1, "الرجاء اختيار الخدمة الفرعية."),
  description: z.preprocess(emptyToUndefined, z.string().trim().optional()),
  terms_accepted: z.literal("on", { message: "يجب الموافقة على الشروط والأحكام." }),
});

export type SupportRequestFormState =
  | {
      error?: string;
      success?: boolean;
      requestNumber?: number;
    }
  | undefined;
