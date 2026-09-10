import { Button } from "@/components/shared/Button";
import { Section } from "@/components/shared/Section";
import { Reveal } from "@/components/shared/Reveal";
import { StatsBanner } from "@/components/home/StatsBanner";
import { NewsEventsSlider } from "@/components/home/NewsEventsSlider";
import { getRecentPublishedNewsByCategory } from "@/lib/data/news";

export default async function HomePage() {
  const [familyNews, fundNews] = await Promise.all([
    getRecentPublishedNewsByCategory("family", 3).catch(() => []),
    getRecentPublishedNewsByCategory("fund", 3).catch(() => []),
  ]);

  return (
    <>
      <Section tone="primary" className="py-20! sm:py-28!">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <p className="mb-4 text-sm font-semibold tracking-wide text-gold-300">
              أسرة آل معجب
            </p>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">
              جذور راسخة، ومستقبل مشرق
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="mt-6 text-lg leading-relaxed text-primary-100">
              مرحبًا بكم في موقع أسرة آل معجب، حيث نتواصل ونبني جسور التواصل
              ونمكّن أجيالنا نحو مستقبل مستدام.
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

      {familyNews.length > 0 && (
        <Section>
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold text-primary-900">آخر أخبار الأسرة</h2>
            </div>
          </Reveal>

          <Reveal delay={150} className="mt-12">
            <NewsEventsSlider items={familyNews} />
          </Reveal>
        </Section>
      )}

      {fundNews.length > 0 && (
        <Section tone={familyNews.length > 0 ? "muted" : undefined}>
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold text-primary-900">آخر أخبار الصندوق</h2>
            </div>
          </Reveal>

          <Reveal delay={150} className="mt-12">
            <NewsEventsSlider items={fundNews} />
          </Reveal>
        </Section>
      )}
    </>
  );
}
