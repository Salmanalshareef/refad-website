"use server";

import { revalidatePath } from "next/cache";
import { put } from "@vercel/blob";
import { requireUser } from "@/lib/auth";
import { sql } from "@/lib/db";
import {
  MemberRequestFormSchema,
  type MemberRequestFormState,
} from "@/lib/validation/member-request";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function submitMemberRequest(
  _prevState: MemberRequestFormState,
  formData: FormData
): Promise<MemberRequestFormState> {
  const session = await requireUser();

  const type = formData.get("type");
  const parseInput =
    type === "family_member"
      ? {
          type,
          first_name: formData.get("first_name"),
          second_name: formData.get("second_name"),
          third_name: formData.get("third_name"),
          fourth_name: formData.get("fourth_name"),
          national_id: formData.get("national_id"),
          mother_name: formData.get("mother_name"),
        }
      : { type, details: formData.get("details") };

  const validatedFields = MemberRequestFormSchema.safeParse(parseInput);

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0]?.message };
  }

  const data = validatedFields.data;

  try {
    if (data.type === "news") {
      let imageUrl: string | null = null;
      const imageFile = formData.get("image_file");
      if (imageFile instanceof File && imageFile.size > 0) {
        if (!ALLOWED_IMAGE_TYPES.includes(imageFile.type)) {
          return { error: "صيغة الصورة غير مدعومة. الرجاء رفع JPEG أو PNG أو WebP." };
        }
        try {
          const blob = await put(
            `member-request-images/${crypto.randomUUID()}-${imageFile.name}`,
            imageFile,
            { access: "public" }
          );
          imageUrl = blob.url;
        } catch {
          return { error: "تعذر رفع الصورة." };
        }
      }

      await sql`
        INSERT INTO member_requests (profile_id, type, details, image_url)
        VALUES (${session.sub}, 'news', ${data.details}, ${imageUrl})
      `;
    } else if (data.type === "family_member") {
      await sql`
        INSERT INTO member_requests
          (profile_id, type, first_name, second_name, third_name, fourth_name, national_id, mother_name)
        VALUES
          (${session.sub}, 'family_member', ${data.first_name}, ${data.second_name ?? null},
           ${data.third_name ?? null}, ${data.fourth_name ?? null}, ${data.national_id}, ${data.mother_name})
      `;
    } else {
      await sql`
        INSERT INTO member_requests (profile_id, type, details)
        VALUES (${session.sub}, 'other', ${data.details})
      `;
    }
  } catch {
    return { error: "تعذر إرسال الطلب، حاول مرة أخرى." };
  }

  revalidatePath("/portal/requests");
  return { success: true };
}
