"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin, requireProfile } from "@/lib/auth";
import { sql } from "@/lib/db";

export type AccountDeletionState =
  | { error?: string; success?: boolean }
  | undefined;

/** A member asking for their account to be closed. Nothing happens until an admin acts. */
export async function requestAccountDeletion(
  _prevState: AccountDeletionState,
  formData: FormData
): Promise<AccountDeletionState> {
  const profile = await requireProfile();

  const reason = String(formData.get("reason") ?? "").trim();

  // Typing the confirmation word is the guard against a stray click reaching
  // a request an admin then has to chase up.
  if (String(formData.get("confirm") ?? "").trim() !== "حذف") {
    return { error: 'للتأكيد، اكتب كلمة "حذف" في الحقل المخصص.' };
  }

  const pending = (await sql`
    SELECT id FROM account_deletion_requests
    WHERE profile_id = ${profile.id} AND status = 'pending'
    LIMIT 1
  `) as { id: string }[];

  if (pending.length > 0) {
    return { error: "لديك طلب حذف قيد المراجعة بالفعل." };
  }

  try {
    await sql`
      INSERT INTO account_deletion_requests (profile_id, reason)
      VALUES (${profile.id}, ${reason || null})
    `;
  } catch {
    return { error: "تعذر إرسال الطلب، حاول مرة أخرى." };
  }

  revalidatePath("/portal/account/delete");
  revalidatePath("/portal/admin/registration-requests");
  return { success: true };
}

/**
 * Approving a closure deactivates the profile; it never deletes the row.
 *
 * The member's requests, subscriptions and family tree links all hang off that
 * row, and deleting it would cascade them away — so a member who came back
 * would return to an empty account rather than their own.
 */
export async function approveAccountDeletion(id: string) {
  await requireAdmin();

  const rows = (await sql`
    SELECT profile_id FROM account_deletion_requests
    WHERE id = ${id} AND status = 'pending'
  `) as { profile_id: string }[];

  const request = rows[0];
  if (!request) return;

  await sql`UPDATE profiles SET is_active = false WHERE id = ${request.profile_id}`;
  await sql`
    UPDATE account_deletion_requests
    SET status = 'approved', resolved_at = now()
    WHERE id = ${id}
  `;

  revalidatePath("/portal/admin/registration-requests");
  revalidatePath("/portal/admin/members");
}

export async function rejectAccountDeletion(id: string, comment: string) {
  await requireAdmin();

  await sql`
    UPDATE account_deletion_requests
    SET status = 'rejected', admin_comment = ${comment || null}, resolved_at = now()
    WHERE id = ${id} AND status = 'pending'
  `;

  revalidatePath("/portal/admin/registration-requests");
}
