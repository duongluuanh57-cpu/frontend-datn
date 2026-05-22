import { setRequestLocale } from 'next-intl/server';
import { FadeIn } from '@/components/animations/FadeIn';
import { FAQCategorySelect } from './components/FAQCategorySelect';
import { PopularFAQ } from './components/PopularFAQ';

export default async function HelpCenterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isVi = locale === 'vi';

  return (
    <main className="min-h-screen bg-transparent">
      <section className="w-full pt-16 pb-8 lg:pt-20 lg:pb-12 overflow-hidden border-b border-[#D4A5A5]/10">
        <div className="max-w-[1400px] mx-auto px-6">
          <FadeIn>
            <div className="flex flex-col items-center text-center">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#D4A5A5]">
                {isVi ? "TRUNG TÂM TRỢ GIÚP" : "HELP CENTER"}
              </span>
              <h1 className="mt-4 text-4xl md:text-5xl lg:text-6xl font-medium text-[#7A5C5C]"
                style={{ fontFamily: 'var(--font-heading), serif' }}>
                {isVi ? 'Chúng tôi có thể giúp gì cho bạn?' : 'How can we help you?'}
              </h1>
              <p className="mt-4 text-sm text-[#7A5C5C]/60 max-w-[600px] font-medium leading-relaxed">
                {isVi
                  ? 'Khám phá hơn 50 câu hỏi thường gặp được phân loại theo chủ đề để giải đáp mọi thắc mắc của bạn.'
                  : 'Explore over 50 frequently asked questions organized by topic to answer all your queries.'}
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="w-full py-12 lg:py-16">
        <div className="max-w-[1000px] mx-auto px-6">
          <PopularFAQ />
          <FAQCategorySelect />
        </div>
      </section>
    </main>
  );
}
