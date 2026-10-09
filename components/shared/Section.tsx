import { cn } from "@/lib/utils";

type SectionProps = {
  className?: string;
  children: React.ReactNode;
  tone?: "default" | "muted" | "primary";
};

const toneClasses = {
  default: "bg-background",
  muted: "bg-neutral-100",
  primary: "bg-primary-800 text-white",
};

export function Section({ className, children, tone = "default" }: SectionProps) {
  return (
    <section className={cn(toneClasses[tone], className)}>
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-20">{children}</div>
    </section>
  );
}
