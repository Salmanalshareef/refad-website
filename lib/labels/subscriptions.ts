import type { SubscriptionStatus } from "@/types/db";

export const subscriptionStatusLabels: Record<SubscriptionStatus, string> = {
  pending: "قيد المراجعة",
  active: "اشتراك نشط",
  expired: "منتهي",
  rejected: "مرفوض",
};

export const subscriptionStatusStyles: Record<SubscriptionStatus, string> = {
  pending: "bg-gold-100 text-gold-700",
  active: "bg-primary-50 text-primary-700",
  expired: "bg-neutral-200 text-neutral-600",
  rejected: "bg-red-100 text-red-700",
};
