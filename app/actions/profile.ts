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
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0]?.message };
  }

  const { phone, email } = validatedFields.data;

  try {
    await sql`
      UPDATE profiles
      SET phone = ${phone}
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
