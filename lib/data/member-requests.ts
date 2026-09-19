import { sql } from "@/lib/db";
import type { MemberRequestWithDetails, MemberRequestWithType } from "@/types/db";

export {
  memberRequestTypeLabels,
  memberRequestStatusLabels,
  memberRequestStatusStyles,
} from "@/lib/labels/member-requests";

export async function getMyMemberRequests(profileId: string) {
  return (await sql`
    SELECT mr.*, t.title AS type_title
    FROM member_requests mr
    LEFT JOIN member_request_types t ON t.id = mr.type_id
    WHERE mr.profile_id = ${profileId}
    ORDER BY mr.created_at DESC
  `) as MemberRequestWithType[];
}

export async function getAllMemberRequests() {
  return (await sql`
    SELECT mr.*, p.full_name AS member_name, p.national_id AS applicant_national_id,
           t.title AS type_title
    FROM member_requests mr
    JOIN profiles p ON p.id = mr.profile_id
    LEFT JOIN member_request_types t ON t.id = mr.type_id
    ORDER BY mr.created_at DESC
  `) as MemberRequestWithDetails[];
}
