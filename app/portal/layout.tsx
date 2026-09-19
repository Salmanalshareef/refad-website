import { requireProfile } from "@/lib/auth";
import { Sidebar } from "@/components/portal/Sidebar";

export default async function PortalLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const profile = await requireProfile();

  return (
    // portal-shell scopes the dark palette: see the dark block in globals.css
    <div className="portal-shell flex min-h-screen flex-1 bg-neutral-50">
      <Sidebar isAdmin={profile.role === "admin"} />
      <div className="flex-1 bg-neutral-50">
        <header className="flex items-center justify-between border-b border-neutral-200 bg-neutral-50 px-8 py-4">
          <p className="text-sm text-neutral-600">
            مرحبًا، <span className="font-semibold text-primary-900">{profile.full_name}</span>
          </p>
        </header>
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
