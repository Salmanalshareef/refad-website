import { sql } from "@/lib/db";
import { isUuid } from "@/lib/utils";
import type { InitiativeType } from "@/types/db";

export async function getInitiativeTypes() {
  return (await sql`
    SELECT * FROM initiative_types ORDER BY order_index ASC
  `) as InitiativeType[];
}

export async function getPublishedInitiativeTypes() {
  return (await sql`
    SELECT * FROM initiative_types WHERE is_published = true ORDER BY order_index ASC
  `) as InitiativeType[];
}

export async function getPublishedInitiativeTypeById(id: string) {
  if (!isUuid(id)) return null;
  const rows = (await sql`
    SELECT * FROM initiative_types
    WHERE id = ${id} AND is_published = true
  `) as InitiativeType[];
  return rows[0] ?? null;
}
