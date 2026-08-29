"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import {
  FamilyMemberFormSchema,
  type FamilyMemberFormState,
} from "@/lib/validation/family-member";

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

  try {
    if (id) {
      await sql`
        UPDATE family_members
        SET full_name = ${full_name}, national_id = ${national_id ?? null}, gender = ${gender},
            birth_date = ${birth_date ?? null}, death_date = ${effectiveDeathDate}, is_living = ${is_living},
            father_id = ${father_id ?? null}, mother_name = ${mother_name ?? null}
        WHERE id = ${id}
      `;
    } else {
      await sql`
        INSERT INTO family_members (full_name, national_id, gender, birth_date, death_date, is_living, father_id, mother_name)
        VALUES (${full_name}, ${national_id ?? null}, ${gender}, ${birth_date ?? null}, ${effectiveDeathDate}, ${is_living}, ${father_id ?? null}, ${mother_name ?? null})
      `;
    }
  } catch {
    return { error: "تعذر حفظ البيانات." };
  }

  revalidatePath("/portal/admin/family-members");
  revalidatePath("/portal/family-tree");
  return undefined;
}

export async function deleteFamilyMember(id: string) {
  await requireAdmin();
  await sql`DELETE FROM family_members WHERE id = ${id}`;

  revalidatePath("/portal/admin/family-members");
  revalidatePath("/portal/family-tree");
}
