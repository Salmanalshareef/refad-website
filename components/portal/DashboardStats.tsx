import Link from "next/link";
import { ClipboardList, Sparkles, Users2, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * A dashboard tile. Every one links somewhere and carries a line telling the
 * member what to do about it — a bare number they cannot act on is not worth
 * the space, and with several counts still at zero the hint is what carries
 * the tile until the data fills in.
 */
function StatTile({
  href,
  label,
  value,
  hint,
  icon,
  tone = "neutral",
}: {
  href: string;
  label: string;
  value: string;
  hint: string;
  icon: React.ReactNode;
  tone?: "neutral" | "attention";
}) {
  return (
    <Link
      href={href}
      className="flex flex-col rounded-2xl border border-neutral-200 bg-neutral-50 p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-md"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-neutral-600">{label}</span>
        <span
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
            tone === "attention"
              ? "bg-gold-100 text-gold-600"
              : "bg-primary-50 text-primary-700"
          )}
        >
          {icon}
        </span>
      </div>
      <p className="mt-3 text-2xl font-extrabold text-primary-900">{value}</p>
      <p className="mt-1 text-xs text-neutral-500">{hint}</p>
    </Link>
  );
}

export function DashboardStats({
  subscriptionLabel,
  subscriptionHint,
  subscriptionNeedsAction,
  openRequests,
  openInitiatives,
  familyMembers,
}: {
  subscriptionLabel: string;
  subscriptionHint: string;
  subscriptionNeedsAction: boolean;
  openRequests: number;
  openInitiatives: number;
  familyMembers: number;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatTile
        href="/portal/subscriptions"
        label="الاشتراك"
        value={subscriptionLabel}
        hint={subscriptionHint}
        icon={<Wallet className="h-4 w-4" />}
        tone={subscriptionNeedsAction ? "attention" : "neutral"}
      />
      <StatTile
        href="/portal/services/requests"
        label="طلباتي"
        value={String(openRequests)}
        hint={openRequests > 0 ? "طلب قيد المراجعة" : "لا توجد طلبات قيد المراجعة"}
        icon={<ClipboardList className="h-4 w-4" />}
        tone={openRequests > 0 ? "attention" : "neutral"}
      />
      <StatTile
        href="/portal/services"
        label="مبادرات متاحة"
        value={String(openInitiatives)}
        hint={openInitiatives > 0 ? "مفتوحة للتقديم الآن" : "لا توجد مبادرات مفتوحة حاليًا"}
        icon={<Sparkles className="h-4 w-4" />}
      />
      <StatTile
        href="/portal/family-tree"
        label="أفراد الأسرة"
        value={String(familyMembers)}
        hint="استعرض شجرة الأسرة"
        icon={<Users2 className="h-4 w-4" />}
      />
    </div>
  );
}
