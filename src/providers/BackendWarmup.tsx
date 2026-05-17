'use client';

import { useEffect } from 'react';
import { pingBackend } from '@/lib/api';

/**
 * Gọi backend một lần khi SPA hydrate để giảm độ trễ cold start / kiểm tra kết nối.
 */
export function BackendWarmup() {
  useEffect(() => {
    void pingBackend().then((ok) => {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console -- chỉ dev, hữu ích khi debug kết nối API
        console[ok ? 'log' : 'warn'](
          ok ? '[Backend] ping OK' : '[Backend] ping thất bại — kiểm tra NEXT_PUBLIC_API_URL và backend đã chạy chưa'
        );
      }
    });
  }, []);

  return null;
}
