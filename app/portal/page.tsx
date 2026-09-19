import Link from "next/link";
import { GitBranch, Settings, User, Wallet } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { getRecentPublishedNews } from "@/lib/data/news";
import { getOpenInitiativeCount, getUpcomingInitiatives } from "@/lib/data/initiatives";
import { getLivingFamilyMemberCount } from "@/lib/data/family-tree";
import { getLatestSubscription } from "@/lib/data/subscriptions";
import { getMySupportRequests } from "@/lib/data/support-requests";
import { subscriptionStatusLabels } from "@/lib/labels/subscriptions";
import { DashboardStats } from "@/components/portal/DashboardStats";
import { NewsTicker } from "@/components/portal/NewsTicker";
import { UpcomingInitiatives } from "@/components/portal/UpcomingInitiatives";

const quickLinks = [
  { href: "/portal/profile", label: "الملف الشخصي", icon: User },
  { href: "/portal/family-tree", label: "شجرة الأسرة", icon: GitBranch },
  { href: "/portal/services", label: "المبادرات", icon: Settings },
  { href: "/portal/subscriptions", label: "الاشتراكات", icon: Wallet },
];

export default async function PortalDashboardPage() {
  const profile = await requireProfile();

  // One slow table must not take the whole dashboard down with it, so each
  // panel falls back to an empty state of its own.
  const [news, upcoming, openInitiatives, familyMembers, subscription, myRequests] =
    await Promise.all([
      getRecentPublishedNews(8).catch(() => []),
      getUpcomingInitiatives(4).catch(() => []),
      getOpenInitiativeCount().catch(() => 0),
      getLivingFamilyMemberCount().catch(() => 0),
      getLatestSubscription(profile.id).catch(() => null),
      getMySupportRequests(profile.id).catch(() => []),
    ]);

  const status = subscription?.effective_status ?? null;
  const subscriptionLabel = status ? subscriptionStatusLabels[status] : "غير مشترك";
  const subscriptionHint =
    status === "active"
      ? subscription?.end_date
        ? `ينتهي في ${String(subscription.end_date).slice(0, 10)}`
        : "اشتراكك ساري"
      : status === "pending"
        ? "طلبك قيد المراجعة"
        : status === "expired"
          ? "جدّد اشتراكك الآن"
          : status === "rejected"
            ? "لم يُقبل طلبك — حاول مجددًا"
            : "لا يوجد اشتراك حالي.";

  const openRequests = myRequests.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary-900">
          أهلاً بك، {profile.full_name}
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          هذه لوحة التحكم الخاصة بك في منصة صندوق رفاد
        </p>
      </div>

      <NewsTicker items={news} />

      <DashboardStats
        subscriptionLabel={subscriptionLabel}
        subscriptionHint={subscriptionHint}
        subscriptionNeedsAction={status !== "active"}
        openRequests={openRequests}
        openInitiatives={openInitiatives}
        familyMembers={familyMembers}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <UpcomingInitiatives initiatives={upcoming} />
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5 shadow-sm">
          <h2 className="mb-3 font-bold text-primary-900">روابط سريعة</h2>
          <div className="space-y-1">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-primary-50 hover:text-primary-800"
              >
                <link.icon className="h-4 w-4 shrink-0 text-primary-700" />
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
