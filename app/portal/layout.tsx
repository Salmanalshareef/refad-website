import type { Metadata } from "next";
import { requireProfile } from "@/lib/auth";
import { PortalShell } from "@/components/portal/PortalShell";

// The portal is behind auth; keeping it out of the index also stops crawlers
// burning requests on pages that only ever redirect them to the login screen.
export const metadata: Metadata = {
  title: { default: "بوابة الأعضاء", template: "%s | بوابة صندوق رفاد" },
  robots: { index: false, follow: false },
};

export default async function PortalLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const profile = await requireProfile();

  return (
    <PortalShell isAdmin={profile.role === "admin"} fullName={profile.full_name}>
      {children}
    </PortalShell>
  );
}
