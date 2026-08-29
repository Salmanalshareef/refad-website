import { PageHeader } from "@/components/shared/PageHeader";
import { Section } from "@/components/shared/Section";
import { Button } from "@/components/shared/Button";
import { GitBranch, HeartHandshake, Sparkles, Users } from "lucide-react";

const values = [
  {
    icon: Users,
    title: "صلة الرحم",
    description: "الدافع الأول لكل ما نقوم به من أعمال وبرامج داخل الأسرة.",
  },
  {
    icon: HeartHandshake,
    title: "التكافل الاجتماعي",
    description: "دعم أفراد الأسرة في مختلف الظروف والمناسبات الحياتية.",
  },
  {
    icon: Sparkles,
    title: "التميز والتمكين",
    description:
      "رعاية المواهب من أبناء الأسرة وتشجيعهم على التفوق العلمي والمهني.",
  },
];

export default function AboutFamilyPage() {
  return (
    <>
      <PageHeader
        eyebrow="عن الأسرة"
        title="عائلة آل معجب"
        description="تاريخ عريق ومبادئ راسخة تجمعنا على مر الأجيال."
      />

      <Section>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold text-primary-900">نبذة عن الأسرة</h2>
          <p className="mt-4 leading-relaxed text-neutral-700">
            تتحد عائلة آل معجب بتاريخ عريق ومبادئ راسخة، وتحرص على تعزيز أواصر
            القربى وترسيخ التكافل بين أبنائها عبر الأجيال المتعاقبة، سعيًا نحو
            بناء منظومة أسرية متماسكة تحفظ الهوية وتدعم التطور المستمر.
          </p>
        </div>
      </Section>

      <Section tone="muted">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold text-primary-900">قيمنا العائلية</h2>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {values.map((value) => (
            <div
              key={value.title}
              className="rounded-2xl border border-neutral-200 bg-white p-6 text-center shadow-sm"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-700">
                <value.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-primary-900">{value.title}</h3>
              <p className="mt-2 text-sm text-neutral-600">{value.description}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <div className="grid items-center gap-10 sm:grid-cols-2">
          <div>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-700">
              <GitBranch className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold text-primary-900">
              شجرة الأسرة
            </h2>
            <p className="mt-4 leading-relaxed text-neutral-700">
              تضم عائلة آل معجب عددًا من الفروع والأجيال الممتدة عبر السنين.
              يمكن لأفراد الأسرة المسجلين تصفح الشجرة التفاعلية الكاملة التي
              توثق الأنساب والفروع العائلية بعد تسجيل الدخول إلى المنصة.
            </p>
            <div className="mt-6">
              <Button href="/login">سجّل الدخول لعرض الشجرة الكاملة</Button>
            </div>
          </div>
          <div className="rounded-2xl border border-dashed border-primary-300 bg-primary-50 p-10 text-center text-primary-700">
            <GitBranch className="mx-auto mb-4 h-16 w-16 opacity-60" />
            <p className="text-sm font-medium">
              معاينة تعريفية لفروع الأسرة — الشجرة الكاملة متاحة للأعضاء
              المسجلين فقط.
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
