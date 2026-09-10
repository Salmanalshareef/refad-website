"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { FamilyMemberRow } from "@/components/admin/FamilyMemberRow";
import { EmptyState } from "@/components/shared/EmptyState";
import type { FamilyMemberWithProfile, Profile } from "@/types/db";

export function FamilyMemberList({
  members,
  profiles,
}: {
  members: FamilyMemberWithProfile[];
  profiles: Profile[];
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return members;
    return members.filter((member) => member.full_name.includes(trimmed));
  }, [members, query]);

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
            members.length === 0 ? "لم تتم إضافة أفراد بعد." : "لا توجد نتائج مطابقة للبحث."
          }
        />
      )}
      {filtered.map((member) => (
        <FamilyMemberRow key={member.id} member={member} allMembers={members} profiles={profiles} />
      ))}
    </div>
  );
}
