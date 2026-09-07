import { PageHeader } from "@/components/shared/PageHeader";
import { Section } from "@/components/shared/Section";
import { Reveal } from "@/components/shared/Reveal";
import { ContactForm } from "@/components/forms/ContactForm";
import { Mail, MapPin, Phone } from "lucide-react";

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="تواصل معنا"
        title="تواصل معنا"
        description="نسعد باستقبال استفساراتكم وملاحظاتكم في أي وقت."
      />

      <Section>
        <div className="grid gap-12 lg:grid-cols-5">
          <Reveal className="lg:col-span-2">
            <h2 className="mb-6 text-xl font-bold text-primary-900">
              معلومات التواصل
            </h2>
            <ul className="space-y-5 text-sm text-neutral-700">
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-5 w-5 shrink-0 text-primary-700" />
                <div>
                  <p className="font-medium text-neutral-900">البريد الإلكتروني</p>
                  <p dir="ltr" className="text-left">info@refad.sa</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 h-5 w-5 shrink-0 text-primary-700" />
                <div>
                  <p className="font-medium text-neutral-900">الجوال / واتساب</p>
                  <p dir="ltr" className="text-left">+966 5X XXX XXXX</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary-700" />
                <div>
                  <p className="font-medium text-neutral-900">الموقع</p>
                  <p>المملكة العربية السعودية</p>
                </div>
              </li>
            </ul>
          </Reveal>

          <Reveal delay={150} className="lg:col-span-3">
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
              <ContactForm />
            </div>
          </Reveal>
        </div>
      </Section>
    </>
  );
}
