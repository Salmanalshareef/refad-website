"use client";

import { useState } from "react";
import { Modal } from "@/components/shared/Modal";

const TERMS = [
  {
    title: "صحة البيانات",
    body: "أقر بأن جميع البيانات والمعلومات والمستندات المقدمة صحيحة ودقيقة وحديثة، وأتحمل كامل المسؤولية عن أي معلومات خاطئة أو ناقصة.",
  },
  {
    title: "أهلية التقديم",
    body: "الاستفادة من المبادرات مقصورة على أفراد الأسرة المستحقين وفق النظام الأساسي للصندوق ومطلبات كل مبادرة.",
  },
  {
    title: "مراجعة الطلبات",
    body: "تقديم الطلب لا يعني الاستحقاق الفوري أو التلقائي؛ وتخضع جميع الطلبات للمراجعة والتقييم من قبل إدارة الصندوق أو اللجان المختصة وفق الميزانيات والمعايير المتاحة.",
  },
  {
    title: "الخصوصية وحماية البيانات",
    body: "يلتزم الصندوق بالحفاظ على سرية البيانات الشخصية والمستندات المرفوعة، ولا يحق استخدامها أو الاطلاع عليها إلا من قبل المختصين بالصندوق ولأغراض المبادرة فقط.",
  },
  {
    title: "إيداع الوثائق والمستندات",
    body: "عند تقديم وثائق خاصة بالأسرة، يقر المتقدم بأنه صاحب الصفة أو المأذون له بتقديمها، وأن الصندوق يُعد جهة حفظ أو أرشفة فقط ولا يتحمل أي مسؤولية قانونية عن صحة ملكية هذه الوثائق.",
  },
  {
    title: "التحديث والإلغاء",
    body: "يحق لإدارة الصندوق تعديل ضوابط المبادرات أو إيقافها، أو طلب مستندات إضافية، أو إلغاء أي طلب يتبين عدم مطابقته للشروط دون أدنى مسؤولية.",
  },
];

export function InitiativeTermsModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          // This sits inside a <label> wrapping the acceptance checkbox —
          // without this, clicking it would also toggle that checkbox.
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        className="font-bold text-primary-700 underline underline-offset-2 hover:text-primary-800"
      >
        الشروط والأحكام
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="الشروط والأحكام العامة لمبادرات الصندوق"
      >
        <div className="space-y-4 text-sm leading-relaxed text-neutral-700">
          <p>قبل تقديم الطلب، يرجى قراءة الشروط والأحكام التالية والموافقة عليها:</p>
          <ol className="list-inside list-decimal space-y-3">
            {TERMS.map((term) => (
              <li key={term.title}>
                <span className="font-bold text-primary-900">{term.title}: </span>
                {term.body}
              </li>
            ))}
          </ol>
        </div>
      </Modal>
    </>
  );
}
