"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Sidebar } from "@/components/portal/Sidebar";

/**
 * Owns whether the mobile drawer is open, because the trigger lives in the
 * header and the drawer is the sidebar beside it.
 *
 * Below lg the sidebar is a slide-out drawer over a backdrop; from lg up it is
 * a static column and the drawer state is irrelevant. It used to be a 256px
 * column at every width, which on a phone left the content a narrow strip
 * beside it.
 */
export function PortalShell({
  isAdmin,
  fullName,
  children,
}: {
  isAdmin: boolean;
  fullName: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="portal-shell flex min-h-screen flex-1 bg-neutral-50">
      {open && (
        <button
          type="button"
          aria-label="إغلاق القائمة"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-neutral-900/50 backdrop-blur-sm lg:hidden"
        />
      )}

      <Sidebar isAdmin={isAdmin} open={open} onNavigate={() => setOpen(false)} />

      {/* min-w-0 so long content cannot push the column wider than the screen,
          which would scroll the whole page sideways on a phone. */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-neutral-200 bg-neutral-50 px-4 py-4 sm:px-8">
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
            aria-expanded={open}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-neutral-200 text-neutral-700 transition-colors hover:bg-neutral-100 lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <p className="min-w-0 truncate text-sm text-neutral-600">
            مرحبًا، <span className="font-semibold text-primary-900">{fullName}</span>
          </p>
        </header>

        <main className="p-4 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
