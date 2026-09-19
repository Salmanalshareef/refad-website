"use client";

import { useTransition } from "react";
import { ShieldCheck } from "lucide-react";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteMember, updateMemberRole } from "@/app/actions/admin/members";
import type { Profile } from "@/types/db";

export function AdministratorRow({
  profile,
  isSelf,
}: {
  profile: Profile;
  isSelf: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50 p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-700">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <p className="font-medium text-primary-900">
            {profile.full_name}
            {isSelf && (
              <span className="ms-2 text-xs font-normal text-neutral-500">(أنت)</span>
            )}
          </p>
          {profile.phone && <p className="text-xs text-neutral-500">{profile.phone}</p>}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={isPending || isSelf}
          title={isSelf ? "لا يمكنك تعديل صلاحياتك الخاصة من هنا" : undefined}
          onClick={() => startTransition(() => updateMemberRole(profile.id, "member"))}
          className="rounded-lg px-3 py-1.5 text-xs font-medium text-primary-700 hover:bg-primary-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
        >
          تنزيل إلى عضو
        </button>
        <DeleteButton
          action={() => deleteMember(profile.id)}
          confirmMessage="هل أنت متأكد من حذف حساب هذا المسؤول؟"
          disabled={isSelf}
          title={isSelf ? "لا يمكنك حذف حسابك الخاص من هنا" : undefined}
        />
      </div>
    </div>
  );
}
