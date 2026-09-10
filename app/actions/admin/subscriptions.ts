"use server";

import { revalidatePath } from "next/cache";
import { put, del } from "@vercel/blob";
import { requireAdmin } from "@/lib/auth";
import { sql } from "@/lib/db";
import {
  AdminCreateSubscriptionFormSchema,
  BankInfoFormSchema,
  SubscriptionEditFormSchema,
  type AdminCreateSubscriptionFormState,
  type BankInfoFormState,
  type SubscriptionEditFormState,
} from "@/lib/validation/subscription";

const ALLOWED_RECEIPT_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"];

export async function approveSubscription(id: string) {
  await requireAdmin();

  await sql`
    UPDATE subscriptions
    SET status = 'active',
        subscription_number = nextval('subscription_number_seq'),
        approved_date = CURRENT_DATE,
        end_date = (CURRENT_DATE + INTERVAL '365 days')::date
    WHERE id = ${id} AND status = 'pending'
  `;

  revalidatePath("/portal/admin/subscriptions");
  revalidatePath("/portal/subscriptions");
}

export async function rejectSubscription(id: string, reason: string) {
  await requireAdmin();

  await sql`
    UPDATE subscriptions
    SET status = 'rejected', admin_comment = ${reason.trim() || null}
    WHERE id = ${id} AND status = 'pending'
  `;

  revalidatePath("/portal/admin/subscriptions");
  revalidatePath("/portal/subscriptions");
}

export async function updateSubscription(
  _prevState: SubscriptionEditFormState,
  formData: FormData
): Promise<SubscriptionEditFormState> {
  await requireAdmin();

  const validatedFields = SubscriptionEditFormSchema.safeParse({
    id: formData.get("id"),
    amount: formData.get("amount"),
    requested_date: formData.get("requested_date"),
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0]?.message };
  }

  const { id, amount, requested_date } = validatedFields.data;

  const currentReceiptUrl = (formData.get("current_receipt_url") as string) || null;
  const receiptFile = formData.get("receipt_file");

  let receiptUrl = currentReceiptUrl;

  if (receiptFile instanceof File && receiptFile.size > 0) {
    if (!ALLOWED_RECEIPT_TYPES.includes(receiptFile.type)) {
      return { error: "صيغة الملف غير مدعومة. الرجاء رفع PDF أو JPEG أو PNG أو WebP." };
    }
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
    if (currentReceiptUrl) {
      await del(currentReceiptUrl).catch(() => {});
    }
  }

  try {
    await sql`
      UPDATE subscriptions
      SET amount = ${amount}, requested_date = ${requested_date}, receipt_url = ${receiptUrl}
      WHERE id = ${id}
    `;
  } catch {
    return { error: "تعذر حفظ التعديلات." };
  }

  revalidatePath("/portal/admin/subscriptions");
  revalidatePath("/portal/subscriptions");
  return undefined;
}

export async function createSubscriptionForMember(
  _prevState: AdminCreateSubscriptionFormState,
  formData: FormData
): Promise<AdminCreateSubscriptionFormState> {
  await requireAdmin();

  const validatedFields = AdminCreateSubscriptionFormSchema.safeParse({
    profile_id: formData.get("profile_id"),
    amount: formData.get("amount"),
    fiscal_year: formData.get("fiscal_year"),
    requested_date: formData.get("requested_date"),
    status: formData.get("status"),
    notes: formData.get("notes"),
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0]?.message };
  }

  const { profile_id, amount, fiscal_year, requested_date, status, notes } = validatedFields.data;

  let receiptUrl: string | null = null;
  const receiptFile = formData.get("receipt_file");
  if (receiptFile instanceof File && receiptFile.size > 0) {
    if (!ALLOWED_RECEIPT_TYPES.includes(receiptFile.type)) {
      return { error: "صيغة الملف غير مدعومة. الرجاء رفع PDF أو JPEG أو PNG أو WebP." };
    }
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
  }

  try {
    if (status === "active") {
      await sql`
        INSERT INTO subscriptions (
          profile_id, fiscal_year, amount, receipt_url, notes,
          status, subscription_number, approved_date, end_date, requested_date
        )
        VALUES (
          ${profile_id}, ${fiscal_year}, ${amount}, ${receiptUrl}, ${notes ?? null},
          'active', nextval('subscription_number_seq'), ${requested_date},
          (${requested_date}::date + INTERVAL '365 days')::date, ${requested_date}
        )
      `;
    } else {
      await sql`
        INSERT INTO subscriptions (profile_id, fiscal_year, amount, receipt_url, notes, requested_date)
        VALUES (${profile_id}, ${fiscal_year}, ${amount}, ${receiptUrl}, ${notes ?? null}, ${requested_date})
      `;
    }
  } catch {
    return { error: "تعذر إضافة الاشتراك. تأكد من صحة البيانات." };
  }

  revalidatePath("/portal/admin/subscriptions");
  revalidatePath("/portal/subscriptions");
  return { success: true };
}

export async function deleteSubscription(id: string) {
  await requireAdmin();

  const rows = (await sql`
    SELECT receipt_url FROM subscriptions WHERE id = ${id}
  `) as { receipt_url: string }[];
  if (rows[0]?.receipt_url) {
    await del(rows[0].receipt_url).catch(() => {});
  }

  await sql`DELETE FROM subscriptions WHERE id = ${id}`;

  revalidatePath("/portal/admin/subscriptions");
  revalidatePath("/portal/subscriptions");
}

export async function saveBankInfo(
  _prevState: BankInfoFormState,
  formData: FormData
): Promise<BankInfoFormState> {
  await requireAdmin();

  const validatedFields = BankInfoFormSchema.safeParse({
    account_name: formData.get("account_name"),
    bank_name: formData.get("bank_name"),
    account_number: formData.get("account_number"),
    iban: formData.get("iban"),
  });

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0]?.message };
  }

  const { account_name, bank_name, account_number, iban } = validatedFields.data;
  const id = formData.get("id");
  if (typeof id !== "string" || !id) {
    return { error: "تعذر تحديد سجل البيانات البنكية." };
  }

  try {
    await sql`
      UPDATE fund_bank_info
      SET account_name = ${account_name}, bank_name = ${bank_name},
          account_number = ${account_number}, iban = ${iban}, updated_at = now()
      WHERE id = ${id}
    `;
  } catch {
    return { error: "تعذر حفظ بيانات الحساب البنكي." };
  }

  revalidatePath("/portal/admin/subscriptions");
  revalidatePath("/portal/subscriptions");
  return undefined;
}
