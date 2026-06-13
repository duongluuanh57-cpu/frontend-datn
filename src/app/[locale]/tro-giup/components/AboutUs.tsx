 'use client';

import { useLocale } from 'next-intl';
import { CheckCircle, Users } from 'lucide-react';
import { Link } from '@/navigation';

export function AboutUs() {
  const locale = useLocale();
  const isVi = locale === 'vi';

  return (
    <section className="w-full py-12 lg:py-20 bg-gradient-to-b from-white/40 to-transparent">
      <div className="max-w-container mx-auto px-6">
        <div className="bg-white/30 border border-[#D4A5A5]/10 rounded-xl p-6 lg:p-10 flex flex-col lg:flex-row items-center gap-8">
          <div className="flex-1">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#D4A5A5]">
              {isVi ? 'VỀ CHÚNG TÔI' : 'ABOUT US'}
            </span>
            <h2 className="mt-4 text-2xl md:text-3xl lg:text-4xl font-medium text-[#7A5C5C]" style={{ fontFamily: 'var(--font-heading), serif' }}>
              {isVi ? 'Gặp gỡ đội ngũ đam mê tạo ra trải nghiệm tinh tế' : 'Meet the team crafting thoughtful experiences'}
            </h2>
            <p className="mt-4 text-sm text-[#7A5C5C]/80 max-w-[680px] leading-relaxed font-medium">
              {isVi
                ? 'Chúng tôi tạo ra sản phẩm với niềm tin rằng sự tỉ mỉ trong từng chi tiết tạo nên trải nghiệm khách hàng khác biệt. Từ thiết kế, lựa chọn hương thơm đến dịch vụ sau bán hàng — tất cả đều hướng tới sự hài lòng dài lâu.'
                : 'We build products believing that attention to detail creates standout customer experiences. From design and scent selection to aftercare, everything aims for lasting satisfaction.'}
            </p>

            <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <li className="flex items-start gap-3">
                <span className="text-[#D4A5A5] mt-1"><CheckCircle size={18} /></span>
                <div>
                  <div className="text-sm font-medium text-[#7A5C5C]">{isVi ? 'Chất lượng hàng đầu' : 'Premium quality'}</div>
                  <div className="text-xs text-[#7A5C5C]/70">{isVi ? 'Sản phẩm được chọn lọc và kiểm định nghiêm ngặt.' : 'Curated, rigorously tested products.'}</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#D4A5A5] mt-1"><Users size={18} /></span>
                <div>
                  <div className="text-sm font-medium text-[#7A5C5C]">{isVi ? 'Hỗ trợ tận tâm' : 'Dedicated support'}</div>
                  <div className="text-xs text-[#7A5C5C]/70">{isVi ? 'Đội ngũ sẵn sàng hỗ trợ mọi thắc mắc của bạn.' : 'A team ready to help with any questions.'}</div>
                </div>
              </li>
            </ul>

            <div className="mt-6">
              <Link
                href="/about"
                className="inline-block bg-[#D4A5A5] text-white px-5 py-3 rounded-full text-sm font-medium shadow-sm hover:opacity-95 transition"
              >
                {isVi ? 'Tìm hiểu thêm' : 'Learn more'}
              </Link>
            </div>
          </div>

          <div className="w-full lg:w-1/3 flex-shrink-0">
            <div className="relative rounded-lg overflow-hidden border border-[#D4A5A5]/10 shadow-md">
              <img src="/images/banner-1.webp" alt={isVi ? 'Về chúng tôi' : 'About us'} className="w-full h-48 object-cover" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
