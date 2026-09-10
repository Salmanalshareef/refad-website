"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import { InitiativeFormSchema, type InitiativeFormState } from "@/lib/validation/initiative";

export async function saveInitiative(
  _prevState: InitiativeFormState,
  formData: FormData
): Promise<InitiativeFormState> {
  await requireAdmin();

  const validatedFields = InitiativeFormSchema.safeParse({
    id: formData.get("id") || undefined,
    initiative_type_id: formData.get("initiative_type_id"),
    title: formData.get("title"),
    description: formData.get("description"),
    requirements: formData.get("requirements"),
    end_date: formData.get("end_date"),
    order_index: formData.get("order_index") || 0,
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0]?.message };
  }

  const { id, initiative_type_id, title, description, requirements, end_date, order_index } =
    validatedFields.data;

  try {
    if (id) {
      await sql`
        UPDATE initiatives
        SET initiative_type_id = ${initiative_type_id}, title = ${title},
            description = ${description}, requirements = ${requirements ?? null},
            end_date = ${end_date ?? null}, order_index = ${order_index}
        WHERE id = ${id}
      `;
    } else {
      await sql`
        INSERT INTO initiatives (initiative_type_id, title, description, requirements, end_date, order_index)
        VALUES (${initiative_type_id}, ${title}, ${description}, ${requirements ?? null}, ${end_date ?? null}, ${order_index})
      `;
    }
  } catch {
    return { error: "تعذر حفظ البيانات." };
  }

  revalidatePath("/portal/admin/initiatives");
  revalidatePath("/portal/admin/initiative-types");
  revalidatePath("/refad-fund/initiatives");
  revalidatePath("/portal/services");
  return undefined;
}

export async function toggleInitiativePublished(id: string, isPublished: boolean) {
  await requireAdmin();
  await sql`UPDATE initiatives SET is_published = ${isPublished} WHERE id = ${id}`;

  revalidatePath("/portal/admin/initiatives");
  revalidatePath("/portal/services");
}

export async function toggleInitiativeRequestable(id: string, isRequestable: boolean) {
  await requireAdmin();

  if (isRequestable) {
    const rows = (await sql`
      SELECT it.is_requestable
      FROM initiatives i
      JOIN initiative_types it ON it.id = i.initiative_type_id
      WHERE i.id = ${id}
    `) as { is_requestable: boolean }[];

    // Can't enable a sub-service while its type is marked not requestable.
    if (!rows[0]?.is_requestable) return;
  }

  await sql`UPDATE initiatives SET is_requestable = ${isRequestable} WHERE id = ${id}`;

  revalidatePath("/portal/admin/initiatives");
  revalidatePath("/portal/services");
}

export async function deleteInitiative(id: string) {
  await requireAdmin();
  await sql`DELETE FROM initiatives WHERE id = ${id}`;

  revalidatePath("/portal/admin/initiatives");
  revalidatePath("/portal/admin/initiative-types");
  revalidatePath("/refad-fund/initiatives");
  revalidatePath("/portal/services");
}
