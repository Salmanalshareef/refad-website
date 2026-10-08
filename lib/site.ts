/**
 * The site's absolute base URL.
 *
 * Read from the environment rather than hardcoded: NEXT_PUBLIC_SITE_URL once a
 * domain is set, the Vercel production host otherwise, and localhost in
 * development. Open Graph tags and the sitemap both need absolute URLs.
 */
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");
