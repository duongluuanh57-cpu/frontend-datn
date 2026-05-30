const RENDER_URL = 'https://backend-datn-y78s.onrender.com';
const LOCAL_URL = 'http://127.0.0.1:4000';
const BACKENDS = [LOCAL_URL, RENDER_URL];

const STORAGE_KEY = 'backend_active_url';
const DISCOVERY_INTERVAL = 30_000; // re-check sau 30s
let lastDiscovery = 0;
let cachedUrl: string | null = null;
let pendingDiscovery: Promise<string | null> | null = null;

/** Kiểm tra nếu đang ở môi trường dev (localhost) */
function isDev(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
}

/**
 * Ping /ping trên tất cả backend song song.
 * Trả về URL của backend alive đầu tiên (theo thứ tự ưu tiên trong mảng).
 * Local được ping trước → ưu tiên local khi dev.
 * Nếu đang dev local, chỉ ping local, không ping Render để tránh wake-up delay.
 */
async function pingAll(): Promise<string | null> {
  const backendsToPing = isDev() ? [LOCAL_URL] : BACKENDS;

  const results = await Promise.allSettled(
    backendsToPing.map(async (origin) => {
      const url = `${origin.replace(/\/+$/, '')}/ping`;
      const res = await fetch(url, { method: 'GET', cache: 'no-store', signal: AbortSignal.timeout(3000) });
      if (res.ok) return origin;
      throw new Error(`Ping failed: ${origin}`);
    })
  );

  for (const result of results) {
    if (result.status === 'fulfilled' && result.value) {
      return result.value;
    }
  }
  return null;
}

/**
 * Lấy backend URL từ cache (sync) — dùng cho resolveImageUrl và các chỗ đồng bộ.
 * Trả về cached URL hoặc fallback Render nếu chưa có cache.
 * Khi dev, ưu tiên local luôn để tránh gọi đến Render.
 */
export function getActiveOriginSync(): string {
  if (cachedUrl) return cachedUrl;
  if (isDev()) {
    cachedUrl = LOCAL_URL;
    return LOCAL_URL;
  }
  const stored = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
  if (stored) {
    cachedUrl = stored;
    return stored;
  }
  return RENDER_URL; // fallback cho production
}

/**
 * Lấy backend URL đang alive — ping tất cả backend song song.
 * Cache trong localStorage + memory, re-check mỗi 30s.
 * Fallback về Render nếu không ping được backend nào.
 * SHARE discovery promise để nhiều request đồng thời chỉ gọi 1 lần duy nhất.
 */
export async function getActiveOrigin(): Promise<string> {
  const now = Date.now();

  // Nếu cache còn hạn, dùng cache
  if (cachedUrl && now - lastDiscovery < DISCOVERY_INTERVAL) {
    return cachedUrl;
  }

  // Nếu đang có discovery đang chạy, chờ kết quả đó
  if (pendingDiscovery) {
    const result = await pendingDiscovery;
    if (result) return result;
  }

  // Nếu đang dev, ưu tiên local luôn không cần ping
  if (isDev()) {
    cachedUrl = LOCAL_URL;
    lastDiscovery = now;
    return cachedUrl;
  }

  // Thử lấy từ localStorage trước
  const stored = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
  if (stored && now - lastDiscovery < DISCOVERY_INTERVAL) {
    cachedUrl = stored;
    return stored;
  }

  // Ping tất cả — share promise để tránh nhiều request đồng thời
  pendingDiscovery = pingAll();
  const alive = await pendingDiscovery;
  pendingDiscovery = null;
  const fallback = RENDER_URL; // Render fallback cho production

  cachedUrl = alive || fallback;
  lastDiscovery = now;

  if (alive && typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, alive);
  }

  return cachedUrl;
}

/** Lấy origin + /api suffix */
export async function getActiveApiUrl(): Promise<string> {
  const origin = await getActiveOrigin();
  return `${origin.replace(/\/+$/, '')}/api`;
}

/** Reset cache — buộc re-discovery lần gọi sau */
export function resetDiscovery(): void {
  cachedUrl = null;
  lastDiscovery = 0;
  pendingDiscovery = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}

/** Khởi chạy discovery ngay khi module load (chỉ client-side) */
if (typeof window !== 'undefined') {
  // Đánh thức backend — local nếu dev, Render nếu production
  if (isDev()) {
    cachedUrl = LOCAL_URL;
    lastDiscovery = Date.now();
  } else {
    getActiveOrigin().catch(() => {});
  }
}
