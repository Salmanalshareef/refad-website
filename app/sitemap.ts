import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/site";

/** Public routes only — everything under /portal is behind a session. */
const routes = [
  "",
  "/about-family",
  "/refad-fund",
  "/refad-fund/about",
  "/refad-fund/board-of-trustees",
  "/refad-fund/initiatives",
  "/refad-fund/reports",
  "/media-center",
  "/media-center/family-news",
  "/media-center/fund-news",
  "/media-center/magazine",
  "/media-center/videos",
  "/contact",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified,
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.7,
  }));
}
