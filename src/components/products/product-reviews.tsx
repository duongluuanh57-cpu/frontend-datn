'use client';

import { useEffect, useState, useCallback } from 'react';
import { getProductReviews, getReviewStats, type ReviewStats, type ReviewItem as ReviewItemType } from '@/services/review.service';
import { ReviewItem } from './review-item';
import { ReviewForm } from './review-form';

export function ProductReviews({ productId }: { productId: string }) {
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [reviews, setReviews] = useState<ReviewItemType[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const [statsRes, listRes] = await Promise.all([
        getReviewStats(productId),
        getProductReviews(productId, p, 5),
      ]);
      if (statsRes.success) setStats(statsRes.data);
      if (listRes.success) {
        setReviews(listRes.reviews);
        setTotalPages(listRes.totalPages);
        setPage(p);
      }
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => { load(1); }, [load]);

  return (
    <section className="mt-10">
      <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-4">
        Đánh giá sản phẩm {stats && stats.total > 0 && `(${stats.total})`}
      </h2>

      <ReviewForm productId={productId} onSuccess={() => load(1)} />

      <div className="mt-6 bg-white border border-border/60 rounded-xl p-6">
        {loading ? (
          <div className="text-sm text-center py-6 text-text-muted">Đang tải...</div>
        ) : reviews.length === 0 ? (
          <p className="text-sm text-center text-text-muted py-6">Chưa có đánh giá nào.</p>
        ) : (
          <>
            {reviews.map((r) => (
              <ReviewItem key={r._id} review={r} />
            ))}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  disabled={page <= 1}
                  onClick={() => load(page - 1)}
                  className="px-3 py-1.5 text-sm font-semibold rounded-lg border border-gray-300 bg-white hover:bg-foreground/5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => load(p)}
                    className={`px-3 py-1.5 text-sm font-semibold rounded-lg border ${
                      p === page
                        ? 'bg-primary text-rich-black border-primary'
                        : 'border-gray-300 bg-white hover:bg-foreground/5'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  disabled={page >= totalPages}
                  onClick={() => load(page + 1)}
                  className="px-3 py-1.5 text-sm font-semibold rounded-lg border border-gray-300 bg-white hover:bg-foreground/5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
