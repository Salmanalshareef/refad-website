"use client";

import { useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
import { SupportRequestRow } from "@/components/admin/SupportRequestRow";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  supportRequestStatusLabels,
} from "@/lib/labels/support-requests";
import type { SupportRequestStatus, SupportRequestWithDetails } from "@/types/db";

export function SupportRequestsList({
  requests,
}: {
  requests: SupportRequestWithDetails[];
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<SupportRequestStatus | "all">("all");

  const filtered = useMemo(() => {
    const trimmed = query.trim();
    return requests.filter((request) => {
      const matchesQuery = !trimmed || request.member_name.includes(trimmed);
      const matchesStatus = status === "all" || request.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [requests, query, status]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3 rounded-xl border border-neutral-200 bg-white p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="البحث باسم العضو..."
              className="w-56 rounded-lg border border-neutral-300 px-3 py-2 pe-9 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as SupportRequestStatus | "all")}
            className="rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          >
            <option value="all">كل الحالات</option>
            {Object.entries(supportRequestStatusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <a
          href="/api/admin/support-requests/export"
          className="inline-flex items-center gap-1.5 rounded-lg border border-primary-200 px-3 py-2 text-xs font-semibold text-primary-700 hover:bg-primary-50"
        >
          <Download className="h-3.5 w-3.5" />
          تصدير إلى Excel
        </a>
      </div>

      {filtered.length === 0 && (
        <EmptyState
          message={requests.length === 0 ? "لا توجد طلبات دعم بعد." : "لا توجد نتائج مطابقة."}
        />
      )}
      {filtered.map((request) => (
        <SupportRequestRow key={request.id} request={request} />
      ))}
    </div>
  );
}
