# API Patterns

## Token Refresh Queue

Silent token refresh on 401. During refresh, concurrent requests queue and retry automatically.

### Flow

```
Request → 401 response
├─ If already refreshing → queue request promise
│  └─ Wait for new token → retry
└─ Else → start refresh
   ├─ POST /auth/refresh
   │  ├─ Success → update authStore.token → resolve all queued
   │  └─ Fail → clear store → redirect /login
   └─ Retry queued requests with fresh token
```

### Implementation sketch

```ts
let refreshPromise: Promise<string> | null = null;
const refreshQueue: ((token: string) => void)[] = [];

async function refreshToken(): Promise<string> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = fetch('/auth/refresh', { method: 'POST' }).then(r => r.json()).then(d => d.token);
  try {
    const token = await refreshPromise;
    refreshQueue.forEach(resolve => resolve(token));
    return token;
  } catch {
    refreshQueue.length = 0;
    useAuthStore.getState().logout();
    window.location.href = '/login';
    throw new Error('Session expired');
  } finally {
    refreshPromise = null;
  }
}
```

On any fetch that returns 401, call `refreshToken()`, update the `Authorization` header, and retry the original request.

---

## AI Throttling

A **2.5s global cooldown** between consecutive AI requests to prevent abuse.

- Implemented in the fetch wrapper (`lib/api.ts`).
- Check: `if (path.includes('/ai/'))` → enforce cooldown.

```ts
let lastAiCall = 0;
const AI_COOLDOWN = 2500;

async function throttledFetch(path: string, init?: RequestInit) {
  if (path.includes('/ai/')) {
    const elapsed = Date.now() - lastAiCall;
    if (elapsed < AI_COOLDOWN)
      await new Promise(r => setTimeout(r, AI_COOLDOWN - elapsed));
    lastAiCall = Date.now();
  }
  return fetch(path, init);
}
```

---

## Edge API Route

File: `app/api/chat/route.ts`

```ts
export const runtime = 'edge';

export async function POST(req: Request) {
  const body = await req.json();
  const backendRes = await fetch(process.env.BACKEND_URL + '/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  return new Response(backendRes.body, {
    status: backendRes.status,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

- **No CORS needed** — same origin, hit via `/api/chat`.
- Proxies the streaming response directly to the client.
