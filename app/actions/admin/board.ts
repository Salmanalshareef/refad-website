"use server";

import { revalidatePath } from "next/cache";
import { put, del } from "@vercel/blob";
import { requireAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import { BoardMemberFormSchema, type BoardMemberFormState } from "@/lib/validation/board";

const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function saveBoardMember(
  _prevState: BoardMemberFormState,
  formData: FormData
): Promise<BoardMemberFormState> {
  await requireAdmin();

  const validatedFields = BoardMemberFormSchema.safeParse({
    id: formData.get("id") || undefined,
    full_name: formData.get("full_name"),
    role_title: formData.get("role_title"),
    bio: formData.get("bio") || undefined,
    order_index: formData.get("order_index") || 0,
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0]?.message };
  }

  const { id, full_name, role_title, bio, order_index } = validatedFields.data;

  const currentPhotoUrl = (formData.get("current_photo_url") as string) || null;
  const removePhoto = formData.get("remove_photo") === "true";
  const photoFile = formData.get("photo_file");

  let photoUrl: string | null = currentPhotoUrl;

  if (photoFile instanceof File && photoFile.size > 0) {
    if (!ALLOWED_PHOTO_TYPES.includes(photoFile.type)) {
      return { error: "صيغة الملف غير مدعومة. الرجاء رفع JPEG أو PNG أو WebP." };
    }
    try {
      const blob = await put(
        `board-photos/${crypto.randomUUID()}-${photoFile.name}`,
        photoFile,
        { access: "public" }
      );
      photoUrl = blob.url;
    } catch {
      return { error: "تعذر رفع الصورة." };
    }
    if (currentPhotoUrl) {
      await del(currentPhotoUrl).catch(() => {});
    }
  } else if (removePhoto) {
    if (currentPhotoUrl) {
      await del(currentPhotoUrl).catch(() => {});
    }
    photoUrl = null;
  }

  try {
    if (id) {
      await sql`
        UPDATE board_members
        SET full_name = ${full_name}, role_title = ${role_title},
            bio = ${bio ?? null}, order_index = ${order_index}, photo_url = ${photoUrl}
        WHERE id = ${id}
      `;
    } else {
      await sql`
        INSERT INTO board_members (full_name, role_title, bio, order_index, photo_url)
        VALUES (${full_name}, ${role_title}, ${bio ?? null}, ${order_index}, ${photoUrl})
      `;
    }
  } catch {
    return { error: "تعذر حفظ البيانات." };
  }

  revalidatePath("/portal/admin/board");
  revalidatePath("/refad-fund/board-of-trustees");
  return { success: true };
}

export async function deleteBoardMember(id: string) {
  await requireAdmin();

  const rows = (await sql`
    SELECT photo_url FROM board_members WHERE id = ${id}
  `) as { photo_url: string | null }[];
  if (rows[0]?.photo_url) {
    await del(rows[0].photo_url).catch(() => {});
  }

  await sql`DELETE FROM board_members WHERE id = ${id}`;

  revalidatePath("/portal/admin/board");
  revalidatePath("/refad-fund/board-of-trustees");
}
