"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";

export function DeleteButton({
  action,
  confirmMessage = "هل أنت متأكد من الحذف؟",
  disabled = false,
  title,
  // Rows can carry more than one destructive action — removing a photo next
  // to deleting the account — so the wording has to be able to differ.
  label = "حذف",
  icon,
}: {
  action: () => Promise<void>;
  confirmMessage?: string;
  disabled?: boolean;
  title?: string;
  label?: string;
  icon?: React.ReactNode;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={disabled || isPending}
      title={title}
      onClick={() => {
        if (confirm(confirmMessage)) {
          startTransition(() => action());
        }
      }}
      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {icon ?? <Trash2 className="h-3.5 w-3.5" />}
      {label}
    </button>
  );
}
