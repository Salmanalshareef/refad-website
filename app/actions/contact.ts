"use server";

import { sql } from "@/lib/db";
import {
  RATE_LIMITS,
  getClientIp,
  isRateLimited,
  recordAttempt,
} from "@/lib/rate-limit";
import { ContactFormSchema, type ContactFormState } from "@/lib/validation/contact";

export async function submitContactMessage(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const validatedFields = ContactFormSchema.safeParse({
    full_name: formData.get("full_name"),
    mobile: formData.get("mobile"),
    subject: formData.get("subject"),
    message: formData.get("message"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  // Anyone can reach this form, and every submission lands in an inbox an
  // admin reads by hand. The attempt is recorded before the insert, so
  // hammering the endpoint counts even when the write itself fails.
  const ip = await getClientIp();
  if (await isRateLimited(RATE_LIMITS.contactByIp, ip)) {
    return {
      success: false,
      message: "تم إرسال عدد كبير من الرسائل. يرجى المحاولة بعد قليل.",
    };
  }
  await recordAttempt(RATE_LIMITS.contactByIp, ip);

  const { full_name, mobile, subject, message } = validatedFields.data;

  try {
    await sql`
      INSERT INTO contact_messages (full_name, mobile, subject, message)
      VALUES (${full_name}, ${mobile}, ${subject}, ${message})
    `;

    return { success: true, message: "تم إرسال رسالتك بنجاح، سنتواصل معك قريبًا." };
  } catch {
    return {
      success: false,
      message: "تعذر إرسال الرسالة حاليًا. يرجى المحاولة لاحقًا أو التواصل عبر البريد الإلكتروني.",
    };
  }
}
