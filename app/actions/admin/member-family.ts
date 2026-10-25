"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import {
  AddChildSchema,
  AddSpouseSchema,
  type MemberFamilyFormState,
} from "@/lib/validation/member-family";

/**
 * A member's spouses and children, entered by an administrator.
 *
 * Children are written into family_members rather than into a table of their
 * own, because a child *is* a member of the family — storing them separately
 * would leave the tree and this list disagreeing about who exists. Which
 * parent column is set depends on the parent's sex, and that is the whole of
 * the difference: a father's children also appear in the tree, a mother's are
 * visible only here, because the tree is a male line.
 */

function revalidateFamilyViews() {
  revalidatePath("/portal/admin/members");
  revalidatePath("/portal/admin/family-members");
  revalidatePath("/portal/profile");
  revalidatePath("/portal/family-tree");
}

export async function addSpouse(
  _prevState: MemberFamilyFormState,
  formData: FormData
): Promise<MemberFamilyFormState> {
  await requireAdmin();

  const parsed = AddSpouseSchema.safeParse({
    member_id: formData.get("member_id"),
    full_name: formData.get("full_name"),
    national_id: formData.get("national_id"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message };
  }

  try {
    await sql`
      INSERT INTO spouses (member_id, full_name, national_id)
      VALUES (${parsed.data.member_id}, ${parsed.data.full_name}, ${parsed.data.national_id ?? null})
    `;
  } catch {
    return { error: "تعذر حفظ البيانات." };
  }

  revalidateFamilyViews();
  return { success: true };
}

export async function deleteSpouse(id: string) {
  await requireAdmin();
  await sql`DELETE FROM spouses WHERE id = ${id}`;
  revalidateFamilyViews();
}

export async function addChild(
  _prevState: MemberFamilyFormState,
  formData: FormData
): Promise<MemberFamilyFormState> {
  await requireAdmin();

  const parsed = AddChildSchema.safeParse({
    member_id: formData.get("member_id"),
    full_name: formData.get("full_name"),
    gender: formData.get("gender"),
    birth_date: formData.get("birth_date"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message };
  }

  const { member_id, full_name, gender, birth_date } = parsed.data;

  // The parent's own sex decides which link is written. Read from the database
  // rather than taken from the form: the client has no business asserting it,
  // and getting it wrong would hang the child off the wrong side of the tree.
  const parentRows = (await sql`
    SELECT gender FROM family_members WHERE id = ${member_id}
  `) as { gender: "male" | "female" }[];
  const parent = parentRows[0];
  if (!parent) {
    return { error: "تعذر العثور على سجل العضو في شجرة الأسرة." };
  }

  const fatherId = parent.gender === "male" ? member_id : null;
  const motherId = parent.gender === "female" ? member_id : null;

  try {
    await sql`
      INSERT INTO family_members (full_name, gender, birth_date, is_living, father_id, mother_id)
      VALUES (${full_name}, ${gender}, ${birth_date ?? null}, true, ${fatherId}, ${motherId})
    `;
  } catch {
    return { error: "تعذر حفظ البيانات." };
  }

  revalidateFamilyViews();
  return { success: true };
}

/**
 * Removes a child record.
 *
 * Refused where that child has children of their own: family_members.father_id
 * is ON DELETE SET NULL, so deleting a parent would quietly cut a whole branch
 * loose and strand it at the top of the tree. Removing a person with
 * descendants is a tree operation, and the family members page is where it
 * belongs, with the rest of the tree in view.
 */
export async function deleteChild(id: string) {
  await requireAdmin();

  const descendants = (await sql`
    SELECT count(*)::int AS count FROM family_members
    WHERE father_id = ${id} OR mother_id = ${id}
  `) as { count: number }[];

  if ((descendants[0]?.count ?? 0) > 0) {
    return {
      error:
        "لا يمكن حذف فرد له أبناء مسجلون. احذف أبناءه أولًا، أو عدّل السجل من صفحة أفراد الأسرة.",
    };
  }

  await sql`DELETE FROM family_members WHERE id = ${id}`;
  revalidateFamilyViews();
  return { success: true };
}
