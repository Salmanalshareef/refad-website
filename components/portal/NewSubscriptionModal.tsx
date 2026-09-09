"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { Modal } from "@/components/shared/Modal";
import { SubscriptionRequestForm } from "@/components/portal/SubscriptionRequestForm";
import type { Profile } from "@/types/db";

export function NewSubscriptionModal({ profile }: { profile: Profile }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-3 rounded-2xl border border-dashed border-primary-300 bg-primary-50/50 p-5 text-start transition-colors hover:bg-primary-50"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-600 text-white">
          <RefreshCw className="h-5 w-5" />
        </span>
        <span>
          <span className="block font-bold text-primary-900">اشتراك جديد / تجديد</span>
          <span className="block text-xs text-neutral-600">
            قدّم طلب اشتراك جديد أو جدّد اشتراكك الحالي.
          </span>
        </span>
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="اشتراك جديد / تجديد">
        <SubscriptionRequestForm profile={profile} onDone={() => setOpen(false)} />
      </Modal>
    </>
  );
}
