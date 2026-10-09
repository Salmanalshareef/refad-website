"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import { VideoFormSchema, type VideoFormState } from "@/lib/validation/video";

// /media-center is only a grid of links; the library renders one level down,
// and a bare path does not reach children.
function revalidateVideoViews() {
  revalidatePath("/portal/admin/media/videos");
  revalidatePath("/media-center/videos");
}

export async function saveVideo(
  _prevState: VideoFormState,
  formData: FormData
): Promise<VideoFormState> {
  await requireAdmin();

  const validatedFields = VideoFormSchema.safeParse({
    id: formData.get("id") || undefined,
    title: formData.get("title"),
    description: formData.get("description"),
    video_url: formData.get("video_url"),
    published_date: formData.get("published_date"),
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0]?.message };
  }

  const { id, title, description, video_url, published_date } = validatedFields.data;

  try {
    if (id) {
      await sql`
        UPDATE videos
        SET title = ${title}, description = ${description ?? null},
            video_url = ${video_url}, published_date = ${published_date}
        WHERE id = ${id}
      `;
    } else {
      await sql`
        INSERT INTO videos (title, description, video_url, published_date)
        VALUES (${title}, ${description ?? null}, ${video_url}, ${published_date})
      `;
    }
  } catch {
    return { error: "تعذر حفظ الفيديو." };
  }

  revalidateVideoViews();
  return { success: true };
}

export async function toggleVideoPublished(id: string, isPublished: boolean) {
  await requireAdmin();
  await sql`UPDATE videos SET is_published = ${isPublished} WHERE id = ${id}`;

  revalidateVideoViews();
}

export async function deleteVideo(id: string) {
  await requireAdmin();
  await sql`DELETE FROM videos WHERE id = ${id}`;

  revalidateVideoViews();
}
