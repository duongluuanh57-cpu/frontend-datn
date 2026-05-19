'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, Sparkles, Truck, Gift } from 'lucide-react';
import { useLocale } from 'next-intl';

const USPS = {
  vi: [
    {
      icon: ShieldCheck,
      title: '100% CHÍNH HÃNG',
      desc: 'Nước hoa chính hãng nhập khẩu trực tiếp từ Pháp & Ý đầy đủ hóa đơn.'
    },
    {
      icon: Sparkles,
      title: 'HƯƠNG THƠM ĐỘC BẢN',
      desc: 'Tuyển chọn các dòng nước hoa Niche nghệ thuật đầy tinh tế và sang trọng.'
    },
    {
      icon: Truck,
      title: 'GIAO HÀNG HỎA TỐC',
      desc: 'Miễn phí giao hàng toàn quốc cho mọi đơn hàng từ 500.000đ.'
    },
    {
      icon: Gift,
      title: 'HỘP QUÀ CAO CẤP',
      desc: 'Đóng gói sang trọng chuẩn nghệ thuật quà tặng kèm thiệp viết tay ý nghĩa.'
    }
  ],
  en: [
    {
      icon: ShieldCheck,
      title: '100% AUTHENTIC',
      desc: 'Guaranteed 100% original perfumes imported directly from France & Italy.'
    },
    {
      icon: Sparkles,
      title: 'SIGNATURE SCENTS',
      desc: 'Curated selection of artistic Niche fragrances filled with elegance.'
    },
    {
      icon: Truck,
      title: 'EXPRESS DELIVERY',
      desc: 'Free nationwide shipping for all orders starting from 500,000đ.'
    },
    {
      icon: Gift,
      title: 'LUXURY PACKAGING',
      desc: 'Artisanal gift wrapping complete with a premium handwritten card.'
    }
  ]
};

export function BrandUsp() {
  const locale = useLocale();
  const currentUsps = locale === 'vi' ? USPS.vi : USPS.en;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.7, 
        ease: [0.16, 1, 0.3, 1] as const
      } 
    }
  };

  return (
    <section className="relative w-full bg-transparent pt-12 pb-10 lg:pt-20 lg:pb-14 overflow-hidden">
      
      {/* Decorative Liquid Glass Glowing Blobs in the background */}
      <div className="absolute top-1/2 left-1/4 -z-10 h-72 w-72 -translate-y-1/2 rounded-full bg-[#D4A5A5]/8 blur-[80px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -z-10 h-80 w-80 -translate-y-1/2 rounded-full bg-[#E8C5C5]/6 blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-6">
        
        {/* Sleek USP Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {currentUsps.map((usp, index) => {
            const Icon = usp.icon;
            return (
              <motion.div
                key={index}
                variants={cardVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group relative flex flex-col items-center p-7 text-center rounded-2xl border border-white/60 bg-gradient-to-b from-white/45 via-white/30 to-white/15 backdrop-blur-xl shadow-[0_8px_32px_rgba(122,92,92,0.03)] hover:shadow-[0_20px_50px_rgba(212,165,165,0.12),0_0_30px_rgba(212,165,165,0.06)_inset] hover:border-[#D4A5A5]/40 transition-all duration-500 cursor-pointer overflow-hidden"
              >
                {/* Dynamic light reflection & inner glowing aura */}
                <div 
                  className="absolute inset-0 -z-10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle at 50% 50%, rgba(212, 165, 165, 0.16) 0%, transparent 75%)',
                    filter: 'blur(4px)'
                  }}
                />
                
                {/* Icon Container with glowing aura & glass effect */}
                <div className="relative mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-white/90 to-white/60 shadow-md border border-white/80 text-[#D4A5A5] transition-all duration-500 group-hover:scale-110 group-hover:from-white group-hover:to-white group-hover:text-[#c48d8d] group-hover:shadow-[0_8px_20px_rgba(212,165,165,0.3)]">
                  <Icon size={24} className="stroke-[1.6] transition-transform duration-500 group-hover:rotate-[6deg]" />
                </div>

                {/* USP Title */}
                <h3 className="text-xs font-bold uppercase tracking-[0.22em] text-[#7A5C5C] mb-3 transition-colors duration-300 group-hover:text-[#5A3E3E]">
                  {usp.title}
                </h3>

                {/* USP Description */}
                <p className="text-[11px] leading-relaxed text-[#7A5C5C]/75 font-medium max-w-[240px] group-hover:text-[#7A5C5C]/90 transition-colors duration-300">
                  {usp.desc}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
        
      </div>
    </section>
  );
}
