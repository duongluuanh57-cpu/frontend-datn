'use client';

import { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

export function ScrollToTopButton() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const body = document.body;
      const scrollY = body.scrollTop || document.documentElement.scrollTop || window.scrollY || 0;
      const docH = Math.max(body.scrollHeight, document.documentElement.scrollHeight) - window.innerHeight;
      setProgress(docH > 0 ? Math.min(scrollY / docH, 1) : 0);
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  const goTop = () => {
    const body = document.body;
    const start = body.scrollTop;
    if (start === 0) return;
    const duration = 1000;
    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const t = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      body.scrollTop = start * (1 - ease);
      if (t >= 1) clearInterval(timer);
    }, 16);
  };

  return (
    <button
      onClick={goTop}
      className="fixed bottom-28 right-8 z-[40] flex items-center justify-center w-[46px] h-[46px] rounded-full bg-white  cursor-pointer hover:bg-gray-50 transition-colors"
      aria-label="Lên đầu trang"
    >
      <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 46 46">
        <circle cx="23" cy="23" r="20" fill="none" stroke="#e5e7eb" strokeWidth="2.5" />
        <circle
          cx="23"
          cy="23"
          r="20"
          fill="none"
          stroke="#8B4513"
          strokeWidth="2.5"
          strokeDasharray={`${2 * Math.PI * 20}`}
          strokeDashoffset={`${2 * Math.PI * 20 * (1 - progress)}`}
          strokeLinecap="round"
          className="transition-all duration-100"
        />
      </svg>
      <ChevronUp className="w-5 h-5 text-[#8B4513]" />
    </button>
  );
}
