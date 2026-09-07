import * as z from "zod";

export const SupportRequestFormSchema = z.object({
  draft_id: z.string().trim().min(1),
  initiative_id: z.string().trim().min(1, "الرجاء اختيار الخدمة الفرعية."),
  terms_accepted: z.literal("on", { message: "يجب الموافقة على الشروط والأحكام." }),
});

export type SupportRequestFormState =
  | {
      error?: string;
      success?: boolean;
      requestNumber?: number;
    }
  | undefined;
