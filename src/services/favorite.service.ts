<<<<<<< HEAD
import { getActiveOriginSync } from '@/lib/backendDiscovery';

function getApiBase(): string {
  const envUrl = typeof process !== 'undefined' ? (process.env as Record<string, string | undefined>).NEXT_PUBLIC_API_URL : null;
  return envUrl || getActiveOriginSync();
}
=======
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
>>>>>>> cddd00e0c81a4a7a2d991419b29d3f708439261f

export interface FavoriteResponse {
  success: boolean;
  message?: string;
  data?: any;
}

<<<<<<< HEAD
let favoriteIdsCache: { ids: string[]; timestamp: number } | null = null;
const FAVORITE_IDS_CACHE_TTL = 30_000;

export async function addToFavorites(productId: string, token: string): Promise<FavoriteResponse> {
  const res = await fetch(`${getApiBase()}/api/favorites`, {
=======
// Cache getFavoriteIds để tránh refetch mỗi lần navigate
let favoriteIdsCache: { ids: string[]; timestamp: number } | null = null;
const FAVORITE_IDS_CACHE_TTL = 30_000; // 30 giây

export async function addToFavorites(productId: string, token: string): Promise<FavoriteResponse> {
  const res = await fetch(`${API_BASE}/api/favorites`, {
>>>>>>> cddd00e0c81a4a7a2d991419b29d3f708439261f
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
<<<<<<< HEAD
  const res = await fetch(`${getApiBase()}/api/favorites/${productId}`, {
=======
  const res = await fetch(`${API_BASE}/api/favorites/${productId}`, {
>>>>>>> cddd00e0c81a4a7a2d991419b29d3f708439261f
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
<<<<<<< HEAD
  const res = await fetch(`${getApiBase()}/api/favorites`, {
=======
  const res = await fetch(`${API_BASE}/api/favorites`, {
>>>>>>> cddd00e0c81a4a7a2d991419b29d3f708439261f
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
<<<<<<< HEAD
=======
  // Dùng cache nếu còn hạn để tránh gọi API mỗi lần navigate
>>>>>>> cddd00e0c81a4a7a2d991419b29d3f708439261f
  if (favoriteIdsCache && Date.now() - favoriteIdsCache.timestamp < FAVORITE_IDS_CACHE_TTL) {
    return { success: true, data: { ids: favoriteIdsCache.ids } };
  }

<<<<<<< HEAD
  const res = await fetch(`${getApiBase()}/api/favorites/ids`, {
=======
  const res = await fetch(`${API_BASE}/api/favorites/ids`, {
>>>>>>> cddd00e0c81a4a7a2d991419b29d3f708439261f
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
<<<<<<< HEAD
=======
  // Update cache
>>>>>>> cddd00e0c81a4a7a2d991419b29d3f708439261f
  if (result.success && result.data) {
    favoriteIdsCache = { ids: result.data.ids || [], timestamp: Date.now() };
  }
  return result;
}

<<<<<<< HEAD
=======
/** Invalidate favorites cache (gọi sau khi add/remove favorite) */
>>>>>>> cddd00e0c81a4a7a2d991419b29d3f708439261f
export function invalidateFavoriteIdsCache(): void {
  favoriteIdsCache = null;
}

export async function checkFavorite(productId: string, token: string): Promise<FavoriteResponse> {
<<<<<<< HEAD
  const res = await fetch(`${getApiBase()}/api/favorites/check/${productId}`, {
=======
  const res = await fetch(`${API_BASE}/api/favorites/check/${productId}`, {
>>>>>>> cddd00e0c81a4a7a2d991419b29d3f708439261f
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
<<<<<<< HEAD
}
=======
}
>>>>>>> cddd00e0c81a4a7a2d991419b29d3f708439261f
