"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { FamilyMemberRow } from "@/components/admin/FamilyMemberRow";
import { EmptyState } from "@/components/shared/EmptyState";
import type { FamilyMemberWithProfile, Profile, Spouse } from "@/types/db";

export function FamilyMemberList({
  members,
  profiles,
  spousesByMember,
}: {
  members: FamilyMemberWithProfile[];
  profiles: Profile[];
  /** Spouses keyed by family_members.id. */
  spousesByMember: Record<string, Spouse[]>;
}) {
  const [query, setQuery] = useState("");

  // This table is the register. A child entered inside someone's عائلة العضو
  // is that member's own family record, and showed here as an orphan row — a
  // first name with no father, and no mother either, because this table reads
  // mother_name while that form sets mother_id. It belongs in the places that
  // know what it is: the member's عائلة العضو, their عائلتي tab, and a
  // mother's panel in the tree.
  const register = useMemo(() => members.filter((m) => m.in_tree), [members]);

  const filtered = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return register;
    return register.filter((member) => member.full_name.includes(trimmed));
  }, [register, query]);

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
            register.length === 0 ? "لم تتم إضافة أفراد بعد." : "لا توجد نتائج مطابقة للبحث."
          }
        />
      )}
      {filtered.map((member) => (
        <FamilyMemberRow
          key={member.id}
          member={member}
          // Unfiltered on purpose: each row reads this to find its own
          // children, and the ones entered through عائلة العضو are exactly
          // the ones it has to find. Filtering here would empty the list
          // inside the very section that owns those records.
          allMembers={members}
          profiles={profiles}
          spouses={spousesByMember[member.id] ?? []}
        />
      ))}
    </div>
  );
}
