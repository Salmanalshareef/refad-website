import { sql } from "@/lib/db";
import type { NewsCategory, NewsItem } from "@/types/db";

export { newsAudienceLabels, newsCategoryLabels } from "@/lib/labels/news";

export async function getNewsByCategory(category: NewsCategory) {
  return (await sql`
    SELECT * FROM news_items
    WHERE category = ${category}
    ORDER BY published_date DESC
  `) as NewsItem[];
}

export async function getPublishedNewsByCategory(category: NewsCategory) {
  return (await sql`
    SELECT * FROM news_items
    WHERE category = ${category} AND audience = 'site_and_members'
    ORDER BY published_date DESC
  `) as NewsItem[];
}

export async function getRecentPublishedNewsByCategory(category: NewsCategory, limit: number) {
  return (await sql`
    SELECT * FROM news_items
    WHERE category = ${category} AND audience = 'site_and_members'
    ORDER BY published_date DESC
    LIMIT ${limit}
  `) as NewsItem[];
}

/** Latest news for the dashboard ticker, same audience rule as the news page. */
export async function getRecentPublishedNews(limit: number) {
  return (await sql`
    SELECT * FROM news_items
    WHERE audience IN ('site_and_members', 'members_only')
    ORDER BY published_date DESC
    LIMIT ${limit}
  `) as NewsItem[];
}

/**
 * News a signed-in member may see: anything published to the portal, plus
 * anything already public on the website — an item on the public site is not
 * a secret from members.
 */
export async function getMemberVisibleNews() {
  return (await sql`
    SELECT * FROM news_items
    WHERE audience IN ('site_and_members', 'members_only')
    ORDER BY published_date DESC
  `) as NewsItem[];
}
