"use client";

import { useState, useTransition } from "react";
import { ChevronDown, ChevronUp, Mail } from "lucide-react";
import { updateContactMessageStatus } from "@/app/actions/admin/contact-messages";
import { cn } from "@/lib/utils";
import type { ContactMessage, ContactMessageStatus } from "@/types/db";

const statusLabels: Record<ContactMessageStatus, string> = {
  new: "جديدة",
  read: "مقروءة",
  archived: "مؤرشفة",
};

const statusCardStyles: Record<ContactMessageStatus, string> = {
  new: "border-neutral-200 bg-neutral-50",
  read: "border-primary-100 bg-primary-50",
  archived: "border-neutral-200 bg-neutral-100",
};

export function ContactMessageRow({ message }: { message: ContactMessage }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <div className={cn("rounded-xl border p-4", statusCardStyles[message.status])}>
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          if (message.status === "new") {
            startTransition(() => updateContactMessageStatus(message.id, "read"));
          }
        }}
        className="flex w-full items-center justify-between text-start"
      >
        <div className="flex items-center gap-3">
          <Mail className="h-5 w-5 shrink-0 text-primary-700" />
          <div>
            <p className="font-medium text-primary-900">
              {message.subject}
              {message.status === "new" && (
                <span className="ms-2 rounded-full bg-gold-100 px-2 py-0.5 text-xs font-semibold text-gold-600">
                  جديدة
                </span>
              )}
            </p>
            <p className="text-xs text-neutral-500">
              {message.full_name} — <span dir="ltr">{message.mobile}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span dir="ltr" className="shrink-0 text-xs text-neutral-400">
            {message.created_at.slice(0, 10)}
          </span>
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {open && (
        <div className="mt-4 space-y-3 border-t border-neutral-100 pt-4">
          <p className="text-sm text-neutral-700">{message.message}</p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500">الحالة:</span>
            <select
              defaultValue={message.status}
              disabled={isPending}
              onChange={(e) =>
                startTransition(() =>
                  updateContactMessageStatus(
                    message.id,
                    e.target.value as ContactMessageStatus
                  )
                )
              }
              className={cn(
                "rounded-lg border border-neutral-300 px-2 py-1 text-xs"
              )}
            >
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
