"use server";

import { revalidatePath } from "next/cache";
import { put } from "@vercel/blob";
import { requireProfile } from "@/lib/auth";
import { sql } from "@/lib/db";
import {
  SubscriptionRequestFormSchema,
  type SubscriptionRequestFormState,
} from "@/lib/validation/subscription";

const ALLOWED_RECEIPT_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];

export async function submitSubscriptionRequest(
  _prevState: SubscriptionRequestFormState,
  formData: FormData
): Promise<SubscriptionRequestFormState> {
  const profile = await requireProfile();

  const validatedFields = SubscriptionRequestFormSchema.safeParse({
    amount: formData.get("amount"),
    notes: formData.get("notes"),
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0]?.message };
  }

  const receiptFile = formData.get("receipt_file");
  if (!(receiptFile instanceof File) || receiptFile.size === 0) {
    return { error: "الرجاء إرفاق إيصال التحويل البنكي." };
  }
  if (!ALLOWED_RECEIPT_TYPES.includes(receiptFile.type)) {
    return { error: "صيغة الملف غير مدعومة. الرجاء رفع PDF أو JPEG أو PNG أو WebP." };
  }

  const { amount, notes } = validatedFields.data;

  let receiptUrl: string;
  try {
    const blob = await put(
      `subscription-receipts/${crypto.randomUUID()}-${receiptFile.name}`,
      receiptFile,
      { access: "public" }
    );
    receiptUrl = blob.url;
  } catch {
    return { error: "تعذر رفع الإيصال." };
  }

  const fiscalYear = new Date().getFullYear();

  try {
    await sql`
      INSERT INTO subscriptions (profile_id, fiscal_year, amount, receipt_url, notes)
      VALUES (${profile.id}, ${fiscalYear}, ${amount}, ${receiptUrl}, ${notes ?? null})
    `;
  } catch {
    return { error: "تعذر إرسال الطلب، حاول مرة أخرى." };
  }

  revalidatePath("/portal/subscriptions");
  revalidatePath("/portal/admin/subscriptions");
  return { success: true };
}
