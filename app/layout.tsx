import type { Metadata } from "next";
import { siteUrl } from "@/lib/site";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import { Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const SITE_NAME = "صندوق رفاد";
const SITE_DESCRIPTION =
  "المنصة الرقمية لأسرة آل معجب، حيث نتواصل ونبني جسور التواصل ونمكّن أجيالنا نحو مستقبل مستدام ومتماسك.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  // Pages set a short title; this frames it. The default covers the home page.
  title: {
    default: `${SITE_NAME} — المنصة الرقمية لأسرة آل معجب`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "ar_SA",
    title: `${SITE_NAME} — المنصة الرقمية لأسرة آل معجب`,
    description: SITE_DESCRIPTION,
    url: "/",
    images: [{ url: "/logo-website.png", width: 2268, height: 1512, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — المنصة الرقمية لأسرة آل معجب`,
    description: SITE_DESCRIPTION,
    images: ["/logo-website.png"],
  },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable}`} suppressHydrationWarning>
      <head>
        {/* Sets data-theme before first paint so the portal never flashes. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="flex min-h-screen flex-col bg-background font-sans text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
