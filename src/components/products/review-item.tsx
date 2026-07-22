'use client';

import { Star, User } from 'lucide-react';
import type { ReviewItem as ReviewItemType } from '@/services/review.service';
import { ASPECT_LABELS } from '@/services/review.service';
import { resolveImageUrl } from '@/lib/api';

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function ReviewItem({ review }: { review: ReviewItemType }) {
  const userName = review.isAnonymous ? 'Ẩn danh' : (review.userId?.name || review.userId?._id?.slice(-6) || 'Ẩn danh');
  const avatarUrl = !review.isAnonymous && review.userId?.avatar ? resolveImageUrl(review.userId.avatar) : null;
  const aspects = review.aspects && review.aspects.length > 0 ? review.aspects : null;

  return (
    <div className="border-b border-gray-100 last:border-b-0 py-5">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {avatarUrl ? (
            <img src={avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <User size={18} className="text-gray-400" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900 text-sm">{userName}</span>
            <span className="text-xs text-gray-400">{formatDate(review.createdAt)}</span>
          </div>

          {aspects ? (
            <div className="mt-2 space-y-3">
              {aspects.map((a, i) => (
                <div key={i}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-primary bg-primary/5 px-2 py-0.5 rounded">
                      {ASPECT_LABELS[a.name] || a.name}
                    </span>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={12}
                          className={s <= a.rating ? 'text-yellow-300 fill-yellow-300' : 'text-gray-200'}
                        />
                      ))}
                    </div>
                  </div>
                  {a.comment && <p className="text-sm text-gray-700 mt-1 leading-relaxed">{a.comment}</p>}
                </div>
              ))}
              {review.overallComment && (
                <p className="text-sm text-gray-600 italic border-t border-gray-100 pt-2 mt-2">{review.overallComment}</p>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center gap-0.5 mt-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={14}
                    className={s <= review.rating ? 'text-yellow-300 fill-yellow-300' : 'text-gray-200'}
                  />
                ))}
              </div>
              {review.comment && <p className="text-sm text-gray-700 mt-2 leading-relaxed">{review.comment}</p>}
            </>
          )}

          {review.images && review.images.length > 0 && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {review.images.map((img, i) => (
                <img key={i} src={resolveImageUrl(img)} alt="" className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
