'use client';

import { useState, useRef, useEffect } from 'react';
import { Star, X, Upload } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { createReview, uploadReviewImage, canReviewProduct, ASPECT_LABELS, type CanReviewResult } from '@/services/review.service';
import { toast } from 'sonner';

const ASPECT_KEYS = Object.keys(ASPECT_LABELS);

interface AspectEntry {
  name: string;
  rating: number;
  comment: string;
}

export function ReviewForm({ productId, onSuccess }: { productId: string; onSuccess: () => void }) {
  const [quickRating, setQuickRating] = useState(0);
  const [quickHover, setQuickHover] = useState(0);
  const [selectedAspects, setSelectedAspects] = useState<Set<string>>(new Set());
  const [aspectEntries, setAspectEntries] = useState<Record<string, AspectEntry>>({});
  const [overallComment, setOverallComment] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [canReview, setCanReview] = useState<CanReviewResult | null>(null);
  const [checking, setChecking] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const accessToken = useAuthStore((s) => s.accessToken);
  const isAuth = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    // Reset form khi chuyển sang sản phẩm khác
    setQuickRating(0);
    setQuickHover(0);
    setSelectedAspects(new Set());
    setAspectEntries({});
    setOverallComment('');
    setImages([]);
    setIsAnonymous(false);

    if (isAuth && accessToken) {
      setChecking(true);
      canReviewProduct(accessToken, productId)
        .then(setCanReview)
        .finally(() => setChecking(false));
    } else {
      setChecking(false);
    }
  }, [isAuth, accessToken, productId]);

  // Không hiển thị gì khi: chưa đăng nhập, đang kiểm tra, hoặc không đủ điều kiện review
  if (!isAuth || !accessToken || checking) return null;
  if (!canReview || !canReview.canReview) return null;

  const remaining = canReview.purchasedCount - canReview.reviewedCount;

  const toggleAspect = (key: string) => {
    setSelectedAspects((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
        setAspectEntries((e) => {
          const rest = { ...e };
          delete rest[key];
          return rest;
        });
      } else {
        next.add(key);
        setAspectEntries((e) => ({
          ...e,
          [key]: { name: key, rating: 0, comment: '' },
        }));
      }
      return next;
    });
  };

  const updateAspect = (key: string, field: 'rating' | 'comment', value: number | string) => {
    setAspectEntries((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadReviewImage(accessToken, file);
      setImages((prev) => [...prev, url]);
    } catch {
      toast.error('Upload ảnh thất bại');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const hasQuickRating = quickRating > 0;
    const hasAspectEntries = Object.keys(aspectEntries).length > 0;
    const allAspectsRated = Object.values(aspectEntries).every((a) => a.rating > 0);

    if (!hasQuickRating && !hasAspectEntries) {
      toast.error('Vui lòng chọn số sao hoặc đánh giá chi tiết');
      return;
    }

    if (hasAspectEntries && !allAspectsRated) {
      toast.error('Vui lòng chọn số sao cho tất cả khía cạnh đã chọn');
      return;
    }

    setSubmitting(true);
    try {
      const aspects = Object.values(aspectEntries).map((a) => ({
        name: a.name,
        rating: a.rating,
        comment: a.comment || undefined,
      }));

      const res = await createReview(accessToken, {
        productId,
        rating: hasQuickRating ? quickRating : undefined,
        aspects: aspects.length > 0 ? aspects : undefined,
        overallComment: overallComment.trim() || undefined,
        images,
        isAnonymous,
      });
      if (res.success) {
        toast.success('Đã gửi đánh giá thành công');
        setQuickRating(0);
        setSelectedAspects(new Set());
        setAspectEntries({});
        setOverallComment('');
        setImages([]);
        setIsAnonymous(false);
        if (canReview) {
          setCanReview({
            ...canReview,
            reviewedCount: canReview.reviewedCount + 1,
            canReview: canReview.purchasedCount > canReview.reviewedCount + 1,
          });
        }
        onSuccess();
      } else {
        toast.error(res.message || 'Không thể gửi đánh giá');
      }
    } catch {
      toast.error('Lỗi kết nối');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-text-primary">Viết đánh giá</h3>
        {remaining > 0 && (
          <span className="text-xs text-text-muted">Còn {remaining} lượt</span>
        )}
      </div>

      {/* Quick rating — 5 large stars */}
      <div className="text-center mb-5">
        <p className="text-sm text-text-muted mb-2">Số sao</p>
        <div className="flex items-center justify-center gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              type="button"
              onMouseEnter={() => setQuickHover(s)}
              onMouseLeave={() => setQuickHover(0)}
              onClick={() => setQuickRating(s === quickRating ? 0 : s)}
              className="p-1 transition-transform hover:scale-110"
            >
              <Star
                size={32}
                className={s <= (quickHover || quickRating) ? 'text-yellow-300 fill-yellow-300' : 'text-gray-200'}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-xs text-text-muted">Đánh giá chi tiết</span>
        </div>
      </div>

      <div className="space-y-5">
        {/* Aspect selection */}
        <div>
          <p className="text-sm text-text-secondary mb-2">Chọn khía cạnh muốn đánh giá:</p>
          <div className="flex flex-wrap gap-2">
            {ASPECT_KEYS.map((key) => {
              const active = selectedAspects.has(key);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleAspect(key)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                    active
                      ? 'bg-primary text-rich-black border-primary'
                      : 'bg-gray-50 text-text-secondary border-gray-200 hover:border-primary/40'
                  }`}
                >
                  {ASPECT_LABELS[key]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Per-aspect rating rows */}
        {selectedAspects.size > 0 && (
          <div className="space-y-3">
            {Array.from(selectedAspects).map((key) => {
              const entry = aspectEntries[key];
              if (!entry) return null;
              return (
                <div key={key} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-text-primary">{ASPECT_LABELS[key]}</span>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => updateAspect(key, 'rating', s)}
                          className="p-0.5 transition-transform hover:scale-110"
                        >
                          <Star
                            size={18}
                            className={s <= entry.rating ? 'text-yellow-300 fill-yellow-300' : 'text-gray-200'}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    value={entry.comment}
                    onChange={(e) => updateAspect(key, 'comment', e.target.value)}
                    placeholder={`Nhận xét về ${ASPECT_LABELS[key].toLowerCase()}...`}
                    className="block w-full text-sm rounded-lg border border-gray-300 bg-white p-2.5 text-text-primary focus:border-primary focus:ring-primary"
                  />
                </div>
              );
            })}
          </div>
        )}

        {/* Overall comment */}
        <textarea
          value={overallComment}
          onChange={(e) => setOverallComment(e.target.value)}
          placeholder="Nhận xét thêm..."
          rows={2}
          className="block w-full text-sm rounded-lg border border-gray-300 bg-white p-3 text-text-primary focus:border-primary focus:ring-primary resize-none"
        />

        {/* Image upload */}
        <div>
          <p className="text-sm text-text-secondary mb-2">Ảnh (tùy chọn):</p>
          <div className="flex gap-2 flex-wrap items-center">
            {images.map((url, idx) => (
              <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 group">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-0.5 right-0.5 bg-black/60 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} className="text-white" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-text-muted hover:text-primary hover:border-primary transition-colors disabled:opacity-50"
            >
              {uploading ? <span className="text-xs">Đang tải...</span> : <Upload size={18} />}
            </button>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUploadImage} className="hidden" />
        </div>

        {/* Anonymous toggle */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <span className="text-sm text-text-secondary">Đánh giá ẩn danh</span>
        </label>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full text-white bg-primary hover:bg-primary-dark focus:ring-4 focus:ring-primary-light font-medium rounded-lg text-sm px-5 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
        </button>
      </div>
    </form>
  );
}