import { getActiveOrigin, getActiveApiUrl, getActiveOriginSync } from './backendDiscovery';

/** Lấy base URL từ cache (sync) — fallback về Render */
export function getBackendOrigin(): string {
  return getActiveOriginSync();
}

/** Lấy base URL động — ping song song, ưu tiên Render */
export async function getBackendOriginAsync(): Promise<string> {
  return getActiveOrigin();
}

/** Lấy API URL động (origin + /api) — async */
export async function getApiBase(): Promise<string> {
  return getActiveApiUrl();
}

/**
 * Trả về URL đầy đủ cho ảnh (đồng bộ — dùng trong JSX). 
 * Nếu ảnh là relative path (bắt đầu bằng / vd /uploads/...),
 * sẽ tự động ghép với Origin của backend (e.g., https://backend-datn-y78s.onrender.com/uploads/...).
 */
export function resolveImageUrl(url?: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }
  const origin = getActiveOriginSync();
  return trimmed.startsWith('/') ? `${origin}${trimmed}` : `${origin}/${trimmed}`;
}

/**
 * Ping backend một lần (GET /ping). Không ném lỗi; trả về true nếu 2xx.
 * Dùng khi frontend khởi động để đánh thức host ngủ (vd. Render).
 */
export async function pingBackend(): Promise<boolean> {
  const origin = await getActiveOrigin();
  try {
    const res = await fetch(`${origin}/ping`, {
      method: 'GET',
      cache: 'no-store',
      credentials: 'omit',
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ──────────────────────────────────────────────
// Fetch-based API wrapper (thay thế axios)
// Tương thích 100% với Turbopack
// ──────────────────────────────────────────────

const TIMEOUT_MS = 5000;
let lastAiRequestTime = 0;
const AI_COOLDOWN_MS = 2500;

// Token refresh state
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

async function refreshAccessToken(): Promise<string> {
  const { useAuthStore } = await import('@/store/useAuthStore');
  const { refreshToken, setAuth, logout, user } = useAuthStore.getState();

  if (!refreshToken) {
    logout();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('No refresh token');
  }

  const origin = getActiveOriginSync();
  const refreshBase = `${origin.replace(/\/+$/, '')}/api`;
  const res = await fetch(`${refreshBase.replace(/\/+$/, '')}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  const json = await res.json();
  if (json.success) {
    const { accessToken, refreshToken: newRefreshToken } = json.data;
    if (user) {
      setAuth(user, accessToken, newRefreshToken);
    }
    return accessToken;
  } else {
    useAuthStore.getState().logout();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('Refresh failed');
  }
}

function getAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T = any>(
  method: string,
  url: string,
  data?: any,
  customConfig?: { skipAuth?: boolean; timeout?: number; baseURL?: string }
): Promise<{ data: T; status: number }> {
  const origin = getActiveOriginSync();
  const base = customConfig?.baseURL ?? `${origin.replace(/\/+$/, '')}/api`;
  const fullUrl = url.startsWith('http') ? url : `${base.replace(/\/+$/, '')}${url.startsWith('/') ? url : `/${url}`}`;
  const timeout = customConfig?.timeout ?? TIMEOUT_MS;

  // ── GLOBAL AI THROTTLING PROTECTION ──
  if (url.includes('/ai/')) {
    const now = Date.now();
    const elapsed = now - lastAiRequestTime;
    if (elapsed < AI_COOLDOWN_MS) {
      const waitTime = AI_COOLDOWN_MS - elapsed;
      console.warn(`⏳ [AI Global Interceptor] Throttling request to ${url} for ${waitTime}ms...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
    lastAiRequestTime = Date.now();
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(customConfig?.skipAuth ? {} : getAuthHeaders()),
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(fullUrl, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    // ── SILENT TOKEN REFRESH ──
    if (res.status === 401 && !customConfig?.skipAuth) {
      if (url.includes('/auth/login') || url.includes('/auth/refresh')) {
        return { data: await res.json() as T, status: res.status };
      }

      if (isRefreshing) {
        const newToken = await new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        });
        headers.Authorization = `Bearer ${newToken}`;
        const retryRes = await fetch(fullUrl, { method, headers, body: data ? JSON.stringify(data) : undefined });
        return { data: await retryRes.json() as T, status: retryRes.status };
      }

      isRefreshing = true;
      try {
        const newToken = await refreshAccessToken();
        processQueue(null, newToken);
        headers.Authorization = `Bearer ${newToken}`;
        const retryRes = await fetch(fullUrl, { method, headers, body: data ? JSON.stringify(data) : undefined });
        return { data: await retryRes.json() as T, status: retryRes.status };
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        throw refreshErr;
      } finally {
        isRefreshing = false;
      }
    }

    const json = await res.json() as T;
    return { data: json, status: res.status };
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error(`Request timeout (${timeout}ms): ${method} ${url}`);
    }
    throw err;
  }
}

// ══════════════════════════════════════════════
// PUBLIC API - Giống hệt axios interface
// ══════════════════════════════════════════════
export const api = {
  get<T = any>(url: string, config?: { skipAuth?: boolean; timeout?: number; params?: Record<string, string | number> }) {
    if (config?.params) {
      const qs = new URLSearchParams();
      Object.entries(config.params).forEach(([k, v]) => qs.set(k, String(v)));
      const sep = url.includes('?') ? '&' : '?';
      url = `${url}${sep}${qs.toString()}`;
    }
    return request<T>('GET', url, undefined, config);
  },
  post<T = any>(url: string, data?: any, config?: { skipAuth?: boolean; timeout?: number }) {
    return request<T>('POST', url, data, config);
  },
  put<T = any>(url: string, data?: any, config?: { skipAuth?: boolean; timeout?: number }) {
    return request<T>('PUT', url, data, config);
  },
  patch<T = any>(url: string, data?: any, config?: { skipAuth?: boolean; timeout?: number }) {
    return request<T>('PATCH', url, data, config);
  },
  delete<T = any>(url: string, config?: { skipAuth?: boolean; timeout?: number }) {
    return request<T>('DELETE', url, undefined, config);
  },
};

export default api;

// ──────────────────────────────────────────────
// CÁC HÀM TIỆN ÍCH KHÁC (giữ nguyên)
// ──────────────────────────────────────────────

export type ImgBBUploadResponseData = {
  url: string;
  displayUrl: string;
  thumbUrl?: string;
  deleteUrl?: string;
  originalBytes: number;
  compressedBytes: number;
};

/** Multipart POST — Upload lên Cloudflare R2 qua backend. */
export async function uploadImageToR2(
  file: File,
  options?: { maxWidth?: number; quality?: number; folder?: string }
): Promise<ImgBBUploadResponseData> {
  const base = (await getActiveApiUrl()).replace(/\/+$/, '');
  const endpoint = `${base}/media/upload-r2`;

  const form = new FormData();
  form.append('image', file);
  if (options?.maxWidth != null) form.append('maxWidth', String(options.maxWidth));
  if (options?.quality != null) form.append('quality', String(options.quality));
  if (options?.folder) form.append('folder', options.folder);

  const headers = new Headers();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(endpoint, { method: 'POST', body: form, headers });
  const json = (await res.json()) as {
    success?: boolean;
    message?: string;
    data?: ImgBBUploadResponseData;
  };

  if (!res.ok || !json.success || !json.data) {
    throw new Error(json.message || `Upload failed (${res.status})`);
  }
  return json.data;
}

/** @deprecated — use uploadImageToR2 instead */
export const uploadImageToImgBB = uploadImageToR2;

export interface BrandData {
  _id: string;
  name: string;
  logo?: string;
  description?: string;
  origin?: string;
  status: 'active' | 'inactive';
  featured: boolean;
}

/**
 * Fetch all brands from the backend.
 * Public endpoint, returns list of brands.
 */
export async function getBrands(): Promise<BrandData[]> {
  try {
    const res = await api.get('/brands');
    if (res.data && (res.data as any).success) {
      return (res.data as any).data;
    }
    return [];
  } catch (error) {
    console.error('Failed to fetch brands from database:', error);
    return [];
  }
}