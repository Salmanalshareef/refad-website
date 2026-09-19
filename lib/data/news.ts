import { sql } from "@/lib/db";
import type { NewsCategory, NewsItem } from "@/types/db";

export { newsCategoryLabels } from "@/lib/labels/news";

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
    WHERE category = ${category} AND is_published = true
    ORDER BY published_date DESC
  `) as NewsItem[];
}

export async function getRecentPublishedNewsByCategory(category: NewsCategory, limit: number) {
  return (await sql`
    SELECT * FROM news_items
    WHERE category = ${category} AND is_published = true
    ORDER BY published_date DESC
    LIMIT ${limit}
  `) as NewsItem[];
}

/** Latest news from either category, for the dashboard ticker. */
export async function getRecentPublishedNews(limit: number) {
  return (await sql`
    SELECT * FROM news_items
    WHERE is_published = true
    ORDER BY published_date DESC
    LIMIT ${limit}
  `) as NewsItem[];
}
