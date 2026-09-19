"use client";

import { FileText } from "lucide-react";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteReport } from "@/app/actions/admin/reports";
import { reportTypeLabels } from "@/lib/labels/reports";
import type { Report } from "@/types/db";

export function ReportRow({ report }: { report: Report }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50 p-4">
      <div className="flex items-center gap-3">
        <FileText className="h-5 w-5 shrink-0 text-primary-700" />
        <div>
          <p className="font-medium text-primary-900">{report.title}</p>
          <p className="text-xs text-neutral-500">
            {reportTypeLabels[report.type]}
            {report.period_label ? ` — ${report.period_label}` : ""}
          </p>
        </div>
      </div>
      <DeleteButton action={() => deleteReport(report.id, report.file_url)} />
    </div>
  );
}
