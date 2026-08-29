import { LoginForm } from "@/components/forms/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <>
      <h1 className="mb-1 text-2xl font-bold text-primary-900">تسجيل الدخول</h1>
      <p className="mb-6 text-sm text-neutral-600">
        سجّل الدخول للوصول إلى لوحة أفراد الأسرة.
      </p>
      <LoginForm next={next} />
    </>
  );
}
