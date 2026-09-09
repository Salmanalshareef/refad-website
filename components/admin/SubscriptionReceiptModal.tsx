"use client";

import { useState } from "react";
import Image from "next/image";
import { Eye } from "lucide-react";
import { Modal } from "@/components/shared/Modal";

export function SubscriptionReceiptModal({ receiptUrl }: { receiptUrl: string | null }) {
  const [open, setOpen] = useState(false);

  if (!receiptUrl) {
    return <span className="text-xs text-neutral-400">لا يوجد إيصال</span>;
  }

  const isPdf = receiptUrl.toLowerCase().endsWith(".pdf");

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-primary-700 hover:bg-primary-50"
      >
        <Eye className="h-3.5 w-3.5" />
        معاينة الإيصال
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="الإيصال البنكي">
        {isPdf ? (
          <iframe src={receiptUrl} title="الإيصال البنكي" className="h-[70vh] w-full rounded-lg" />
        ) : (
          <div className="relative h-[70vh] w-full">
            <Image
              src={receiptUrl}
              alt="الإيصال البنكي"
              fill
              unoptimized
              className="rounded-lg object-contain"
            />
          </div>
        )}
      </Modal>
    </>
  );
}
