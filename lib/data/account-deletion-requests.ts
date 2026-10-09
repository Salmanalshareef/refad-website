import { sql } from "@/lib/db";
import type { AccountDeletionRequestWithMember } from "@/types/db";

/** Pending first, so what needs acting on is at the top of the admin queue. */
export async function getAccountDeletionRequests() {
  return (await sql`
    SELECT r.*, p.full_name AS member_name, p.member_number, p.phone, p.national_id
    FROM account_deletion_requests r
    JOIN profiles p ON p.id = r.profile_id
    ORDER BY (r.status = 'pending') DESC, r.created_at DESC
  `) as AccountDeletionRequestWithMember[];
}
