import axios from 'axios';

const apiBase =
  process.env.NEXT_PUBLIC_API_URL?.trim() || 'http://localhost:4000/api';

/** Origin backend (bỏ hậu tố /api) — dùng cho /ping, health, v.v. */
export function getBackendOrigin(): string {
  const base = apiBase.replace(/\/+$/, '');
  return base.endsWith('/api') ? base.slice(0, -4) : base;
}

/**
 * Trả về URL đầy đủ cho ảnh. Nếu ảnh là relative path (bắt đầu bằng / vd /uploads/...),
 * sẽ tự động ghép với Origin của backend (e.g., http://localhost:4000/uploads/...).
 */
export function resolveImageUrl(url?: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }
  const origin = getBackendOrigin();
  return trimmed.startsWith('/') ? `${origin}${trimmed}` : `${origin}/${trimmed}`;
}

/**
 * Ping backend một lần (GET /ping). Không ném lỗi; trả về true nếu 2xx.
 * Dùng khi frontend khởi động để đánh thức host ngủ (vd. Render).
 */
export async function pingBackend(): Promise<boolean> {
  const origin = getBackendOrigin();
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

const api = axios.create({
  baseURL: apiBase.endsWith('/') ? apiBase.slice(0, -1) : apiBase,
  headers: {
    'Content-Type': 'application/json',
  },
});

let lastAiRequestTime = 0;
const AI_COOLDOWN_MS = 2500; // Enforce minimum 2.5 seconds space between any backend AI calls

api.interceptors.request.use(async (config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // ── GLOBAL AI THROTTLING PROTECTION ──
  // Checks if the request is routed to an AI endpoint, enforcing a strict sequential spacing
  // to avoid backend Gemini/OpenAI rate limit overloading or token exhaustion.
  if (config.url && config.url.includes('/ai/')) {
    const now = Date.now();
    const elapsed = now - lastAiRequestTime;

    if (elapsed < AI_COOLDOWN_MS) {
      const waitTime = AI_COOLDOWN_MS - elapsed;
      console.warn(`⏳ [AI Global Interceptor] Throttling request to ${config.url} for ${waitTime}ms to prevent rate limiting...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
    // Update timestamp right before the call proceeds
    lastAiRequestTime = Date.now();
  }

  return config;
});

// Silent Token Refresh handling to prevent random 401 logouts
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 Unauthorized and not retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (
        originalRequest.url?.includes('/auth/login') ||
        originalRequest.url?.includes('/auth/refresh')
      ) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Dynamically import to avoid any instantiation ordering issues
        const { useAuthStore } = await import('@/store/useAuthStore');
        const { refreshToken, setAuth, logout, user } = useAuthStore.getState();

        if (!refreshToken) {
          logout();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          return Promise.reject(error);
        }

        // Call server to refresh the tokens
        const res = await axios.post(`${apiBase.replace(/\/+$/, '')}/auth/refresh`, {
          refreshToken,
        });

        if (res.data && res.data.success) {
          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = res.data.data;
          
          // Update the global Zustand auth store
          if (user) {
            setAuth(user, newAccessToken, newRefreshToken);
          }
          
          processQueue(null, newAccessToken);
          
          // Retry original request with the new access token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } else {
          useAuthStore.getState().logout();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          processQueue(new Error('Refresh failed'), null);
          return Promise.reject(error);
        }
      } catch (refreshErr) {
        // Dynamically get the state and logout
        const { useAuthStore } = await import('@/store/useAuthStore');
        useAuthStore.getState().logout();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        processQueue(refreshErr, null);
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export type ImgBBUploadResponseData = {
  url: string;
  displayUrl: string;
  thumbUrl?: string;
  deleteUrl?: string;
  originalBytes: number;
  compressedBytes: number;
};

/** Multipart POST — không dùng axios JSON default để tránh sai Content-Type. */
export async function uploadImageToImgBB(
  file: File,
  options?: { maxWidth?: number; quality?: number }
): Promise<ImgBBUploadResponseData> {
  const base = apiBase.replace(/\/+$/, '');
  const endpoint = `${base}/media/upload-imgbb`;

  const form = new FormData();
  form.append('image', file);
  if (options?.maxWidth != null) form.append('maxWidth', String(options.maxWidth));
  if (options?.quality != null) form.append('quality', String(options.quality));

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
    if (res.data && res.data.success) {
      return res.data.data;
    }
    return [];
  } catch (error) {
    console.error('Failed to fetch brands from database:', error);
    return [];
  }
}

export default api;
