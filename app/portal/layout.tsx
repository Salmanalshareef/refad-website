import { requireProfile } from "@/lib/auth";
import { PortalShell } from "@/components/portal/PortalShell";

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
