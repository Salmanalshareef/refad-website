"use server";

import { revalidatePath } from "next/cache";
import { put } from "@vercel/blob";
import { requireProfile } from "@/lib/auth";
import { sql } from "@/lib/db";
import { isUuid } from "@/lib/utils";
import {
  applicantNameParts,
  fieldInputName,
  validateAnswer,
  type MemberRequestFormState,
} from "@/lib/validation/member-request";
import type {
  MemberRequestAnswer,
  MemberRequestField,
  MemberRequestTypeDef,
} from "@/types/db";

const ALLOWED_ATTACHMENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

export async function submitMemberRequest(
  _prevState: MemberRequestFormState,
  formData: FormData
): Promise<MemberRequestFormState> {
  const profile = await requireProfile();

  // The type and its fields are re-read from the database rather than trusted
  // from the form, so neither the required rules nor the availability of a
  // hidden type can be changed by the client.
  const typeId = String(formData.get("type_id") ?? "");
  if (!isUuid(typeId)) return { error: "الرجاء اختيار نوع الطلب." };

  const typeRows = (await sql`
    SELECT * FROM member_request_types WHERE id = ${typeId} AND is_published = true
  `) as MemberRequestTypeDef[];

  const type = typeRows[0];
  if (!type) return { error: "نوع الطلب غير متاح حاليًا." };

  const fields = (await sql`
    SELECT * FROM member_request_type_fields
    WHERE type_id = ${typeId}
    ORDER BY order_index ASC
  `) as MemberRequestField[];

  const nameParts = applicantNameParts(profile.full_name);
  const answers: MemberRequestAnswer[] = [];

  for (const field of fields) {
    const value =
      field.kind === "applicant_name"
        ? nameParts[(field.applicant_name_index ?? 1) - 1] ?? ""
        : String(formData.get(fieldInputName(field)) ?? "");

    const error = validateAnswer(field, value);
    if (error) return { error };

    const trimmed = value.trim();
    if (trimmed) {
      answers.push({ field_id: field.id, label: field.label, value: trimmed });
    }
  }

  let attachmentUrl: string | null = null;
  if (type.collects_attachment) {
    const file = formData.get("attachment_file");
    if (file instanceof File && file.size > 0) {
      if (!ALLOWED_ATTACHMENT_TYPES.includes(file.type)) {
        return { error: "صيغة المرفق غير مدعومة. الرجاء رفع JPEG أو PNG أو WebP أو PDF." };
      }
      try {
        const blob = await put(
          `member-request-images/${crypto.randomUUID()}-${file.name}`,
          file,
          { access: "public" }
        );
        attachmentUrl = blob.url;
      } catch {
        return { error: "تعذر رفع المرفق." };
      }
    }
  }

  if (answers.length === 0 && !attachmentUrl) {
    return { error: "الرجاء تعبئة الطلب قبل الإرسال." };
  }

  try {
    await sql`
      INSERT INTO member_requests (profile_id, type, type_id, answers, image_url)
      VALUES (
        ${profile.id}, ${type.key ?? "other"}::member_request_type, ${type.id},
        ${JSON.stringify(answers)}::jsonb, ${attachmentUrl}
      )
    `;
  } catch {
    return { error: "تعذر إرسال الطلب، حاول مرة أخرى." };
  }

  revalidatePath("/portal/requests");
  revalidatePath("/portal/admin/member-requests");
  return { success: true };
}
