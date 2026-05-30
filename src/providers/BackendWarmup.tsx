'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { usePathname } from '@/navigation';
import { pingBackend } from '@/lib/api';
import { getActiveOriginSync } from '@/lib/backendDiscovery';
import './backend-warmup.css';

export function BackendWarmup() {
  const params = useParams();
  const rawPathname = usePathname();
  const locale = (params?.locale as string) || 'vi';

  const [mounted, setMounted] = useState(false);

  // Bỏ qua preloader hoàn toàn — không block UI
  useEffect(() => {
    setMounted(true);
    document.body.style.opacity = '1';

    // Ping backend ngầm, không block gì cả
    const isHomepage = rawPathname === '/';
    const hasShown = sessionStorage.getItem('preloader_shown');
    const backendUrl = getActiveOriginSync();

    if (backendUrl.includes('127.0.0.1') || backendUrl.includes('localhost')) {
      if (isHomepage && !hasShown) {
        pingBackend();
      }
    } else if (isHomepage && !hasShown) {
      sessionStorage.setItem('preloader_shown', 'true');
    }
  }, [rawPathname]);

  if (!mounted) return null;
  return null;
}