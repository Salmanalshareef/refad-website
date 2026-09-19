import type { NewsAudience, NewsCategory } from "@/types/db";

export const newsCategoryLabels: Record<NewsCategory, string> = {
  family: "أخبار الأسرة",
  fund: "أخبار الصندوق",
};

export const newsAudienceLabels: Record<NewsAudience, string> = {
  none: "غير منشور",
  site_and_members: "الموقع والأعضاء",
  members_only: "الأعضاء فقط",
};

/** Ordered for the admin selector, least to most visible. */
export const newsAudienceOptions: NewsAudience[] = [
  "none",
  "members_only",
  "site_and_members",
];
