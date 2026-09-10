"use server";

import { revalidatePath } from "next/cache";
import { put } from "@vercel/blob";
import { requireUser } from "@/lib/auth";
import { sql } from "@/lib/db";
import {
  SupportRequestFormSchema,
  type SupportRequestFormState,
} from "@/lib/validation/support-request";

const ALLOWED_ATTACHMENT_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];

export async function createDraftSupportRequest() {
  const session = await requireUser();

  const rows = (await sql`
    INSERT INTO support_requests (profile_id, status)
    VALUES (${session.sub}, 'draft')
    RETURNING id, request_number
  `) as { id: string; request_number: number }[];

  return rows[0];
}

export async function deleteDraftSupportRequest(id: string) {
  const session = await requireUser();
  await sql`
    DELETE FROM support_requests
    WHERE id = ${id} AND profile_id = ${session.sub} AND status = 'draft'
  `;
}

export async function submitSupportRequest(
  _prevState: SupportRequestFormState,
  formData: FormData
): Promise<SupportRequestFormState> {
  const session = await requireUser();

  const validatedFields = SupportRequestFormSchema.safeParse({
    draft_id: formData.get("draft_id"),
    initiative_id: formData.get("initiative_id"),
    description: formData.get("description"),
    terms_accepted: formData.get("terms_accepted"),
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0]?.message };
  }

  const { draft_id, initiative_id, description } = validatedFields.data;

  let attachmentUrl: string | null = null;
  const attachmentFile = formData.get("attachment_file");
  if (attachmentFile instanceof File && attachmentFile.size > 0) {
    if (!ALLOWED_ATTACHMENT_TYPES.includes(attachmentFile.type)) {
      return { error: "صيغة المرفق غير مدعومة. الرجاء رفع PDF أو JPEG أو PNG أو WebP." };
    }
    try {
      const blob = await put(
        `support-request-attachments/${crypto.randomUUID()}-${attachmentFile.name}`,
        attachmentFile,
        { access: "public" }
      );
      attachmentUrl = blob.url;
    } catch {
      return { error: "تعذر رفع المرفق." };
    }
  }

  try {
    const rows = (await sql`
      UPDATE support_requests
      SET initiative_id = ${initiative_id}, attachment_url = ${attachmentUrl},
          description = ${description ?? null}, terms_accepted = true, status = 'pending'
      WHERE id = ${draft_id} AND profile_id = ${session.sub} AND status = 'draft'
      RETURNING request_number
    `) as { request_number: number }[];

    if (!rows[0]) {
      return { error: "انتهت صلاحية هذا الطلب، الرجاء بدء طلب جديد." };
    }

    revalidatePath("/portal/services");
    revalidatePath("/portal/services/requests");
    return { success: true, requestNumber: rows[0].request_number };
  } catch {
    return { error: "تعذر إرسال الطلب، حاول مرة أخرى." };
  }
}
