const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface FavoriteResponse {
  success: boolean;
  message?: string;
  data?: any;
}

// Cache getFavoriteIds để tránh refetch mỗi lần navigate
let favoriteIdsCache: { ids: string[]; timestamp: number } | null = null;
const FAVORITE_IDS_CACHE_TTL = 30_000; // 30 giây

export async function addToFavorites(productId: string, token: string): Promise<FavoriteResponse> {
  const res = await fetch(`${API_BASE}/api/favorites`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ productId }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Không thể thêm vào yêu thích');
  }

  return res.json();
}

export async function removeFromFavorites(productId: string, token: string): Promise<FavoriteResponse> {
  const res = await fetch(`${API_BASE}/api/favorites/${productId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Không thể xóa khỏi yêu thích');
  }

  return res.json();
}

export async function getFavorites(token: string): Promise<FavoriteResponse> {
  const res = await fetch(`${API_BASE}/api/favorites`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Không thể lấy danh sách yêu thích');
  }

  return res.json();
}

export async function getFavoriteIds(token: string): Promise<FavoriteResponse> {
  // Dùng cache nếu còn hạn để tránh gọi API mỗi lần navigate
  if (favoriteIdsCache && Date.now() - favoriteIdsCache.timestamp < FAVORITE_IDS_CACHE_TTL) {
    return { success: true, data: { ids: favoriteIdsCache.ids } };
  }

  const res = await fetch(`${API_BASE}/api/favorites/ids`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Không thể lấy danh sách ID yêu thích');
  }

  const result = await res.json();
  // Update cache
  if (result.success && result.data) {
    favoriteIdsCache = { ids: result.data.ids || [], timestamp: Date.now() };
  }
  return result;
}

/** Invalidate favorites cache (gọi sau khi add/remove favorite) */
export function invalidateFavoriteIdsCache(): void {
  favoriteIdsCache = null;
}

export async function checkFavorite(productId: string, token: string): Promise<FavoriteResponse> {
  const res = await fetch(`${API_BASE}/api/favorites/check/${productId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Không thể kiểm tra trạng thái yêu thích');
  }

  return res.json();
}
