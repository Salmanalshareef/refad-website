"use server";

import { revalidatePath } from "next/cache";
import { put, del } from "@vercel/blob";
import { requireAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import {
  FamilyMemberFormSchema,
  type FamilyMemberFormState,
} from "@/lib/validation/family-member";

const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function saveFamilyMember(
  _prevState: FamilyMemberFormState,
  formData: FormData
): Promise<FamilyMemberFormState> {
  await requireAdmin();

  const validatedFields = FamilyMemberFormSchema.safeParse({
    id: formData.get("id") || undefined,
    first_name: formData.get("first_name"),
    second_name: formData.get("second_name"),
    third_name: formData.get("third_name"),
    fourth_name: formData.get("fourth_name"),
    national_id: formData.get("national_id"),
    gender: formData.get("gender"),
    birth_date: formData.get("birth_date"),
    death_date: formData.get("death_date"),
    is_living: formData.get("is_living"),
    father_id: formData.get("father_id"),
    mother_name: formData.get("mother_name"),
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0]?.message };
  }

  const {
    id,
    first_name,
    second_name,
    third_name,
    fourth_name,
    national_id,
    gender,
    birth_date,
    death_date,
    is_living,
    father_id,
    mother_name,
  } = validatedFields.data;
  const full_name = [first_name, second_name, third_name, fourth_name].join(" ");

  // A living person has no death date, regardless of what was submitted.
  const effectiveDeathDate = is_living ? null : (death_date ?? null);

  const currentPhotoUrl = (formData.get("current_photo_url") as string) || null;
  const removePhoto = formData.get("remove_photo") === "true";
  const photoFile = formData.get("photo_file");

  let photoUrl: string | null = currentPhotoUrl;

  if (photoFile instanceof File && photoFile.size > 0) {
    if (!ALLOWED_PHOTO_TYPES.includes(photoFile.type)) {
      return { error: "صيغة الصورة غير مدعومة. الرجاء رفع JPEG أو PNG أو WebP." };
    }
    try {
      const blob = await put(
        `family-member-photos/${crypto.randomUUID()}-${photoFile.name}`,
        photoFile,
        { access: "public" }
      );
      photoUrl = blob.url;
    } catch {
      return { error: "تعذر رفع الصورة." };
    }
    if (currentPhotoUrl) {
      await del(currentPhotoUrl).catch(() => {});
    }
  } else if (removePhoto) {
    if (currentPhotoUrl) {
      await del(currentPhotoUrl).catch(() => {});
    }
    photoUrl = null;
  }

  try {
    if (id) {
      await sql`
        UPDATE family_members
        SET full_name = ${full_name}, national_id = ${national_id ?? null}, gender = ${gender},
            birth_date = ${birth_date ?? null}, death_date = ${effectiveDeathDate}, is_living = ${is_living},
            father_id = ${father_id ?? null}, mother_name = ${mother_name ?? null},
            photo_url = ${photoUrl}
        WHERE id = ${id}
      `;
    } else {
      await sql`
        INSERT INTO family_members (
          full_name, national_id, gender, birth_date, death_date, is_living,
          father_id, mother_name, photo_url
        )
        VALUES (
          ${full_name}, ${national_id ?? null}, ${gender}, ${birth_date ?? null},
          ${effectiveDeathDate}, ${is_living}, ${father_id ?? null}, ${mother_name ?? null},
          ${photoUrl}
        )
      `;
    }
  } catch {
    return { error: "تعذر حفظ البيانات." };
  }

  revalidatePath("/portal/admin/family-members");
  revalidatePath("/portal/family-tree");
  return { success: true };
}

export async function deleteFamilyMember(id: string) {
  await requireAdmin();

  const rows = (await sql`
    SELECT photo_url FROM family_members WHERE id = ${id}
  `) as { photo_url: string | null }[];
  if (rows[0]?.photo_url) {
    await del(rows[0].photo_url).catch(() => {});
  }

  await sql`DELETE FROM family_members WHERE id = ${id}`;

  revalidatePath("/portal/admin/family-members");
  revalidatePath("/portal/family-tree");
}
