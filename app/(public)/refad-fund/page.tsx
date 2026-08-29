import Link from "next/link";
import { PageHeader } from "@/components/shared/PageHeader";
import { Section } from "@/components/shared/Section";
import { FileText, Landmark, Sprout, Users2 } from "lucide-react";

const sections = [
  {
    href: "/refad-fund/about",
    icon: Landmark,
    title: "عن الصندوق",
    description: "الرؤية والرسالة والإطار الإداري لصندوق رفاد.",
  },
  {
    href: "/refad-fund/board-of-trustees",
    icon: Users2,
    title: "مجلس الأمناء",
    description: "الهيكل القيادي والفريق المشرف على الصندوق.",
  },
  {
    href: "/refad-fund/initiatives",
    icon: Sprout,
    title: "المبادرات",
    description: "برامج الدعم الاجتماعي والتفوق العلمي والفعاليات والاستثمار.",
  },
  {
    href: "/refad-fund/reports",
    icon: FileText,
    title: "التقارير",
    description: "التقارير المالية وتقارير الأداء ومحاضر الاجتماعات.",
  },
];

export default function RefadFundPage() {
  return (
    <>
      <PageHeader
        eyebrow="صندوق رفاد"
        title="صندوق رفاد العائلي"
        description="الإطار المالي والإداري الذي يحكم شؤون الأسرة، بهدف تنظيم الموارد وتنمية الأصول وتقديم الدعم المستدام."
      />

      <Section>
        <div className="grid gap-6 sm:grid-cols-2">
          {sections.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-700 transition-colors group-hover:bg-primary-600 group-hover:text-white">
                <item.icon className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-bold text-primary-900">{item.title}</h2>
              <p className="mt-2 text-sm text-neutral-600">{item.description}</p>
            </Link>
          ))}
        </div>
      </Section>
    </>
  );
}
