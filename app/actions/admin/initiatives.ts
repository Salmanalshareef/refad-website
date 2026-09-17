"use server";

import { revalidatePath } from "next/cache";
import { put, del } from "@vercel/blob";
import { requireAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import { InitiativeFormSchema, type InitiativeFormState } from "@/lib/validation/initiative";

const ALLOWED_ICON_TYPES = ["image/svg+xml", "image/png", "image/webp"];

// The member-facing initiative pages are nested dynamic routes, so the literal
// "/portal/services" path alone would leave them serving stale content.
function revalidateMemberViews() {
  revalidatePath("/portal/services");
  revalidatePath("/portal/services/[typeId]", "page");
  revalidatePath("/portal/services/[typeId]/[initiativeId]", "page");
}

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
    date_mode: formData.get("date_mode") || "period",
    start_date: formData.get("start_date"),
    end_date: formData.get("end_date"),
    age_group: formData.get("age_group"),
    target_audience: formData.get("target_audience"),
    order_index: formData.get("order_index") || 0,
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0]?.message };
  }

  const {
    id,
    initiative_type_id,
    title,
    description,
    requirements,
    date_mode,
    start_date,
    end_date,
    age_group,
    target_audience,
    order_index,
  } = validatedFields.data;

  const currentIconUrl = (formData.get("current_icon_url") as string) || null;
  const removeIcon = formData.get("remove_icon") === "true";
  const iconFile = formData.get("icon_file");

  let iconUrl: string | null = currentIconUrl;

  if (iconFile instanceof File && iconFile.size > 0) {
    if (!ALLOWED_ICON_TYPES.includes(iconFile.type)) {
      return { error: "صيغة الملف غير مدعومة. الرجاء رفع SVG أو PNG أو WebP." };
    }
    try {
      const blob = await put(
        `initiative-icons/${crypto.randomUUID()}-${iconFile.name}`,
        iconFile,
        { access: "public" }
      );
      iconUrl = blob.url;
    } catch {
      return { error: "تعذر رفع الأيقونة." };
    }
    if (currentIconUrl) {
      await del(currentIconUrl).catch(() => {});
    }
  } else if (removeIcon) {
    if (currentIconUrl) {
      await del(currentIconUrl).catch(() => {});
    }
    iconUrl = null;
  }

  try {
    if (id) {
      await sql`
        UPDATE initiatives
        SET initiative_type_id = ${initiative_type_id}, title = ${title},
            description = ${description}, requirements = ${requirements ?? null},
            date_mode = ${date_mode}, start_date = ${start_date ?? null},
            end_date = ${end_date ?? null}, age_group = ${age_group ?? null},
            target_audience = ${target_audience ?? null},
            icon = ${iconUrl}, order_index = ${order_index}
        WHERE id = ${id}
      `;
    } else {
      await sql`
        INSERT INTO initiatives (
          initiative_type_id, title, description, requirements,
          date_mode, start_date, end_date, age_group, target_audience,
          icon, order_index
        )
        VALUES (
          ${initiative_type_id}, ${title}, ${description}, ${requirements ?? null},
          ${date_mode}, ${start_date ?? null}, ${end_date ?? null}, ${age_group ?? null}, ${target_audience ?? null},
          ${iconUrl}, ${order_index}
        )
      `;
    }
  } catch {
    return { error: "تعذر حفظ البيانات." };
  }

  revalidatePath("/portal/admin/initiatives");
  revalidatePath("/portal/admin/initiative-types");
  revalidatePath("/refad-fund/initiatives");
  revalidateMemberViews();
  return undefined;
}

export async function toggleInitiativePublished(id: string, isPublished: boolean) {
  await requireAdmin();
  await sql`UPDATE initiatives SET is_published = ${isPublished} WHERE id = ${id}`;

  revalidatePath("/portal/admin/initiatives");
  revalidateMemberViews();
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
  revalidateMemberViews();
}

export async function deleteInitiative(id: string) {
  await requireAdmin();

  const rows = (await sql`
    SELECT icon FROM initiatives WHERE id = ${id}
  `) as { icon: string | null }[];
  if (rows[0]?.icon) {
    await del(rows[0].icon).catch(() => {});
  }

  await sql`DELETE FROM initiatives WHERE id = ${id}`;

  revalidatePath("/portal/admin/initiatives");
  revalidatePath("/portal/admin/initiative-types");
  revalidatePath("/refad-fund/initiatives");
  revalidateMemberViews();
}
