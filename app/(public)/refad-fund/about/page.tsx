import { PageHeader } from "@/components/shared/PageHeader";
import { Section } from "@/components/shared/Section";
import { Reveal } from "@/components/shared/Reveal";
import { FundSubNav } from "@/components/refad-fund/FundSubNav";
import { Building2, Eye, HeartHandshake, Landmark, Target, Users } from "lucide-react";

const pillars = [
  {
    icon: Eye,
    title: "الرؤية",
    description: "تعزيز صلة الرحم وتحقيق التكافل والتنمية لأفراد الأسرة.",
    tone: "primary" as const,
  },
  {
    icon: Target,
    title: "الرسالة",
    description:
      "الارتقاء بكيان الأسرة من خلال تقديم برامج ومبادرات تدعم الاحتياجات الأساسية والتنموية، مع تعزيز أواصر التكاتف والتكافل الاجتماعي بين أفرادها، عبر منظومة عمل مؤسسي محكم يضمن استدامة الأثر.",
    tone: "gold" as const,
  },
];

const values = [
  { icon: Users, title: "صلة الرحم", color: "#DFBC95" },
  { icon: HeartHandshake, title: "التكافل الاجتماعي", color: "#007B76" },
  { icon: Building2, title: "العمل المؤسسي", color: "#163F47" },
];

const pillarStyles = {
  primary: {
    card: "border-primary-200 bg-primary-800 text-white",
    icon: "bg-white/10 text-white",
  },
  gold: {
    card: "border-gold-300 bg-gold-400 text-primary-900",
    icon: "bg-white/40 text-primary-900",
  },
};

export default function AboutRefadPage() {
  return (
    <>
      <PageHeader eyebrow="صندوق رفاد" title="عن الصندوق" />
      <FundSubNav />

      <Section>
        <Reveal className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-primary-700">
            <Landmark className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-bold text-primary-900">نبذة عن الصندوق</h2>
          <p className="mt-4 leading-relaxed text-neutral-700">
            صندوق رفاد مؤسسة أهلية رسمية مسجلة بالسجل الخاص بالمؤسسات الأهلية
            الصادر من المركز الوطني لتنمية القطاع غير الربحي برقم 1200777300 وتاريخ {" "}
            <span className="whitespace-nowrap">1447/08/20 هـ</span>، يقع مقر الصندوق
            بمدينة الرياض ومحافظة الأفلاج، ويعنى الصندوق بأسرة آل معجب آل يحيى
            الشريف.
          </p>
        </Reveal>
      </Section>

      <Section tone="muted">
        <div className="grid gap-6 sm:grid-cols-2">
          {pillars.map((pillar, index) => (
            <Reveal key={pillar.title} delay={index * 150}>
              <div
                className={`h-full rounded-2xl border p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${pillarStyles[pillar.tone].card}`}
              >
                <div
                  className={`mb-5 flex h-14 w-14 items-center justify-center rounded-full ${pillarStyles[pillar.tone].icon}`}
                >
                  <pillar.icon className="h-7 w-7" />
                </div>
                <h2 className="text-2xl font-extrabold">{pillar.title}</h2>
                <p className="mt-4 leading-relaxed opacity-90">{pillar.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section>
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-primary-900">قيمنا</h2>
          </div>
        </Reveal>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {values.map((value, index) => (
            <Reveal key={value.title} delay={index * 120}>
              <div
                style={{ backgroundColor: value.color }}
                className="h-full rounded-2xl p-8 text-center text-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-white/15 text-white">
                  <value.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-extrabold">{value.title}</h3>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>
    </>
  );
}
