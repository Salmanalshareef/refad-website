import type { Metadata } from "next";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import { Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "صندوق رفاد العائلي",
  description:
    "المنصة الرقمية لعائلة آل معجب، حيث نتواصل ونبني جسور التواصل ونمكّن أجيالنا نحو مستقبل مستدام ومتماسك.",
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
