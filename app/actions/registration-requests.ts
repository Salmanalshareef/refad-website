"use server";

import { sql } from "@/lib/db";
import { hashPassword } from "@/lib/password";
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
    password: formData.get("password"),
    confirm_password: formData.get("confirm_password"),
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0]?.message };
  }

  const {
    first_name,
    second_name,
    third_name,
    fourth_name,
    national_id,
    gender,
    phone,
    email,
    birth_date,
    password,
  } = validatedFields.data;
  const full_name = [first_name, second_name, third_name, fourth_name].join(" ");
  const passwordHash = await hashPassword(password);

  try {
    await sql`
      INSERT INTO registration_requests (full_name, national_id, gender, phone, email, birth_date, password_hash)
      VALUES (${full_name}, ${national_id}, ${gender}, ${phone}, ${email ?? null}, ${birth_date}, ${passwordHash})
    `;
  } catch {
    return { error: "تعذر إرسال الطلب، حاول مرة أخرى." };
  }

  return { success: true };
}
