'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export function ScrollToTop() {
  const pathname = usePathname();
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      // Tắt scroll restoration của browser ngay khi mount
      if (typeof window !== 'undefined' && 'scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
      }
      initialized.current = true;
    }

    // Scroll lên đầu ngay lập tức — scroll cả html và body để dự phòng
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // Dự phòng: retry sau microtask queue (đè Next.js scroll restoration)
    const t = setTimeout(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 0);
    return () => clearTimeout(t);
  }, [pathname]);

  return null;
}
