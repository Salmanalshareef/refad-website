import { sql } from "@/lib/db";
import type {
  MemberRequestField,
  MemberRequestTypeDef,
  MemberRequestTypeWithFields,
} from "@/types/db";

async function withFields(types: MemberRequestTypeDef[]): Promise<MemberRequestTypeWithFields[]> {
  if (types.length === 0) return [];

  const fields = (await sql`
    SELECT * FROM member_request_type_fields ORDER BY order_index ASC
  `) as MemberRequestField[];

  const byType = new Map<string, MemberRequestField[]>();
  for (const field of fields) {
    const list = byType.get(field.type_id) ?? [];
    list.push(field);
    byType.set(field.type_id, list);
  }

  return types.map((type) => ({ ...type, fields: byType.get(type.id) ?? [] }));
}

export async function getMemberRequestTypes() {
  const types = (await sql`
    SELECT * FROM member_request_types ORDER BY order_index ASC
  `) as MemberRequestTypeDef[];
  return withFields(types);
}

export async function getPublishedMemberRequestTypes() {
  const types = (await sql`
    SELECT * FROM member_request_types
    WHERE is_published = true
    ORDER BY order_index ASC
  `) as MemberRequestTypeDef[];
  return withFields(types);
}
