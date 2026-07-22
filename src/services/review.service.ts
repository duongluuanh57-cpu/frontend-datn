const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface ReviewAspect {
  name: 'quality' | 'longevity' | 'scent' | 'value' | 'packaging' | 'other';
  rating: number;
  comment: string;
}

export const ASPECT_LABELS: Record<string, string> = {
  quality: 'Chất lượng',
  longevity: 'Độ lưu hương',
  scent: 'Mùi hương',
  value: 'Giá trị',
  packaging: 'Bao bì',
  other: 'Khác',
};

export interface ReviewStats {
  avgRating: number;
  total: number;
  distribution: Record<number, number>;
}

export interface ReviewUser {
  _id: string;
  name?: string;
  avatar?: string;
}

export interface ReviewItem {
  _id: string;
  userId: ReviewUser;
  productId: string;
  orderItemId?: string;
  rating: number;
  comment?: string;
  overallComment?: string;
  aspects: ReviewAspect[];
  images?: string[];
  isAnonymous: boolean;
  status: 'visible' | 'hidden';
  createdAt: string;
  updatedAt: string;
}

export interface ReviewListResponse {
  success: boolean;
  reviews: ReviewItem[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ReviewStatsResponse {
  success: boolean;
  data: ReviewStats;
}

export interface ReviewCreateResponse {
  success: boolean;
  message?: string;
  data?: ReviewItem;
}

export async function getProductReviews(productId: string, page = 1, limit = 10): Promise<ReviewListResponse> {
  const res = await fetch(`${API_BASE}/api/reviews/product/${productId}?page=${page}&limit=${limit}`);
  return res.json();
}

export async function getReviewStats(productId: string): Promise<ReviewStatsResponse> {
  const res = await fetch(`${API_BASE}/api/reviews/product/${productId}/stats`);
  return res.json();
}

export async function createReview(
  token: string,
  data: {
    productId: string;
    orderItemId?: string;
    rating?: number;
    overallComment?: string;
    aspects?: { name: string; rating: number; comment?: string }[];
    images?: string[];
    isAnonymous?: boolean;
  }
): Promise<ReviewCreateResponse> {
  const res = await fetch(`${API_BASE}/api/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateReview(
  token: string,
  reviewId: string,
  data: {
    rating?: number;
    overallComment?: string;
    aspects?: { name: string; rating: number; comment?: string }[];
    images?: string[];
    isAnonymous?: boolean;
  }
): Promise<ReviewCreateResponse> {
  const res = await fetch(`${API_BASE}/api/reviews/${reviewId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteReview(token: string, reviewId: string): Promise<{ success: boolean; message?: string }> {
  const res = await fetch(`${API_BASE}/api/reviews/${reviewId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
}

export interface CanReviewResult {
  canReview: boolean;
  purchasedCount: number;
  reviewedCount: number;
}

export async function canReviewProduct(token: string, productId: string): Promise<CanReviewResult> {
  const res = await fetch(`${API_BASE}/api/reviews/can-review/${productId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!json.success) {
    return { canReview: false, purchasedCount: 0, reviewedCount: 0 };
  }
  return json.data;
}

export async function uploadReviewImage(token: string, file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/api/reviews/upload-image`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const json = await res.json();
  if (!json.success) {
    throw new Error(json.message || 'Upload ảnh thất bại');
  }
  return { url: json.data.url };
}
