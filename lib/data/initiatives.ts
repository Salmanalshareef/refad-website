import { sql } from "@/lib/db";
import { isUuid } from "@/lib/utils";
import type { Initiative, UpcomingInitiative } from "@/types/db";

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

/**
 * Initiatives still ahead of today, nearest first.
 *
 * Which date matters depends on the mode: a "single" initiative is defined by
 * the day it happens, a "period" one by the day applications close. An
 * initiative with no dates at all is open-ended and is left out rather than
 * sorted arbitrarily.
 */
export async function getUpcomingInitiatives(limit: number) {
  return (await sql`
    SELECT i.*, t.title AS type_title,
           COALESCE(
             CASE WHEN i.date_mode = 'single' THEN i.start_date ELSE i.end_date END,
             i.start_date
           ) AS relevant_date
    FROM initiatives i
    JOIN initiative_types t ON t.id = i.initiative_type_id
    WHERE i.is_published = true
      AND t.is_published = true
      AND COALESCE(
            CASE WHEN i.date_mode = 'single' THEN i.start_date ELSE i.end_date END,
            i.start_date
          ) >= CURRENT_DATE
    ORDER BY relevant_date ASC
    LIMIT ${limit}
  `) as UpcomingInitiative[];
}

/** Count of initiatives a member can currently apply to. */
export async function getOpenInitiativeCount() {
  const rows = (await sql`
    SELECT count(*)::int AS n
    FROM initiatives i
    JOIN initiative_types t ON t.id = i.initiative_type_id
    WHERE i.is_published = true AND t.is_published = true
      AND i.is_requestable = true AND t.is_requestable = true
      AND (i.end_date IS NULL OR i.end_date >= CURRENT_DATE)
  `) as { n: number }[];
  return rows[0]?.n ?? 0;
}
