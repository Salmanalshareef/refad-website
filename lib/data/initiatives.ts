import { sql } from "@/lib/db";
import { isUuid } from "@/lib/utils";
import type { Initiative } from "@/types/db";

export async function getInitiatives() {
  return (await sql`
    SELECT * FROM initiatives ORDER BY order_index ASC
  `) as Initiative[];
}

export async function getPublishedInitiativesByType(typeId: string) {
  if (!isUuid(typeId)) return [];
  return (await sql`
    SELECT * FROM initiatives
    WHERE initiative_type_id = ${typeId} AND is_published = true
    ORDER BY order_index ASC
  `) as Initiative[];
}

export async function getPublishedInitiativeById(id: string) {
  if (!isUuid(id)) return null;
  const rows = (await sql`
    SELECT * FROM initiatives
    WHERE id = ${id} AND is_published = true
  `) as Initiative[];
  return rows[0] ?? null;
}
