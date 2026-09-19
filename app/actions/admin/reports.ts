"use server";

import { revalidatePath } from "next/cache";
import { put, del } from "@vercel/blob";
import { requireAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import { ReportFormSchema, type ReportFormState } from "@/lib/validation/report";

export async function createReport(
  _prevState: ReportFormState,
  formData: FormData
): Promise<ReportFormState> {
  await requireAdmin();

  const validatedFields = ReportFormSchema.safeParse({
    type: formData.get("type"),
    title: formData.get("title"),
    period_label: formData.get("period_label") || undefined,
    published_date: formData.get("published_date"),
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0]?.message };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "الرجاء اختيار ملف التقرير (PDF)." };
  }

  const { type, title, period_label, published_date } = validatedFields.data;

  let fileUrl: string;
  try {
    const blob = await put(`reports/${type}/${crypto.randomUUID()}-${file.name}`, file, {
      access: "public",
    });
    fileUrl = blob.url;
  } catch {
    return { error: "تعذر رفع الملف." };
  }

  try {
    await sql`
      INSERT INTO reports (type, title, period_label, published_date, file_url)
      VALUES (${type}, ${title}, ${period_label ?? null}, ${published_date}, ${fileUrl})
    `;
  } catch {
    return { error: "تعذر حفظ بيانات التقرير." };
  }

  revalidatePath("/portal/admin/reports");
  revalidatePath("/refad-fund/reports");
  return { success: true };
}

export async function deleteReport(id: string, fileUrl: string) {
  await requireAdmin();

  await del(fileUrl).catch(() => {});
  await sql`DELETE FROM reports WHERE id = ${id}`;

  revalidatePath("/portal/admin/reports");
  revalidatePath("/refad-fund/reports");
}
