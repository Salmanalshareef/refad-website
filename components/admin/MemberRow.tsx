"use client";

import { useState } from "react";
import { ImageOff, Pencil, ShieldCheck } from "lucide-react";
import { EditMemberForm } from "@/components/admin/EditMemberForm";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { MemberPhoto } from "@/components/shared/MemberPhoto";
import { deleteMember, removeMemberAvatar } from "@/app/actions/admin/members";
import { MemberFamilySection } from "@/components/admin/MemberFamilySection";
import type { MemberFamily } from "@/lib/data/family-tree";
import type { ProfileWithEmail } from "@/types/db";

export function MemberRow({
  profile,
  isSelf,
  family,
}: {
  profile: ProfileWithEmail;
  isSelf: boolean;
  family?: MemberFamily;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <div className="space-y-4 rounded-xl border border-primary-200 bg-primary-50/40 p-4">
        <EditMemberForm profile={profile} onDone={() => setEditing(false)} />

        {/* Below the profile form rather than inside it: that form saves in
            one submit, while these are lists that grow an entry at a time,
            and a half-typed spouse must not block a phone correction. */}
        <MemberFamilySection
          familyMemberId={family?.familyMemberId ?? null}
          parentGender={family?.parentGender ?? null}
          spouses={family?.spouses ?? []}
          offspring={family?.children ?? []}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
      <div className="flex min-w-0 items-center gap-3">
        <MemberPhoto src={profile.avatar_url} size={40} />
        <div>
          <p className="font-medium text-primary-900">
            {profile.full_name}
            {profile.role === "admin" && (
              <span className="ms-2 inline-flex items-center gap-1 rounded-full bg-primary-50 px-2 py-0.5 text-xs font-semibold text-primary-700">
                <ShieldCheck className="h-3 w-3" />
                مسؤول
              </span>
            )}
            {isSelf && <span className="ms-2 text-xs font-normal text-neutral-500">(أنت)</span>}
          </p>
          {profile.phone && <p className="text-xs text-neutral-500">{profile.phone}</p>}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-1">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-primary-700 hover:bg-primary-50"
        >
          <Pencil className="h-3.5 w-3.5" />
          تعديل
        </button>
        {profile.avatar_url && (
          <DeleteButton
            action={() => removeMemberAvatar(profile.id)}
            confirmMessage="هل تريد إزالة الصورة الشخصية لهذا العضو؟ يمكنه رفع صورة جديدة من ملفه الشخصي."
            icon={<ImageOff className="h-3.5 w-3.5" />}
            label="إزالة الصورة"
            title="إزالة الصورة الشخصية التي رفعها العضو"
          />
        )}
        <DeleteButton
          action={() => deleteMember(profile.id)}
          confirmMessage="هل أنت متأكد من حذف هذا الحساب؟"
          disabled={isSelf}
          title={isSelf ? "لا يمكنك حذف حسابك الخاص من هنا" : undefined}
        />
      </div>
    </div>
  );
}
