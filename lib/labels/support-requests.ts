import type { SupportRequestStatus } from "@/types/db";

export const supportRequestStatusLabels: Record<SupportRequestStatus, string> = {
  draft: "مسودة",
  pending: "قيد المراجعة",
  completed: "مكتمل",
  rejected: "مرفوض",
};

export const supportRequestStatusStyles: Record<SupportRequestStatus, string> = {
  draft: "bg-neutral-200 text-neutral-600",
  pending: "bg-gold-100 text-gold-700",
  completed: "bg-primary-50 text-primary-700",
  rejected: "bg-red-100 text-red-700",
};
