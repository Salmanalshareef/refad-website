"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { sql } from "@/lib/db";
import { ProfileFormSchema, type ProfileFormState } from "@/lib/validation/profile";

export async function updateProfile(
  _prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const session = await requireUser();

  const validatedFields = ProfileFormSchema.safeParse({
    phone: formData.get("phone"),
    email: formData.get("email"),
    marital_status: formData.get("marital_status"),
    education_level: formData.get("education_level"),
    employment_status: formData.get("employment_status"),
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0]?.message };
  }

  const { phone, email, marital_status, education_level, employment_status } =
    validatedFields.data;

  try {
    await sql`
      UPDATE profiles
      SET phone = ${phone}, marital_status = ${marital_status ?? null},
          education_level = ${education_level ?? null},
          employment_status = ${employment_status ?? null}
      WHERE id = ${session.sub}
    `;
    await sql`
      UPDATE users
      SET email = ${email ?? null}
      WHERE id = ${session.sub}
    `;
  } catch {
    return { error: "تعذر حفظ التغييرات، تأكد من أن رقم الجوال أو البريد الإلكتروني غير مستخدم من قبل." };
  }

  revalidatePath("/portal/profile");
  return { success: true };
}
