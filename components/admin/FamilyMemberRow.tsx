"use client";

import { useState } from "react";
import { Link2, Pencil, User } from "lucide-react";
import { FamilyMemberForm } from "@/components/admin/FamilyMemberForm";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteFamilyMember } from "@/app/actions/admin/family-members";
import type { FamilyMemberWithProfile, Profile } from "@/types/db";

export function FamilyMemberRow({
  member,
  allMembers,
  profiles,
}: {
  member: FamilyMemberWithProfile;
  allMembers: FamilyMemberWithProfile[];
  profiles: Profile[];
}) {
  const [editing, setEditing] = useState(false);
  const father = allMembers.find((m) => m.id === member.father_id);

  if (editing) {
    return (
      <div className="rounded-xl border border-primary-200 bg-primary-50/40 p-4">
        <FamilyMemberForm
          member={member}
          allMembers={allMembers}
          profiles={profiles}
          onDone={() => setEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50 p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-700">
          <User className="h-5 w-5" />
        </div>
        <div>
          <p className="font-medium text-primary-900">{member.full_name}</p>
          <p className="text-xs text-neutral-500">
            {father ? `الأب: ${father.full_name}` : "بدون أب محدد"}
          </p>
          {member.profile_id ? (
            <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-primary-700">
              <Link2 className="h-3 w-3" />
              مرتبط بحساب
            </p>
          ) : (
            member.national_id && (
              <p dir="ltr" className="mt-0.5 text-xs text-neutral-400">
                {member.national_id}
              </p>
            )
          )}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-primary-700 hover:bg-primary-50"
        >
          <Pencil className="h-3.5 w-3.5" />
          تعديل
        </button>
        <DeleteButton action={() => deleteFamilyMember(member.id)} />
      </div>
    </div>
  );
}
