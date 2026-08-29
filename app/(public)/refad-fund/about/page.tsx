import { PageHeader } from "@/components/shared/PageHeader";
import { Section } from "@/components/shared/Section";
import { FundSubNav } from "@/components/refad-fund/FundSubNav";
import { Eye, Landmark, Target } from "lucide-react";

export default function AboutRefadPage() {
  return (
    <>
      <PageHeader eyebrow="صندوق رفاد" title="عن الصندوق" />
      <FundSubNav />

      <Section>
        <div className="grid gap-8 sm:grid-cols-3">
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <Landmark className="mb-4 h-8 w-8 text-primary-700" />
            <h2 className="mb-2 text-lg font-bold text-primary-900">
              نبذة عن الصندوق
            </h2>
            <p className="text-sm leading-relaxed text-neutral-700">
              الإطار المالي والإداري الذي يحكم شؤون الأسرة، ويهدف إلى تنظيم
              الموارد وتنمية الأصول وتقديم الدعم المستدام لأفراد الأسرة.
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <Eye className="mb-4 h-8 w-8 text-primary-700" />
            <h2 className="mb-2 text-lg font-bold text-primary-900">الرؤية</h2>
            <p className="text-sm leading-relaxed text-neutral-700">
              أن نكون نموذجًا رائدًا ومستدامًا في حوكمة الصناديق العائلية
              وتمكين أفرادها.
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <Target className="mb-4 h-8 w-8 text-primary-700" />
            <h2 className="mb-2 text-lg font-bold text-primary-900">الرسالة</h2>
            <p className="text-sm leading-relaxed text-neutral-700">
              حشد الموارد والجهود المجتمعية لتقديم مبادرات عالية الجودة تعزز
              التكافل بأعلى درجات الشفافية.
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
