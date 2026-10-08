import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/forms/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "استعادة كلمة المرور",
  description: "إعادة تعيين كلمة مرور حسابك في بوابة الأعضاء.",
};

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className="mb-1 text-2xl font-bold text-primary-900">
        إعادة تعيين كلمة المرور
      </h1>
      <p className="mb-6 text-sm text-neutral-600">
        أدخل رقم جوالك المسجل وسنرسل لك رمز تحقق لإعادة تعيين كلمة المرور.
      </p>
      <ForgotPasswordForm />
    </>
  );
}
