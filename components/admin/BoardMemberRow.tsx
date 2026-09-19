"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { BoardMemberForm } from "@/components/admin/BoardMemberForm";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { MemberPhoto } from "@/components/shared/MemberPhoto";
import { deleteBoardMember } from "@/app/actions/admin/board";
import type { BoardMember } from "@/types/db";

export function BoardMemberRow({ member }: { member: BoardMember }) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <div className="rounded-xl border border-primary-200 bg-primary-50/40 p-4">
        <BoardMemberForm member={member} onDone={() => setEditing(false)} />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50 p-4">
      <div className="flex items-center gap-3">
        <MemberPhoto src={member.photo_url} size={40} />
        <div>
          <p className="font-medium text-primary-900">{member.full_name}</p>
          <p className="text-xs text-neutral-500">{member.role_title}</p>
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
        <DeleteButton action={() => deleteBoardMember(member.id)} />
      </div>
    </div>
  );
}
