const RENDER_URL = 'https://backend-datn-y78s.onrender.com';
<<<<<<< HEAD
const LOCAL_URL = 'http://127.0.0.1:4000';
const BACKENDS = [RENDER_URL, LOCAL_URL];

function getEnvUrl(): string | null {
  if (typeof process === 'undefined') return null;
  return (process.env as Record<string, string | undefined>).NEXT_PUBLIC_API_URL ?? null;
}

const STORAGE_KEY = 'backend_active_url';
const DISCOVERY_INTERVAL = 30_000;
=======
const DEV_PORT = '4000';
const BACKENDS = [RENDER_URL];

function getLocalUrl(): string {
  const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  return `http://${hostname}:${DEV_PORT}`;
}

const STORAGE_KEY = 'backend_active_url';
const DISCOVERY_INTERVAL = 30_000; // re-check sau 30s
>>>>>>> cddd00e0c81a4a7a2d991419b29d3f708439261f
let lastDiscovery = 0;
let cachedUrl: string | null = null;
let pendingDiscovery: Promise<string | null> | null = null;

<<<<<<< HEAD
async function pingAll(): Promise<string | null> {
  const results = await Promise.allSettled(
    BACKENDS.map(async (origin) => {
=======
/** Kiểm tra nếu đang ở môi trường dev (localhost hoặc LAN) */
function isDev(): boolean {
  if (typeof window !== 'undefined') {
    const h = window.location.hostname;
    return h === 'localhost' || h === '127.0.0.1' || /^192\.168\./.test(h) || /^10\./.test(h) || /^172\.(1[6-9]|2\d|3[01])\./.test(h);
  }
  return process.env.NODE_ENV === 'development';
}

/**
 * Ping /ping trên tất cả backend song song.
 * Trả về URL của backend alive đầu tiên (theo thứ tự ưu tiên trong mảng).
 * Local được ping trước → ưu tiên local khi dev.
 * Nếu đang dev local, chỉ ping local, không ping Render để tránh wake-up delay.
 */
async function pingAll(): Promise<string | null> {
  const backendsToPing = isDev() ? [getLocalUrl()] : BACKENDS;

  const results = await Promise.allSettled(
    backendsToPing.map(async (origin) => {
>>>>>>> cddd00e0c81a4a7a2d991419b29d3f708439261f
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

<<<<<<< HEAD
export function getActiveOriginSync(): string {
  const envUrl = getEnvUrl();
  if (envUrl) return envUrl;
  if (cachedUrl) return cachedUrl;
=======
/**
 * Lấy backend URL từ cache (sync) — dùng cho resolveImageUrl và các chỗ đồng bộ.
 * Trả về cached URL hoặc fallback Render nếu chưa có cache.
 * Khi dev, ưu tiên local luôn để tránh gọi đến Render.
 */
export function getActiveOriginSync(): string {
  if (cachedUrl) return cachedUrl;
  if (isDev()) {
    cachedUrl = getLocalUrl();
    return cachedUrl;
  }
>>>>>>> cddd00e0c81a4a7a2d991419b29d3f708439261f
  const stored = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
  if (stored) {
    cachedUrl = stored;
    return stored;
  }
<<<<<<< HEAD
  return RENDER_URL;
}

export async function getActiveOrigin(): Promise<string> {
  const envUrl = getEnvUrl();
  if (envUrl) return envUrl;

  const now = Date.now();

=======
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
>>>>>>> cddd00e0c81a4a7a2d991419b29d3f708439261f
  if (cachedUrl && now - lastDiscovery < DISCOVERY_INTERVAL) {
    return cachedUrl;
  }

<<<<<<< HEAD
=======
  // Nếu đang có discovery đang chạy, chờ kết quả đó
>>>>>>> cddd00e0c81a4a7a2d991419b29d3f708439261f
  if (pendingDiscovery) {
    const result = await pendingDiscovery;
    if (result) return result;
  }

<<<<<<< HEAD
=======
  // Nếu đang dev, ưu tiên local luôn không cần ping
  if (isDev()) {
    cachedUrl = getLocalUrl();
    lastDiscovery = now;
    return cachedUrl;
  }

  // Thử lấy từ localStorage trước
>>>>>>> cddd00e0c81a4a7a2d991419b29d3f708439261f
  const stored = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
  if (stored && now - lastDiscovery < DISCOVERY_INTERVAL) {
    cachedUrl = stored;
    return stored;
  }

<<<<<<< HEAD
  pendingDiscovery = pingAll();
  const alive = await pendingDiscovery;
  pendingDiscovery = null;

  cachedUrl = alive || RENDER_URL;
=======
  // Ping tất cả — share promise để tránh nhiều request đồng thời
  pendingDiscovery = pingAll();
  const alive = await pendingDiscovery;
  pendingDiscovery = null;
  const fallback = RENDER_URL; // Render fallback cho production

  cachedUrl = alive || fallback;
>>>>>>> cddd00e0c81a4a7a2d991419b29d3f708439261f
  lastDiscovery = now;

  if (alive && typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, alive);
  }

  return cachedUrl;
}

<<<<<<< HEAD
=======
/** Lấy origin + /api suffix */
>>>>>>> cddd00e0c81a4a7a2d991419b29d3f708439261f
export async function getActiveApiUrl(): Promise<string> {
  const origin = await getActiveOrigin();
  return `${origin.replace(/\/+$/, '')}/api`;
}

<<<<<<< HEAD
=======
/** Reset cache — buộc re-discovery lần gọi sau */
>>>>>>> cddd00e0c81a4a7a2d991419b29d3f708439261f
export function resetDiscovery(): void {
  cachedUrl = null;
  lastDiscovery = 0;
  pendingDiscovery = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}

<<<<<<< HEAD
if (typeof window !== 'undefined' && !getEnvUrl()) {
  getActiveOrigin().catch(() => {});
=======
/** Khởi chạy discovery ngay khi module load (chỉ client-side) */
if (typeof window !== 'undefined') {
  // Đánh thức backend — local nếu dev, Render nếu production
  if (isDev()) {
    cachedUrl = getLocalUrl();
    lastDiscovery = Date.now();
  } else {
    getActiveOrigin().catch(() => {});
  }
>>>>>>> cddd00e0c81a4a7a2d991419b29d3f708439261f
}