"use server";

import { revalidatePath } from "next/cache";
import { put, del } from "@vercel/blob";
import { requireAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import { MagazineIssueFormSchema, type MagazineIssueFormState } from "@/lib/validation/magazine";

export async function createMagazineIssue(
  _prevState: MagazineIssueFormState,
  formData: FormData
): Promise<MagazineIssueFormState> {
  await requireAdmin();

  const validatedFields = MagazineIssueFormSchema.safeParse({
    title: formData.get("title"),
    issue_label: formData.get("issue_label") || undefined,
    published_date: formData.get("published_date"),
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0]?.message };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "الرجاء اختيار ملف المجلة (PDF)." };
  }

  const { title, issue_label, published_date } = validatedFields.data;

  let fileUrl: string;
  try {
    const blob = await put(`magazine/${crypto.randomUUID()}-${file.name}`, file, {
      access: "public",
    });
    fileUrl = blob.url;
  } catch {
    return { error: "تعذر رفع الملف." };
  }

  try {
    await sql`
      INSERT INTO magazine_issues (title, issue_label, published_date, file_url)
      VALUES (${title}, ${issue_label ?? null}, ${published_date}, ${fileUrl})
    `;
  } catch {
    return { error: "تعذر حفظ بيانات المجلة." };
  }

  revalidatePath("/portal/admin/media/magazine");
  revalidatePath("/media-center");
  return { success: true };
}

export async function toggleMagazineIssuePublished(id: string, isPublished: boolean) {
  await requireAdmin();
  await sql`UPDATE magazine_issues SET is_published = ${isPublished} WHERE id = ${id}`;

  revalidatePath("/portal/admin/media/magazine");
  revalidatePath("/media-center");
}

export async function deleteMagazineIssue(id: string, fileUrl: string) {
  await requireAdmin();

  await del(fileUrl).catch(() => {});
  await sql`DELETE FROM magazine_issues WHERE id = ${id}`;

  revalidatePath("/portal/admin/media/magazine");
  revalidatePath("/media-center");
}
