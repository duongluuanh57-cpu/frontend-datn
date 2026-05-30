# Data Flow & Architectural Decisions

## Data Flow Patterns

### Pattern 1 — Public Page (Homepage)
```
page.tsx → HomepageDynamicRenderer
  → fetch config → section components
    → hooks → api.get()
```
Server Component render sections theo config động từ backend.

### Pattern 2 — Admin CRUD (Legacy)
```
page.tsx → BrandTable (client)
  → useAdminBrands hook
    → api.get/post/patch/delete
      → local setState
```
State quản lý thủ công bằng `useState` + `useEffect`, không cache layer.

### Pattern 3 — Admin CRUD (TanStack Query)
```
page.tsx → OrderTable (client)
  → useQuery / useMutation
    → api calls
      → cache invalidation
```
TanStack Query tự động caching, refetch, optimistic updates.

### Pattern 4 — Auth
```
login/page.tsx → LoginForm
  → useLogin
    → api.post('/auth/login')
      → useAuthStore.setAuth
        → router.push('/')
```
Auth state lưu trong Zustand persist middleware → localStorage.

### Pattern 5 — AI Chat
```
chat-widget.tsx → useChatWidget
  → fetch('/api/chat')
    → Edge proxy (Next.js Edge Runtime)
      → backend /api/ai/chat
        → stream response
          → useChatStore
```
Chat stream qua Edge Runtime, state lưu trong Zustand persist.

## Key Architectural Decisions

- **Không có services/**: hooks gọi trực tiếp `api.ts` — giảm layers, đơn giản hóa data flow.
- **Fetch-based API wrapper**: `lib/api.ts` dùng `fetch` thay axios — tương thích Turbopack, support dynamic backend discovery.
- **TanStack Query**: Chỉ áp dụng cho một số module (orders, products), module cũ dùng local state.
- **Dynamic backend discovery**: `backendDiscovery.ts` ping localhost và Render, cache kết quả 30s.
- **Zustand persist middleware**: Auth + chat state persist qua localStorage.
- **Edge API proxy cho AI**: `/api/chat` chạy Edge Runtime — giảm latency, không chiếm Node.js resources.
- **Server Components mặc định**: `'use client'` chỉ khi cần interactive state, effects, hoặc browser APIs.
