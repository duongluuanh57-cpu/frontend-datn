'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    const t = setTimeout(() => window.scrollTo(0, 0), 100);
    return () => clearTimeout(t);
  }, [pathname]);

  return null;
}
