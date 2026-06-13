import { setRequestLocale } from 'next-intl/server';
import { FadeIn } from '@/components/animations/FadeIn';
import { Link } from '@/navigation';
import NewsletterForm from '@/components/NewsletterForm';

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isVi = locale === 'vi';

  return (
    <main className="min-h-screen bg-transparent">
      <section className="w-full pt-16 pb-8 lg:pt-20 lg:pb-12 overflow-hidden border-b border-[#D4A5A5]/10">
        <div className="max-w-container mx-auto px-6">
          <FadeIn>
            <div className="flex flex-col items-center text-center">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#D4A5A5]">
                {isVi ? 'VỀ CHÚNG TÔI' : 'ABOUT US'}
              </span>
              <h1 className="mt-4 text-4xl md:text-5xl lg:text-6xl font-medium text-[#7A5C5C]"
                style={{ fontFamily: 'var(--font-heading), serif' }}>
                {isVi ? 'Câu chuyện đằng sau thương hiệu' : 'The story behind our brand'}
              </h1>

              <p className="mt-6 text-base md:text-lg text-[#4B3A3A]/90 max-w-[900px] font-medium leading-relaxed">
                {isVi ? (
                  "L'essence được sáng lập bởi những chuyên gia có hơn 15 năm kinh nghiệm trong ngành hương liệu cao cấp. Chúng tôi nghiên cứu kỹ nguồn gốc nguyên liệu, thực hiện thử nghiệm an toàn độc lập và hợp tác với nhà điều chế uy tín để tạo nên những hương thơm có chiều sâu. Cam kết của chúng tôi: minh bạch nguồn gốc, tiêu chuẩn kiểm định nghiêm ngặt và dịch vụ hậu mãi tận tâm."
                ) : (
                  "Founded by industry experts with over 15 years' experience, L'essence investigates ingredient provenance, conducts independent safety testing, and collaborates with esteemed perfumers to craft scents of real depth. Our commitments: transparent sourcing, strict verification standards, and caring after-sales service."
                )}
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="w-full py-12 lg:py-16">
        <div className="max-w-container mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white/30 border border-[#D4A5A5]/10 rounded-xl p-6">
              <h2 className="text-2xl font-medium text-[#7A5C5C]" style={{ fontFamily: 'var(--font-heading), serif' }}>
                {isVi ? 'Hành trình của chúng tôi' : 'Our journey'}
              </h2>
              <p className="mt-4 text-sm text-[#4B3A3A]/85 leading-relaxed font-medium">
                {isVi ? (
                  "Từ cửa hàng chuyên biệt, L'essence lớn mạnh dựa trên phương pháp tiếp cận khoa học: phân tích thành phần, thử nghiệm an toàn và theo dõi trải nghiệm người dùng. Chúng tôi làm việc trực tiếp với nhà cung cấp có chứng nhận và duy trì quy trình kiểm soát chất lượng tại mọi bước sản xuất để đảm bảo sự nhất quán và an tâm cho khách hàng."
                ) : (
                  "From a specialised boutique to a recognised house, L'essence follows a scientific approach: ingredient analysis, safety testing, and user feedback. We work directly with certified suppliers and maintain quality controls at every production stage to ensure consistency and customer peace of mind."
                )}
              </p>

              <h3 className="mt-6 text-lg font-medium text-[#7A5C5C]">{isVi ? 'Cột mốc chính' : 'Milestones'}</h3>
              <ul className="mt-3 space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-10 text-sm font-bold text-[#C08497]">2018</div>
                  <div className="text-sm text-[#4B3A3A]/85">{isVi ? 'Thành lập bởi nhóm chuyên gia hương liệu và ra mắt bộ sưu tập khai sinh, đặt nền tảng cho phong cách riêng.' : 'Founded by fragrance experts and launched our inaugural collection, setting the tone for our signature style.'}</div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-10 text-sm font-bold text-[#C08497]">2020</div>
                  <div className="text-sm text-[#4B3A3A]/85">{isVi ? 'Mở rộng hợp tác với nhà điều chế châu Âu, áp dụng quy trình kiểm soát chất lượng nghiêm ngặt.' : 'Expanded collaborations with European perfumers and implemented rigorous quality controls.'}</div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-10 text-sm font-bold text-[#C08497]">2023</div>
                  <div className="text-sm text-[#4B3A3A]/85">{isVi ? 'Hoàn tất chuỗi kiểm định thành phần và nhận các chứng nhận an toàn độc lập.' : 'Completed ingredient verification and received independent safety certifications.'}</div>
                </li>
              </ul>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/30 border border-[#D4A5A5]/10 rounded-xl p-6">
                <h4 className="text-base font-medium text-[#4B3A3A]">{isVi ? 'Nguồn nguyên liệu & gia công' : 'Sourcing & Craftsmanship'}</h4>
                <p className="mt-3 text-sm text-[#4B3A3A]/80">{isVi ? "L'essence ưu tiên nhà cung cấp có hồ sơ rõ ràng và chứng nhận; mọi lô nguyên liệu đều được kiểm nghiệm độc lập trước khi đưa vào pha chế." : "L'essence prioritises suppliers with documented provenance and certification; each batch is independently tested before formulation."}</p>
                <ul className="mt-3 text-sm text-[#7A5C5C]/80 space-y-2">
                  <li>• {isVi ? 'Nguyên liệu từ các nhà cung cấp được kiểm định' : 'Certified supplier ingredients'}</li>
                  <li>• {isVi ? 'Pha chế bởi nhà điều chế có kinh nghiệm' : 'Formulated by experienced perfumers'}</li>
                </ul>
              </div>

              <div className="bg-white/30 border border-[#D4A5A5]/10 rounded-xl p-6">
                <h4 className="text-base font-medium text-[#4B3A3A]">{isVi ? 'Chứng nhận & Báo chí' : 'Certifications & Press'}</h4>
                <p className="mt-3 text-sm text-[#4B3A3A]/80">{isVi ? 'Chúng tôi công bố kết quả kiểm nghiệm độc lập và được giới thiệu bởi các ấn phẩm ngành, nhằm tăng tính minh bạch và niềm tin khách hàng.' : 'We publish independent testing outcomes and are featured in industry publications to increase transparency and customer trust.'}</p>
                <div className="mt-4 flex gap-3 items-center">
                  <img src="/images/banner-2.webp" alt="badge" className="w-20 h-12 object-contain" />
                  <img src="/images/banner-4.webp" alt="press" className="w-20 h-12 object-contain" />
                </div>
              </div>
            </div>

            <div className="bg-white/30 border border-[#D4A5A5]/10 rounded-xl p-6">
              <h4 className="text-base font-medium text-[#4B3A3A]">{isVi ? 'Khách hàng nói gì' : 'What customers say'}</h4>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <blockquote className="p-4 bg-white/50 ring-1 ring-[#D4A5A5]/10 rounded-lg text-sm text-[#4B3A3A]/85">"{isVi ? 'Hương thơm tinh tế, lớp hương chuyển hoá đẹp và độ bám ấn tượng.' : 'A refined scent with elegant evolution and impressive longevity.'}"</blockquote>
                <blockquote className="p-4 bg-white/50 ring-1 ring-[#D4A5A5]/10 rounded-lg text-sm text-[#4B3A3A]/85">"{isVi ? 'Giao hàng đúng hẹn, bao bì cao cấp và hỗ trợ sau bán hàng tận tâm.' : 'On-time delivery, premium packaging, and attentive after-sales support.'}"</blockquote>
                <blockquote className="p-4 bg-white/50 ring-1 ring-[#D4A5A5]/10 rounded-lg text-sm text-[#4B3A3A]/85">"{isVi ? 'Sản phẩm đáng tin cậy — lựa chọn hoàn hảo làm quà tặng doanh nghiệp.' : 'Reliable products — an excellent choice for corporate gifting.'}"</blockquote>
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="bg-white/30 border border-[#D4A5A5]/10 rounded-xl p-6">
              <h4 className="text-base font-medium text-[#4B3A3A]">{isVi ? 'Đội ngũ' : 'Team'}</h4>
              <div className="mt-4 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#D4A5A5]/20 flex items-center justify-center text-[#7A5C5C]">A</div>
                  <div>
                    <div className="text-sm font-medium">{isVi ? 'Nguyễn An, MSc' : 'Nguyen An, MSc'}</div>
                    <div className="text-xs text-[#4B3A3A]/70">{isVi ? 'Người sáng lập — Chuyên gia hương liệu, 15+ năm kinh nghiệm' : 'Founder — Fragrance specialist, 15+ years experience'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#D4A5A5]/20 flex items-center justify-center text-[#7A5C5C]">M</div>
                  <div>
                    <div className="text-sm font-medium">{isVi ? 'Mai Linh' : 'Mai Linh'}</div>
                    <div className="text-xs text-[#4B3A3A]/70">{isVi ? 'Giám đốc sáng tạo — Thiết kế & nhận diện thương hiệu' : 'Creative Director — Design & brand identity'}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/30 border border-[#D4A5A5]/10 rounded-xl p-6">
              <h4 className="text-base font-medium text-[#7A5C5C]">{isVi ? 'Liên hệ & Tin tức' : 'Contact & News'}</h4>
              <p className="mt-3 text-sm text-[#7A5C5C]/80">{isVi ? 'Email: support@lessence.example' : 'Email: support@lessence.example'}</p>
              <NewsletterForm isVi={isVi} />
            </div>

            <div className="bg-white/30 border border-[#D4A5A5]/10 rounded-xl p-6 text-center">
              <Link href="/tro-giup" className="text-sm font-medium text-[#7A5C5C] underline">{isVi ? 'Trung tâm trợ giúp' : 'Help Center'}</Link>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
