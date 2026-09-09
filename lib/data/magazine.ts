import { sql } from "@/lib/db";
import type { MagazineIssue } from "@/types/db";

export async function getMagazineIssues() {
  return (await sql`
    SELECT * FROM magazine_issues ORDER BY published_date DESC
  `) as MagazineIssue[];
}

export async function getPublishedMagazineIssues() {
  return (await sql`
    SELECT * FROM magazine_issues WHERE is_published = true ORDER BY published_date DESC
  `) as MagazineIssue[];
}
