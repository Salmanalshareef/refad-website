"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ChevronDown,
  ClipboardList,
  Gauge,
  GitBranch,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Newspaper,
  Settings,
  SlidersHorizontal,
  User,
  Users2,
  Wallet,
} from "lucide-react";
import { ThemeSwitcher } from "@/components/portal/ThemeSwitcher";
import { cn } from "@/lib/utils";
import { logout } from "@/app/actions/auth";

const links = [
  { href: "/portal", label: "لوحة التحكم", icon: LayoutDashboard, exact: true },
  { href: "/portal/profile", label: "الملف الشخصي", icon: User },
  { href: "/portal/family-tree", label: "شجرة الأسرة", icon: GitBranch },
  { href: "/portal/services", label: "المبادرات", icon: Settings },
  { href: "/portal/news", label: "أخبار الأسرة والصندوق", icon: Newspaper },
  { href: "/portal/requests", label: "الطلبات الإدارية", icon: ClipboardList },
  { href: "/portal/subscriptions", label: "الاشتراكات", icon: Wallet },
];

const adminGroups = [
  {
    title: "نظرة عامة",
    icon: Gauge,
    items: [
      { href: "/portal/admin", label: "لوحة الإحصائيات", exact: true },
      { href: "/portal/admin/board", label: "مجلس الأمناء" },
      { href: "/portal/admin/reports", label: "التقارير" },
    ],
  },
  {
    title: "الأعضاء والشجرة",
    icon: Users2,
    items: [
      { href: "/portal/admin/members", label: "الأعضاء" },
      { href: "/portal/admin/family-members", label: "شجرة الأسرة" },
    ],
  },
  {
    title: "العمليات والدعم",
    icon: LifeBuoy,
    items: [
      { href: "/portal/admin/tasks", label: "المهام" },
      { href: "/portal/admin/subscriptions", label: "الاشتراكات" },
      { href: "/portal/admin/support-requests", label: "طلبات المبادرات" },
      { href: "/portal/admin/member-requests", label: "الطلبات الإدارية للأعضاء" },
      { href: "/portal/admin/registration-requests", label: "طلبات التسجيل" },
      { href: "/portal/admin/messages", label: "رسائل التواصل" },
    ],
  },
  {
    title: "المركز الإعلامي والمحتوى",
    icon: Newspaper,
    items: [
      { href: "/portal/admin/media/family-news", label: "أخبار الأسرة" },
      { href: "/portal/admin/media/fund-news", label: "أخبار الصندوق" },
      { href: "/portal/admin/media/videos", label: "مكتبة الفيديو" },
      { href: "/portal/admin/media/magazine", label: "مجلة الأسرة" },
    ],
  },
  {
    title: "لوحة الإعدادات",
    icon: SlidersHorizontal,
    items: [
      { href: "/portal/admin/initiative-types", label: "أنواع المبادرات" },
      { href: "/portal/admin/initiatives", label: "المبادرات" },
      { href: "/portal/admin/member-request-types", label: "إدارة الطلبات الإدارية" },
      { href: "/portal/admin/administrators", label: "إدارة المسؤولين" },
    ],
  },
];

export function Sidebar({
  isAdmin,
  open = false,
  onNavigate,
}: {
  isAdmin: boolean;
  /** Drawer state below lg; ignored from lg up, where the column is static. */
  open?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<Set<string>>(
    () =>
      new Set(
        adminGroups
          .filter((group) =>
            group.items.some((item) =>
              item.exact ? pathname === item.href : pathname.startsWith(item.href)
            )
          )
          .map((group) => group.title)
      )
  );

  function toggleGroup(title: string) {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(title)) {
        next.delete(title);
      } else {
        next.add(title);
      }
      return next;
    });
  }

  return (
    <aside
      className={cn(
        "fixed inset-y-0 start-0 z-50 flex w-72 max-w-[80vw] flex-col border-e border-neutral-200 bg-neutral-50",
        // visibility is transitioned alongside transform so the panel stays on
        // screen for the slide out and only then hides. Hidden matters: an
        // off-screen drawer that is merely translated still takes keyboard
        // focus, so tabbing would walk into an invisible menu.
        "transition-[transform,visibility] duration-300 ease-out",
        "lg:static lg:z-auto lg:w-64 lg:max-w-none lg:shrink-0 lg:translate-x-0 lg:visible",
        open ? "visible translate-x-0" : "invisible translate-x-full"
      )}
    >
      <Link
        href="/"
        onClick={onNavigate}
        className="flex shrink-0 items-center justify-center border-b border-neutral-200 px-6 py-6"
      >
        <Image
          src="/logo-portal.png"
          alt="صندوق رفاد"
          width={180}
          height={120}
          className="theme-light-only h-[120px] w-auto object-contain"
          priority
        />
        <Image
          src="/logo-portal-dark.png"
          alt=""
          aria-hidden
          width={180}
          height={120}
          className="theme-dark-only h-[120px] w-auto object-contain"
          priority
        />
      </Link>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
        {links.map((link) => {
          const active = link.exact
            ? pathname === link.href
            : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary-50 text-primary-800"
                  : "text-neutral-700 hover:bg-neutral-100"
              )}
            >
              <link.icon className="h-5 w-5" />
              {link.label}
            </Link>
          );
        })}

        {isAdmin && (
          <>
            <p className="px-3 pt-4 pb-1 text-xs font-semibold text-neutral-500">
              الإدارة
            </p>
            {adminGroups.map((group) => {
              const open = openGroups.has(group.title);
              return (
                <div key={group.title} className="mt-1 first:mt-0">
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.title)}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-primary-700"
                  >
                    <span className="flex items-center gap-2">
                      <group.icon className="h-4 w-4" />
                      {group.title}
                    </span>
                    <ChevronDown
                      className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")}
                    />
                  </button>
                  {open && (
                    <div className="mt-1 space-y-1">
                      {group.items.map((item) => {
                        const active = item.exact
                          ? pathname === item.href
                          : pathname.startsWith(item.href);
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={onNavigate}
                            className={cn(
                              "block rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                              active
                                ? "bg-primary-50 text-primary-800"
                                : "text-neutral-700 hover:bg-neutral-100"
                            )}
                          >
                            {item.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}
      </nav>

      <div className="space-y-2 border-t border-neutral-200 p-3">
        <ThemeSwitcher />

        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
          >
            <LogOut className="h-5 w-5" />
            تسجيل الخروج
          </button>
        </form>
      </div>
    </aside>
  );
}
