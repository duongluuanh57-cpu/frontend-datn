const RENDER_URL = 'https://backend-datn-y78s.onrender.com';
const LOCAL_URL = 'http://127.0.0.1:4000';
const BACKENDS = [RENDER_URL, LOCAL_URL];

function getEnvUrl(): string | null {
  if (typeof process === 'undefined') return null;
  return (process.env as Record<string, string | undefined>).NEXT_PUBLIC_API_URL ?? null;
}

const STORAGE_KEY = 'backend_active_url';
const DISCOVERY_INTERVAL = 30_000;
let lastDiscovery = 0;
let cachedUrl: string | null = null;
let pendingDiscovery: Promise<string | null> | null = null;

async function pingAll(): Promise<string | null> {
  const results = await Promise.allSettled(
    BACKENDS.map(async (origin) => {
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

export function getActiveOriginSync(): string {
  const envUrl = getEnvUrl();
  if (envUrl) return envUrl;
  if (cachedUrl) return cachedUrl;
  const stored = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
  if (stored) {
    cachedUrl = stored;
    return stored;
  }
  return RENDER_URL;
}

export async function getActiveOrigin(): Promise<string> {
  const envUrl = getEnvUrl();
  if (envUrl) return envUrl;

  const now = Date.now();

  if (cachedUrl && now - lastDiscovery < DISCOVERY_INTERVAL) {
    return cachedUrl;
  }

  if (pendingDiscovery) {
    const result = await pendingDiscovery;
    if (result) return result;
  }

  const stored = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
  if (stored && now - lastDiscovery < DISCOVERY_INTERVAL) {
    cachedUrl = stored;
    return stored;
  }

  pendingDiscovery = pingAll();
  const alive = await pendingDiscovery;
  pendingDiscovery = null;

  cachedUrl = alive || RENDER_URL;
  lastDiscovery = now;

  if (alive && typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, alive);
  }

  return cachedUrl;
}

export async function getActiveApiUrl(): Promise<string> {
  const origin = await getActiveOrigin();
  return `${origin.replace(/\/+$/, '')}/api`;
}

export function resetDiscovery(): void {
  cachedUrl = null;
  lastDiscovery = 0;
  pendingDiscovery = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}

if (typeof window !== 'undefined' && !getEnvUrl()) {
  getActiveOrigin().catch(() => {});
}