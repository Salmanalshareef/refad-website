import { sql } from "@/lib/db";
import type { SupportRequest, SupportRequestWithDetails } from "@/types/db";

export {
  supportRequestStatusLabels,
  supportRequestStatusStyles,
} from "@/lib/labels/support-requests";

export async function getMySupportRequests(profileId: string) {
  return (await sql`
    SELECT * FROM support_requests
    WHERE profile_id = ${profileId} AND status != 'draft'
    ORDER BY created_at DESC
  `) as SupportRequest[];
}

export async function getAllSupportRequests() {
  return (await sql`
    SELECT sr.*, p.full_name AS member_name, p.member_number, p.national_id,
      i.title AS initiative_title, i.requirements,
      it.title AS initiative_type_title
    FROM support_requests sr
    JOIN profiles p ON p.id = sr.profile_id
    LEFT JOIN initiatives i ON i.id = sr.initiative_id
    LEFT JOIN initiative_types it ON it.id = i.initiative_type_id
    WHERE sr.status != 'draft'
    ORDER BY sr.created_at DESC
  `) as SupportRequestWithDetails[];
}
