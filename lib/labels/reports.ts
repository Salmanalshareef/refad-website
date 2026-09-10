import type { ReportType } from "@/types/db";

export const reportTypeLabels: Record<ReportType, string> = {
  financial: "التقارير المالية",
  performance: "التقارير السنوية",
  minutes: "محاضر الاجتماعات",
};
