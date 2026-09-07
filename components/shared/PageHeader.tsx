import { Reveal } from "@/components/shared/Reveal";

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="bg-primary-800 text-white">
      <Reveal className="mx-auto max-w-6xl px-6 py-14 sm:py-16">
        {eyebrow && (
          <p className="mb-2 text-sm font-semibold text-gold-300">{eyebrow}</p>
        )}
        <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
        {description && (
          <p className="mt-3 max-w-2xl text-primary-100">{description}</p>
        )}
      </Reveal>
    </div>
  );
}
