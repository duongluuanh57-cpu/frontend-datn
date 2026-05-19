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

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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
