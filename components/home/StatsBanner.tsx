import { Reveal } from "@/components/shared/Reveal";

const stats = [
  { value: "+300", label: "فرد من أفراد الأسرة" },
  { value: "+15", label: "مبادرة وبرنامج" },
  { value: "100%", label: "حوكمة وشفافية" },
];

export function StatsBanner() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
      {stats.map((stat, index) => (
        <Reveal key={stat.label} delay={index * 120}>
          <div className="rounded-2xl border border-primary-700 bg-primary-800/60 px-6 py-8 text-center transition-transform duration-300 hover:-translate-y-1">
            <p className="text-4xl font-extrabold text-gold-300">{stat.value}</p>
            <p className="mt-2 text-sm font-medium text-primary-100">{stat.label}</p>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
