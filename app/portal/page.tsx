import Link from "next/link";
import { requireProfile } from "@/lib/auth";
import { Card } from "@/components/shared/Card";
import { GitBranch, Settings, User, Wallet } from "lucide-react";

const quickLinks = [
  { href: "/portal/profile", label: "الملف الشخصي", icon: User, description: "عرض وتحديث بياناتك." },
  { href: "/portal/family-tree", label: "شجرة الأسرة", icon: GitBranch, description: "استعرض شجرة الأسرة التفاعلية." },
  { href: "/portal/services", label: "المبادرات", icon: Settings, description: "تصفح المبادرات وقدّم طلب دعم." },
  { href: "/portal/subscriptions", label: "الاشتراكات", icon: Wallet, description: "تابع حالة اشتراكك." },
];

export default async function PortalDashboardPage() {
  const profile = await requireProfile();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-primary-900">
          أهلاً بك، {profile.full_name}
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          هذه لوحة التحكم الخاصة بك في منصة صندوق رفاد العائلي.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {quickLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <link.icon className="mb-3 h-8 w-8 text-primary-700" />
              <h2 className="font-bold text-primary-900">{link.label}</h2>
              <p className="mt-1 text-sm text-neutral-600">{link.description}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
