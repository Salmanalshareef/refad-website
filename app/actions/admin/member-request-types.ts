"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import {
  MemberRequestTypeFormSchema,
  type MemberRequestTypeFormState,
} from "@/lib/validation/member-request-type";

function revalidateRequestViews() {
  revalidatePath("/portal/admin/member-request-types");
  revalidatePath("/portal/admin/member-requests");
  revalidatePath("/portal/requests");
  revalidatePath("/portal/requests/new");
}

/**
 * Fields arrive as parallel arrays, one entry per row in the editor. They are
 * zipped back together here so the whole set can be replaced atomically.
 */
function readFields(formData: FormData) {
  const labels = formData.getAll("field_label");
  const kinds = formData.getAll("field_kind");
  const indexes = formData.getAll("field_applicant_index");
  const required = formData.getAll("field_required");

  return labels.map((label, i) => ({
    label: String(label),
    kind: String(kinds[i] ?? "text"),
    applicant_name_index: String(indexes[i] ?? ""),
    // A checkbox that is off submits nothing, so the editor pairs each row
    // with a hidden input and this reads the row position instead.
    is_required: String(required[i] ?? "") === "true",
  }));
}

export async function saveMemberRequestType(
  _prevState: MemberRequestTypeFormState,
  formData: FormData
): Promise<MemberRequestTypeFormState> {
  await requireAdmin();

  const validatedFields = MemberRequestTypeFormSchema.safeParse({
    id: formData.get("id") || undefined,
    title: formData.get("title"),
    notice: formData.get("notice"),
    collects_attachment: formData.get("collects_attachment"),
    order_index: formData.get("order_index") || 0,
    fields: readFields(formData),
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0]?.message };
  }

  const { id, title, notice, collects_attachment, order_index, fields } =
    validatedFields.data;

  if (fields.length === 0 && !collects_attachment) {
    return { error: "الرجاء إضافة حقل واحد على الأقل أو تفعيل إرفاق ملف." };
  }

  try {
    let typeId = id;

    if (typeId) {
      await sql`
        UPDATE member_request_types
        SET title = ${title}, notice = ${notice ?? null},
            collects_attachment = ${collects_attachment}, order_index = ${order_index}
        WHERE id = ${typeId}
      `;
    } else {
      const rows = (await sql`
        INSERT INTO member_request_types (title, notice, collects_attachment, order_index)
        VALUES (${title}, ${notice ?? null}, ${collects_attachment}, ${order_index})
        RETURNING id
      `) as { id: string }[];
      typeId = rows[0]?.id;
    }

    if (!typeId) return { error: "تعذر حفظ نوع الطلب." };

    // Replace the whole set: the editor always submits the complete list, and
    // rebuilding it keeps order and removals in step with what the admin sees.
    await sql`DELETE FROM member_request_type_fields WHERE type_id = ${typeId}`;

    for (const [index, field] of fields.entries()) {
      await sql`
        INSERT INTO member_request_type_fields
          (type_id, label, kind, applicant_name_index, is_required, order_index)
        VALUES (
          ${typeId}, ${field.label}, ${field.kind}::member_request_field_kind,
          ${field.kind === "applicant_name" ? field.applicant_name_index ?? 1 : null},
          ${field.kind === "applicant_name" ? false : field.is_required},
          ${index}
        )
      `;
    }
  } catch {
    return { error: "تعذر حفظ نوع الطلب." };
  }

  revalidateRequestViews();
  return {};
}

export async function toggleMemberRequestTypePublished(id: string, isPublished: boolean) {
  await requireAdmin();
  await sql`
    UPDATE member_request_types SET is_published = ${isPublished} WHERE id = ${id}
  `;
  revalidateRequestViews();
}

export async function deleteMemberRequestType(id: string) {
  await requireAdmin();

  // The three built-in types drive bespoke forms that are keyed off `key`, so
  // removing one would strand that behaviour. They can be renamed or hidden
  // instead, which is what hiding is for.
  const rows = (await sql`
    SELECT key FROM member_request_types WHERE id = ${id}
  `) as { key: string | null }[];
  if (!rows[0] || rows[0].key !== null) return;

  await sql`DELETE FROM member_request_types WHERE id = ${id}`;
  revalidateRequestViews();
}
