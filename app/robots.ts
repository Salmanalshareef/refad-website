import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Everything here either requires a session or is a one-off form.
      disallow: ["/portal/", "/login", "/register", "/forgot-password", "/api/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
