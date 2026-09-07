import { PageHeader } from "@/components/shared/PageHeader";
import { Section } from "@/components/shared/Section";
import { Reveal } from "@/components/shared/Reveal";
import { FundSubNav } from "@/components/refad-fund/FundSubNav";
import { Eye, Landmark, Target } from "lucide-react";

const cards = [
  {
    icon: Landmark,
    title: "نبذة عن الصندوق",
    description:
      "الإطار المالي والإداري الذي يحكم شؤون الأسرة، ويهدف إلى تنظيم الموارد وتنمية الأصول وتقديم الدعم المستدام لأفراد الأسرة.",
  },
  {
    icon: Eye,
    title: "الرؤية",
    description: "أن نكون نموذجًا رائدًا ومستدامًا في حوكمة الصناديق العائلية وتمكين أفرادها.",
  },
  {
    icon: Target,
    title: "الرسالة",
    description:
      "حشد الموارد والجهود المجتمعية لتقديم مبادرات عالية الجودة تعزز التكافل بأعلى درجات الشفافية.",
  },
];

export default function AboutRefadPage() {
  return (
    <>
      <PageHeader eyebrow="صندوق رفاد" title="عن الصندوق" />
      <FundSubNav />

      <Section>
        <div className="grid gap-8 sm:grid-cols-3">
          {cards.map((card, index) => (
            <Reveal key={card.title} delay={index * 100}>
              <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <card.icon className="mb-4 h-8 w-8 text-primary-700" />
                <h2 className="mb-2 text-lg font-bold text-primary-900">{card.title}</h2>
                <p className="text-sm leading-relaxed text-neutral-700">{card.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>
    </>
  );
}
