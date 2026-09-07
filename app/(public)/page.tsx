import { Button } from "@/components/shared/Button";
import { Section } from "@/components/shared/Section";
import { Reveal } from "@/components/shared/Reveal";
import { StatsBanner } from "@/components/home/StatsBanner";
import { HeartHandshake, Sparkles, Users } from "lucide-react";

const values = [
  {
    icon: Users,
    title: "صلة الرحم",
    description: "الدافع الأول لكل ما نقوم به من أعمال وبرامج.",
  },
  {
    icon: HeartHandshake,
    title: "التكافل الاجتماعي",
    description: "دعم أفراد الأسرة في مختلف الظروف الحياتية.",
  },
  {
    icon: Sparkles,
    title: "التميز والتمكين",
    description: "رعاية المواهب وتشجيع التفوق العلمي والمهني.",
  },
];

export default function HomePage() {
  return (
    <>
      <Section tone="primary" className="py-20! sm:py-28!">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <p className="mb-4 text-sm font-semibold tracking-wide text-gold-300">
              صندوق رفاد العائلي
            </p>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">
              جذور راسخة، ومستقبل مشرق
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="mt-6 text-lg leading-relaxed text-primary-100">
              مرحبًا بكم في المنصة الرقمية لعائلة آل معجب، حيث نتواصل ونبني جسور
              التواصل ونمكّن أجيالنا نحو مستقبل مستدام ومتماسك.
            </p>
          </Reveal>
          <Reveal delay={300}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Button
                href="/refad-fund/initiatives"
                variant="secondary"
                className="transition-transform duration-300 hover:-translate-y-0.5"
              >
                استكشف المبادرات
              </Button>
              <Button
                href="/login"
                variant="outline"
                className="border-white text-white transition-transform duration-300 hover:-translate-y-0.5 hover:bg-white/10"
              >
                تسجيل الدخول
              </Button>
            </div>
          </Reveal>
        </div>

        <Reveal delay={400} className="mt-16">
          <StatsBanner />
        </Reveal>
      </Section>

      <Section>
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-primary-900">قيمنا العائلية</h2>
            <p className="mt-3 text-neutral-700">
              تتحد عائلة آل معجب بتاريخ عريق ومبادئ راسخة، تكرّس لتعزيز أواصر
              القربى وترسيخ التكافل بين الأجيال.
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {values.map((value, index) => (
            <Reveal key={value.title} delay={index * 120}>
              <div className="group rounded-2xl border border-neutral-200 bg-white p-6 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-700 transition-transform duration-300 group-hover:scale-110">
                  <value.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-primary-900">{value.title}</h3>
                <p className="mt-2 text-sm text-neutral-600">{value.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>
    </>
  );
}
