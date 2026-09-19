"use server";

import { revalidatePath } from "next/cache";
import type { NewsAudience } from "@/types/db";
import { put, del } from "@vercel/blob";
import { requireAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import { NewsItemFormSchema, type NewsItemFormState } from "@/lib/validation/news";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const NEWS_AUDIENCES: NewsAudience[] = ["none", "site_and_members", "members_only"];

function revalidateNewsViews() {
  revalidatePath("/portal/admin/media/family-news");
  revalidatePath("/portal/admin/media/fund-news");
  revalidatePath("/media-center");
  // News now also reaches members inside the portal.
  revalidatePath("/portal/news");
  revalidatePath("/portal");
}

export async function saveNewsItem(
  _prevState: NewsItemFormState,
  formData: FormData
): Promise<NewsItemFormState> {
  await requireAdmin();

  const validatedFields = NewsItemFormSchema.safeParse({
    id: formData.get("id") || undefined,
    category: formData.get("category"),
    title: formData.get("title"),
    body: formData.get("body"),
    published_date: formData.get("published_date"),
    audience: formData.get("audience"),
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0]?.message };
  }

  const { id, category, title, body, published_date, audience } = validatedFields.data;

  const currentImageUrl = (formData.get("current_image_url") as string) || null;
  const removeImage = formData.get("remove_image") === "true";
  const imageFile = formData.get("image_file");

  let imageUrl: string | null = currentImageUrl;

  if (imageFile instanceof File && imageFile.size > 0) {
    if (!ALLOWED_IMAGE_TYPES.includes(imageFile.type)) {
      return { error: "صيغة الملف غير مدعومة. الرجاء رفع JPEG أو PNG أو WebP." };
    }
    try {
      const blob = await put(`news-images/${crypto.randomUUID()}-${imageFile.name}`, imageFile, {
        access: "public",
      });
      imageUrl = blob.url;
    } catch {
      return { error: "تعذر رفع الصورة." };
    }
    if (currentImageUrl) {
      await del(currentImageUrl).catch(() => {});
    }
  } else if (removeImage) {
    if (currentImageUrl) {
      await del(currentImageUrl).catch(() => {});
    }
    imageUrl = null;
  }

  try {
    if (id) {
      await sql`
        UPDATE news_items
        SET category = ${category}, title = ${title}, body = ${body},
            audience = ${audience}::news_audience,
            image_url = ${imageUrl}, published_date = ${published_date}
        WHERE id = ${id}
      `;
    } else {
      await sql`
        INSERT INTO news_items (category, title, body, image_url, published_date, audience)
        VALUES (
          ${category}, ${title}, ${body}, ${imageUrl}, ${published_date},
          ${audience}::news_audience
        )
      `;
    }
  } catch {
    return { error: "تعذر حفظ الخبر." };
  }

  revalidateNewsViews();
  return { success: true };
}

export async function setNewsItemAudience(id: string, audience: NewsAudience) {
  await requireAdmin();

  // Validated here rather than trusted: this arrives from a client component.
  if (!NEWS_AUDIENCES.includes(audience)) return;

  await sql`
    UPDATE news_items SET audience = ${audience}::news_audience WHERE id = ${id}
  `;
  revalidateNewsViews();
}

export async function deleteNewsItem(id: string) {
  await requireAdmin();

  const rows = (await sql`
    SELECT image_url FROM news_items WHERE id = ${id}
  `) as { image_url: string | null }[];
  if (rows[0]?.image_url) {
    await del(rows[0].image_url).catch(() => {});
  }

  await sql`DELETE FROM news_items WHERE id = ${id}`;

  revalidateNewsViews();
}
