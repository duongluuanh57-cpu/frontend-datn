'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const SLIDES = [
  {
    videoSrc: '/video/Burberry Her Parfum promotional campaign featuring singer-songwriter Olivia Dean.webm',
    badge: 'DEAL HOT',
    title: 'Giảm đến 50%\nnước hoa chính hãng',
    desc: 'Freeship toàn quốc - Đổi trả 7 ngày',
    cta: 'Mua ngay',
  },
  {
    videoSrc: '/video/Gucci Guilty Absolute Campaign.webm',
    badge: 'BEST SELLER',
    title: 'Bộ sưu tập\nhương thơm quý tộc',
    desc: 'Các dòng nước hoa niche được ưa chuộng nhất',
    cta: 'Khám phá',
  },
  {
    videoSrc: '/video/NARCISO RODRIGUEZ SANTAL MUSC.webm',
    badge: 'MỚI VỀ',
    title: 'Phiên bản giới hạn\nmùa hè 2025',
    desc: 'Sưu tầm ngay trước khi hết hàng',
    cta: 'Xem thêm',
  },
  {
    videoSrc: '/video/YSL Libre Berry Crush.webm',
    badge: 'BỘ SƯU TẬP',
    title: 'Hương thơm\nđẳng cấp thượng lưu',
    desc: 'Dành cho những ai tinh tế và sành điệu',
    cta: 'Khám phá ngay',
  },
];

function SteamVideo({ videoSrc, active }: { videoSrc: string; active: boolean }) {
  // Chỉ render video khi slide active — inactive slides không render gì cả
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none transition-opacity duration-700 ${active ? 'opacity-100' : 'opacity-0'}`}>
      {active && (
        <video
          src={videoSrc}
          className="absolute pointer-events-none object-cover"
          style={{
            top: -80,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '177.78%',
            height: 'calc(100% + 80px)',
          }}
          autoPlay
          muted
          loop
          playsInline
          tabIndex={-1}
        />
      )}
    </div>
  );
}

export function HeroBanner() {
  const [current, setCurrent] = useState(0);
  const reduce = useReducedMotion();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const next = useCallback(() => setCurrent((c) => (c + 1) % SLIDES.length), []);

  // Auto-slide — tôn trọng reduced motion
  useEffect(() => {
    if (reduce) return; // Dừng auto-slide nếu user không thích motion
    intervalRef.current = setInterval(next, 10000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [next, reduce]);

  const slide = SLIDES[current];

  return (
    <section className="relative bg-rich-black overflow-hidden" style={{ marginTop: 0 }}>
      <div className="relative min-h-[100dvh] max-h-[800px]">
        {/* Steam video backgrounds */}
        {SLIDES.map((s, i) => (
          <SteamVideo key={s.videoSrc} videoSrc={s.videoSrc} active={i === current} />
        ))}

        {/* Block interaction with video */}
        <div className="absolute inset-0 z-[1]" />

        {/* Dark overlay — gradient để text dễ đọc */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent z-[2]" />

        {/* Split Screen: Left = Text, Right = Video */}
        <div className="relative z-[3] min-h-[100dvh] flex items-center">
          <div className="section-container w-full">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Left Column — Text Content */}
              <motion.div
                key={current}
                initial={reduce ? false : { opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-xl"
              >
                <span className="eyebrow inline-block !text-white/80 !text-[10px]">
                  {slide.badge}
                </span>
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4 tracking-tighter whitespace-pre-line">
                  {slide.title}
                </h2>
                <p className="text-base md:text-lg text-white/70 mb-8 max-w-md leading-relaxed">
                  {slide.desc}
                </p>
                <div className="flex gap-3">
                  <button className="px-7 py-3.5 bg-primary hover:bg-primary-dark text-rich-black text-sm font-semibold rounded-lg transition-all duration-300 hover:translate-y-[-1px] cursor-pointer shadow-lg shadow-primary/20">
                    {slide.cta}
                  </button>
                  <button className="btn-ghost !text-white/80 !border-white/20 hover:!border-white/50 hover:!text-white">
                    Xem thêm
                  </button>
                </div>
              </motion.div>

              {/* Right Column — trống, video làm nền bên phải */}
              <div className="hidden md:block" />
            </div>
          </div>
        </div>

        {/* Dots navigation */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
                i === current ? 'bg-primary w-8' : 'bg-white/30 hover:bg-white/50 w-3'
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}