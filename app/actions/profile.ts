"use server";

import { revalidatePath } from "next/cache";
import { put, del } from "@vercel/blob";
import { requireUser } from "@/lib/auth";
import { sql } from "@/lib/db";
import { ProfileFormSchema, type ProfileFormState } from "@/lib/validation/profile";

const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function updateProfile(
  _prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const session = await requireUser();

  const validatedFields = ProfileFormSchema.safeParse({
    phone: formData.get("phone"),
    show_birth_date: formData.get("show_birth_date"),
    email: formData.get("email"),
    marital_status: formData.get("marital_status"),
    education_level: formData.get("education_level"),
    employment_status: formData.get("employment_status"),
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0]?.message };
  }

  const { phone, email, marital_status, education_level, employment_status, show_birth_date } =
    validatedFields.data;

  const currentAvatarUrl = (formData.get("current_avatar_url") as string) || null;
  const removeAvatar = formData.get("remove_avatar") === "true";
  const avatarFile = formData.get("avatar_file");

  let avatarUrl: string | null = currentAvatarUrl;

  if (avatarFile instanceof File && avatarFile.size > 0) {
    if (!ALLOWED_AVATAR_TYPES.includes(avatarFile.type)) {
      return { error: "صيغة الصورة غير مدعومة. الرجاء رفع JPEG أو PNG أو WebP." };
    }
    try {
      const blob = await put(
        `profile-avatars/${crypto.randomUUID()}-${avatarFile.name}`,
        avatarFile,
        { access: "public" }
      );
      avatarUrl = blob.url;
    } catch {
      return { error: "تعذر رفع الصورة." };
    }
    if (currentAvatarUrl) {
      await del(currentAvatarUrl).catch(() => {});
    }
  } else if (removeAvatar) {
    if (currentAvatarUrl) {
      await del(currentAvatarUrl).catch(() => {});
    }
    avatarUrl = null;
  }

  try {
    await sql`
      UPDATE profiles
      SET phone = ${phone}, marital_status = ${marital_status ?? null},
          education_level = ${education_level ?? null},
          employment_status = ${employment_status ?? null},
          avatar_url = ${avatarUrl}, show_birth_date = ${show_birth_date}
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
  // The photo surfaces on the family tree cards too.
  revalidatePath("/portal/family-tree");
  return { success: true };
}
