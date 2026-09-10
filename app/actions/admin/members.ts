"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import {
  CreateMemberFormSchema,
  EditMemberFormSchema,
  type MemberFormState,
} from "@/lib/validation/member";

export async function createMember(
  _prevState: MemberFormState,
  formData: FormData
): Promise<MemberFormState> {
  await requireAdmin();

  const validatedFields = CreateMemberFormSchema.safeParse({
    full_name: formData.get("full_name"),
    national_id: formData.get("national_id"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0]?.message };
  }

  const { full_name, national_id, phone, email, password } = validatedFields.data;
  const passwordHash = await hashPassword(password);

  let userId: string;
  try {
    const rows = (await sql`
      INSERT INTO users (email, password_hash)
      VALUES (${email ?? null}, ${passwordHash})
      RETURNING id
    `) as { id: string }[];
    userId = rows[0].id;
  } catch {
    return { error: "تعذر إنشاء الحساب. تأكد من أن البريد الإلكتروني غير مستخدم." };
  }

  try {
    await sql`
      INSERT INTO profiles (id, full_name, national_id, phone, role)
      VALUES (${userId}, ${full_name}, ${national_id ?? null}, ${phone}, 'member')
    `;
  } catch {
    await sql`DELETE FROM users WHERE id = ${userId}`;
    return { error: "تعذر إنشاء الملف الشخصي للعضو. تأكد من أن رقم الجوال غير مستخدم من قبل عضو آخر." };
  }

  // Link this new account to a matching family-tree entry, if one was
  // added by ID number before this account existed.
  if (national_id) {
    await sql`
      UPDATE family_members
      SET profile_id = ${userId}
      WHERE national_id = ${national_id} AND profile_id IS NULL
    `;
  }

  revalidatePath("/portal/admin/members");
  revalidatePath("/portal/admin/family-members");
  revalidatePath("/portal/family-tree");
  return undefined;
}

export async function updateMemberProfile(
  _prevState: MemberFormState,
  formData: FormData
): Promise<MemberFormState> {
  await requireAdmin();

  const id = formData.get("id");
  if (typeof id !== "string" || !id) {
    return { error: "تعذر تحديد العضو." };
  }

  const validatedFields = EditMemberFormSchema.safeParse({
    full_name: formData.get("full_name"),
    national_id: formData.get("national_id"),
    gender: formData.get("gender"),
    birth_date: formData.get("birth_date"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    marital_status: formData.get("marital_status"),
    education_level: formData.get("education_level"),
    employment_status: formData.get("employment_status"),
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0]?.message };
  }

  const {
    full_name,
    national_id,
    gender,
    birth_date,
    phone,
    email,
    marital_status,
    education_level,
    employment_status,
  } = validatedFields.data;

  try {
    await sql`
      UPDATE profiles
      SET full_name = ${full_name}, national_id = ${national_id ?? null},
          gender = ${gender ?? null}, birth_date = ${birth_date ?? null}, phone = ${phone},
          marital_status = ${marital_status ?? null}, education_level = ${education_level ?? null},
          employment_status = ${employment_status ?? null}
      WHERE id = ${id}
    `;
    await sql`
      UPDATE users
      SET email = ${email ?? null}
      WHERE id = ${id}
    `;
  } catch {
    return { error: "تعذر حفظ التغييرات، تأكد من أن رقم الجوال أو البريد الإلكتروني غير مستخدم." };
  }

  revalidatePath("/portal/admin/members");
  return undefined;
}

export async function updateMemberRole(id: string, role: "member" | "admin") {
  await requireAdmin();
  await sql`UPDATE profiles SET role = ${role} WHERE id = ${id}`;

  revalidatePath("/portal/admin/members");
  revalidatePath("/portal/admin/administrators");
}

export async function deleteMember(id: string) {
  await requireAdmin();
  // profiles.id references users(id) on delete cascade
  await sql`DELETE FROM users WHERE id = ${id}`;

  revalidatePath("/portal/admin/members");
  revalidatePath("/portal/admin/administrators");
}
