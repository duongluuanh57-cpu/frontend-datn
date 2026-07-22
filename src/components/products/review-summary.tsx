'use client';

import { Star } from 'lucide-react';
import type { ReviewStats } from '@/services/review.service';

const DISTRIBUTION_LABELS: Record<number, string> = { 5: 'Tuyệt vời', 4: 'Tốt', 3: 'Trung bình', 2: 'Tệ', 1: 'Rất tệ' };

export function ReviewSummary({ stats }: { stats: ReviewStats | null }) {
  if (!stats || stats.total === 0) {
    return null;
  }

  const maxDist = Math.max(...Object.values(stats.distribution), 1);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center gap-6 mb-6">
        <div className="text-center">
          <span className="text-5xl font-bold text-text-primary">{stats.avgRating.toFixed(1)}</span>
          <div className="flex items-center justify-center gap-0.5 mt-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={16}
                className={s <= Math.round(stats.avgRating) ? 'text-yellow-300 fill-yellow-300' : 'text-gray-200 fill-gray-200'}
              />
            ))}
          </div>
          <p className="text-sm text-text-muted mt-1">{stats.total} đánh giá</p>
        </div>
      </div>

      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = stats.distribution[star] || 0;
          const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
          return (
            <div key={star} className="flex items-center gap-2">
              <span className="text-sm text-text-secondary w-16 text-right">{DISTRIBUTION_LABELS[star]}</span>
              <div className="flex-1 h-2.5 bg-gray-200 rounded-full">
                <div className="h-2.5 bg-yellow-300 rounded-full" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-sm text-text-muted w-8">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
