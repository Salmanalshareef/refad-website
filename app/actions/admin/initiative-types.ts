"use server";

import { revalidatePath } from "next/cache";
import { put, del } from "@vercel/blob";
import { requireAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import {
  InitiativeTypeFormSchema,
  type InitiativeTypeFormState,
} from "@/lib/validation/initiative-type";

const ALLOWED_ICON_TYPES = ["image/svg+xml", "image/png", "image/webp"];

export async function saveInitiativeType(
  _prevState: InitiativeTypeFormState,
  formData: FormData
): Promise<InitiativeTypeFormState> {
  await requireAdmin();

  const validatedFields = InitiativeTypeFormSchema.safeParse({
    id: formData.get("id") || undefined,
    title: formData.get("title"),
    description: formData.get("description"),
    order_index: formData.get("order_index") || 0,
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0]?.message };
  }

  const { id, title, description, order_index } = validatedFields.data;

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
        UPDATE initiative_types
        SET title = ${title}, description = ${description ?? null},
            icon = ${iconUrl}, order_index = ${order_index}
        WHERE id = ${id}
      `;
    } else {
      await sql`
        INSERT INTO initiative_types (title, description, icon, order_index)
        VALUES (${title}, ${description ?? null}, ${iconUrl}, ${order_index})
      `;
    }
  } catch {
    return { error: "تعذر حفظ البيانات." };
  }

  revalidatePath("/portal/admin/initiative-types");
  revalidatePath("/portal/admin/initiatives");
  revalidatePath("/refad-fund/initiatives");
  revalidatePath("/portal/services");
  revalidatePath("/portal/services/[typeId]", "page");
  return { success: true };
}

export async function toggleInitiativeTypePublished(id: string, isPublished: boolean) {
  await requireAdmin();
  await sql`UPDATE initiative_types SET is_published = ${isPublished} WHERE id = ${id}`;

  revalidatePath("/portal/admin/initiative-types");
  revalidatePath("/refad-fund/initiatives");
}

export async function toggleInitiativeTypeRequestable(id: string, isRequestable: boolean) {
  await requireAdmin();
  await sql`UPDATE initiative_types SET is_requestable = ${isRequestable} WHERE id = ${id}`;

  // Sub-services can't be requestable while their type isn't — turning the
  // type off pulls all of its sub-services down with it.
  if (!isRequestable) {
    await sql`UPDATE initiatives SET is_requestable = false WHERE initiative_type_id = ${id}`;
  }

  revalidatePath("/portal/admin/initiative-types");
  revalidatePath("/portal/admin/initiatives");
  revalidatePath("/portal/services");
  revalidatePath("/portal/services/[typeId]", "page");
}

export async function deleteInitiativeType(id: string) {
  await requireAdmin();

  const rows = (await sql`
    SELECT icon FROM initiative_types WHERE id = ${id}
  `) as { icon: string | null }[];
  if (rows[0]?.icon) {
    await del(rows[0].icon).catch(() => {});
  }

  await sql`DELETE FROM initiative_types WHERE id = ${id}`;

  revalidatePath("/portal/admin/initiative-types");
  revalidatePath("/portal/admin/initiatives");
  revalidatePath("/refad-fund/initiatives");
  revalidatePath("/portal/services");
  revalidatePath("/portal/services/[typeId]", "page");
}
