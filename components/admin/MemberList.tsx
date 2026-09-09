"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { MemberRow } from "@/components/admin/MemberRow";
import { EmptyState } from "@/components/shared/EmptyState";
import type { ProfileWithEmail } from "@/types/db";

export function MemberList({ profiles }: { profiles: ProfileWithEmail[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return profiles;
    return profiles.filter((profile) => profile.full_name.includes(trimmed));
  }, [profiles, query]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="البحث بالاسم..."
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 pe-9 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
      </div>

      {filtered.length === 0 && (
        <EmptyState
          message={
            profiles.length === 0 ? "لا يوجد أعضاء مسجلون بعد." : "لا توجد نتائج مطابقة للبحث."
          }
        />
      )}
      {filtered.map((profile) => (
        <MemberRow key={profile.id} profile={profile} />
      ))}
    </div>
  );
}
