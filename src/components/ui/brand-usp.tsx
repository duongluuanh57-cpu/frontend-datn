'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, Sparkles, Truck, Gift } from 'lucide-react';
import { useLocale } from 'next-intl';

const USPS = {
  vi: [
    {
      icon: ShieldCheck,
      title: '100% CHÍNH HÃNG',
      desc: 'Cam kết chính hãng, nhập khẩu trực tiếp từ Pháp & Ý, có hóa đơn đầy đủ.'
    },
    {
      icon: Sparkles,
      title: 'HƯƠNG THƠM ĐẶC SẮC',
      desc: 'Bộ sưu tập các dòng nước hoa Niche được tuyển chọn kỹ lưỡng.'
    },
    {
      icon: Truck,
      title: 'GIAO HÀNH NHANH',
      desc: 'Miễn phí giao hàng toàn quốc cho đơn từ 500.000đ.'
    },
    {
      icon: Gift,
      title: 'QUÀ TẶNG ĐẸP',
      desc: 'Đóng gói quà tặng tinh tế kèm thiệp viết tay.'
    }
  ],
  en: [
    {
      icon: ShieldCheck,
      title: '100% AUTHENTIC',
      desc: '100% authentic perfumes imported directly from France & Italy.'
    },
    {
      icon: Sparkles,
      title: 'CURATED SCENTS',
      desc: 'Carefully selected Niche fragrances for every preference.'
    },
    {
      icon: Truck,
      title: 'FAST DELIVERY',
      desc: 'Free nationwide shipping for orders over 500,000đ.'
    },
    {
      icon: Gift,
      title: 'BEAUTIFUL PACKAGING',
      desc: 'Elegant gift wrapping with a handwritten card included.'
    }
  ]
};

export function BrandUsp() {
  const locale = useLocale();
  const currentUsps = locale === 'vi' ? USPS.vi : USPS.en;

  return (
    <section className="relative mx-[calc(2rem+40px)] w-[calc(100%-4rem-80px)] bg-transparent pt-12 pb-10 lg:pt-20 lg:pb-14 overflow-hidden"
      style={{ contain: 'content', contentVisibility: 'auto' } as React.CSSProperties}>

      <div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {currentUsps.map((usp, index) => {
            const Icon = usp.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -4 }}
                className="group relative flex flex-col items-center p-6 text-center rounded-xl border border-[#D4A5A5]/10 bg-white/60 shadow-sm hover:shadow-md hover:border-[#D4A5A5]/20 transition-all duration-300"
              >
                <div className="relative mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm border border-[#D4A5A5]/10 text-[#D4A5A5]">
                  <Icon size={22} className="stroke-[1.6]" />
                </div>

                <h3 className="text-xs font-bold uppercase tracking-[0.22em] text-[#7A5C5C] mb-2">
                  {usp.title}
                </h3>

                <p className="text-[11px] leading-relaxed text-[#7A5C5C]/70 font-medium max-w-[240px]">
                  {usp.desc}
                </p>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
