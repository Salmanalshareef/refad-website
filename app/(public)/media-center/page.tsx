import Link from "next/link";
import { PageHeader } from "@/components/shared/PageHeader";
import { Section } from "@/components/shared/Section";
import { Reveal } from "@/components/shared/Reveal";
import { BookOpen, Newspaper, PlayCircle, Radio } from "lucide-react";

const sections = [
  {
    href: "/media-center/family-news",
    icon: Newspaper,
    title: "أخبار الأسرة",
    description: "آخر مستجدات وأخبار عائلة آل معجب.",
  },
  {
    href: "/media-center/fund-news",
    icon: Radio,
    title: "أخبار الصندوق",
    description: "آخر مستجدات وأخبار صندوق رفاد العائلي.",
  },
  {
    href: "/media-center/videos",
    icon: PlayCircle,
    title: "مكتبة الفيديو",
    description: "مقاطع فيديو من فعاليات ومبادرات الأسرة والصندوق.",
  },
  {
    href: "/media-center/magazine",
    icon: BookOpen,
    title: "مجلة الأسرة",
    description: "أعداد مجلة الأسرة الدورية.",
  },
];

export default function MediaCenterPage() {
  return (
    <>
      <PageHeader
        eyebrow="مركز الإعلام"
        title="مركز الإعلام"
        description="آخر أخبار الأسرة والصندوق، ومكتبة الفيديو، ومجلة الأسرة."
      />

      <Section>
        <div className="grid gap-6 sm:grid-cols-2">
          {sections.map((item, index) => (
            <Reveal key={item.href} delay={index * 100}>
              <Link
                href={item.href}
                className="group block h-full rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-700 transition-colors group-hover:bg-primary-600 group-hover:text-white">
                  <item.icon className="h-6 w-6" />
                </div>
                <h2 className="text-lg font-bold text-primary-900">{item.title}</h2>
                <p className="mt-2 text-sm text-neutral-600">{item.description}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>
    </>
  );
}
