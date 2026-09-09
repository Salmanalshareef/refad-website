"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function approveRegistrationRequest(id: string) {
  await requireAdmin();

  const rows = (await sql`
    SELECT * FROM registration_requests WHERE id = ${id} AND status = 'pending'
  `) as {
    id: string;
    full_name: string;
    national_id: string;
    gender: "male" | "female" | null;
    phone: string;
    email: string | null;
    birth_date: string | null;
    password_hash: string;
  }[];

  const request = rows[0];
  if (!request) {
    return { error: "تعذر العثور على الطلب أو أنه تمت معالجته مسبقًا." };
  }

  let userId: string;
  try {
    const created = (await sql`
      INSERT INTO users (email, password_hash)
      VALUES (${request.email}, ${request.password_hash})
      RETURNING id
    `) as { id: string }[];
    userId = created[0].id;
  } catch {
    return { error: "تعذر إنشاء الحساب. تأكد من أن البريد الإلكتروني غير مستخدم." };
  }

  try {
    await sql`
      INSERT INTO profiles (id, full_name, national_id, gender, phone, birth_date, role)
      VALUES (${userId}, ${request.full_name}, ${request.national_id}, ${request.gender}, ${request.phone}, ${request.birth_date}, 'member')
    `;
  } catch {
    await sql`DELETE FROM users WHERE id = ${userId}`;
    return { error: "تعذر إنشاء الملف الشخصي للعضو. تأكد من أن رقم الجوال غير مستخدم من قبل عضو آخر." };
  }

  // Link this new account to a matching family-tree entry, if one was
  // added by ID number before this account existed.
  await sql`
    UPDATE family_members
    SET profile_id = ${userId}
    WHERE national_id = ${request.national_id} AND profile_id IS NULL
  `;

  await sql`UPDATE registration_requests SET status = 'approved' WHERE id = ${id}`;

  revalidatePath("/portal/admin/registration-requests");
  revalidatePath("/portal/admin/members");
  revalidatePath("/portal/admin/family-members");
  revalidatePath("/portal/family-tree");
  return {};
}

export async function rejectRegistrationRequest(id: string, comment: string) {
  await requireAdmin();
  await sql`
    UPDATE registration_requests
    SET status = 'rejected', admin_comment = ${comment.trim() || null}
    WHERE id = ${id}
  `;

  revalidatePath("/portal/admin/registration-requests");
}
