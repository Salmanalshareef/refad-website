"use server";

import { sql } from "@/lib/db";
import {
  RegistrationRequestFormSchema,
  type RegistrationRequestFormState,
} from "@/lib/validation/registration-request";

export async function submitRegistrationRequest(
  _prevState: RegistrationRequestFormState,
  formData: FormData
): Promise<RegistrationRequestFormState> {
  const validatedFields = RegistrationRequestFormSchema.safeParse({
    first_name: formData.get("first_name"),
    second_name: formData.get("second_name"),
    third_name: formData.get("third_name"),
    fourth_name: formData.get("fourth_name"),
    national_id: formData.get("national_id"),
    gender: formData.get("gender"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    birth_date: formData.get("birth_date"),
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0]?.message };
  }

  const { first_name, second_name, third_name, fourth_name, national_id, gender, phone, email, birth_date } =
    validatedFields.data;
  const full_name = [first_name, second_name, third_name, fourth_name].join(" ");

  try {
    await sql`
      INSERT INTO registration_requests (full_name, national_id, gender, phone, email, birth_date)
      VALUES (${full_name}, ${national_id}, ${gender}, ${phone}, ${email ?? null}, ${birth_date})
    `;
  } catch {
    return { error: "تعذر إرسال الطلب، حاول مرة أخرى." };
  }

  return { success: true };
}
