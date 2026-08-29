import { sql } from "@/lib/db";
import type { MemberRequest, MemberRequestWithDetails } from "@/types/db";

export {
  memberRequestTypeLabels,
  memberRequestStatusLabels,
  memberRequestStatusStyles,
} from "@/lib/labels/member-requests";

export async function getMyMemberRequests(profileId: string) {
  return (await sql`
    SELECT * FROM member_requests
    WHERE profile_id = ${profileId}
    ORDER BY created_at DESC
  `) as MemberRequest[];
}

export async function getAllMemberRequests() {
  return (await sql`
    SELECT mr.*, p.full_name AS member_name, p.national_id AS applicant_national_id
    FROM member_requests mr
    JOIN profiles p ON p.id = mr.profile_id
    ORDER BY mr.created_at DESC
  `) as MemberRequestWithDetails[];
}
