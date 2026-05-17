'use client';

import { useEffect } from 'react';
import api from '@/lib/api';

/**
 * Component ẩn để ghi nhận lượt truy cập của người dùng (Visits Tracking)
 */
export function VisitTracker() {
  useEffect(() => {
    const track = async () => {
      try {
        // Gửi request lên backend để tăng counter trong Redis
        await api.post('/stats/track-visit');
      } catch (error) {
        // Bỏ qua lỗi nếu không track được (không làm gián đoạn trải nghiệm)
      }
    };

    // Chỉ thực thi ở client-side
    track();
  }, []);

  return null;
}
