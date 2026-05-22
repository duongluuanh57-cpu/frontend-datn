# Coding Standards — L'essence Frontend (Elite SaaS)

## General Principles

1. **Type Safety** — Full TypeScript strict mode, no `any`
2. **Server Components Default** — Chỉ `'use client'` khi cần hooks, events, browser APIs
3. **Component Composition** — Small, focused components
4. **Performance** — Memoization, lazy loading, optimized images
5. **Accessibility** — ARIA labels, keyboard navigation, semantic HTML
6. **Clean Code** — Consistent naming, self-documenting

---

## Architecture Patterns

### Data Flow: Hook → api.ts → Backend

Không có service layer riêng. Logic API tập trung trong hooks, gọi trực tiếp qua `api` từ `lib/api.ts`:

```typescript
// lib/api.ts — Axios instance global
import axios from 'axios';
const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL });
export default api;

// hooks/useAdminBrands.ts — Hook quản lý state + API calls
export function useAdminBrands() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBrands = useCallback(async () => {
    setLoading(true);
    const res = await api.get('/brands');
    setBrands(res.data.data);
    setLoading(false);
  }, []);

  const createBrand = useCallback(async (data: CreateBrandDTO) => {
    const res = await api.post('/brands', data);
    await fetchBrands(); // refresh list
    return res.data.data;
  }, [fetchBrands]);

  useEffect(() => { fetchBrands(); }, [fetchBrands]);

  return { brands, loading, createBrand, updateBrand, deleteBrand };
}
```

### Component Structure

```typescript
'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import type { Product } from '@/types/admin'

interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product) => void
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  // 1. State
  const [isAdding, setIsAdding] = useState(false)

  // 2. Handlers
  const handleAdd = useCallback(async () => {
    setIsAdding(true)
    await onAddToCart(product)
    setIsAdding(false)
  }, [product, onAddToCart])

  // 3. Render
  return (
    <div className="group cursor-pointer">
      <img src={product.image} alt={product.name} className="w-full aspect-square object-cover rounded-2xl" />
      <h3 className="mt-3 text-sm text-content">{product.brand}</h3>
      <p className="text-base font-medium">{product.name}</p>
      <p className="text-lg font-semibold">{product.price.toLocaleString()}₫</p>
      <Button onClick={handleAdd} disabled={isAdding}>
        {isAdding ? 'Đang thêm...' : 'Thêm vào giỏ'}
      </Button>
    </div>
  )
}
```

### Page Pattern

```typescript
// app/[locale]/admin/brands/page.tsx — Server Component
export default function BrandsPage() {
  return (
    <div className="p-6">
      <BrandHeader />
      <BrandFilterBar />
      <BrandTable />    {/* Client Component */}
    </div>
  )
}

// BrandTable.tsx — Client Component
'use client'
export function BrandTable() {
  const { brands, loading, deleteBrand } = useAdminBrands()
  // ...
}
```

---

## Axios Interceptors (lib/api.ts)

### Token Refresh Queue

```typescript
// Silent token refresh — tránh race condition khi nhiều request 401 cùng lúc
let isRefreshing = false
let failedQueue: any[] = []

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      // Queue request trong khi chờ refresh
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      }).then(token => {
        originalRequest.headers.Authorization = `Bearer ${token}`
        return api(originalRequest)
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      const { refreshToken, setAuth, user } = useAuthStore.getState()
      const res = await axios.post(`${apiBase}/auth/refresh`, { refreshToken })
      const { accessToken, refreshToken: newRefresh } = res.data.data
      if (user) setAuth(user, accessToken, newRefresh)

      // Retry tất cả request đang queue
      failedQueue.forEach(p => p.resolve(accessToken))
      failedQueue = []

      originalRequest.headers.Authorization = `Bearer ${accessToken}`
      return api(originalRequest)
    } catch {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    } finally {
      isRefreshing = false
    }
  }
)
```

### AI Throttling Protection

```typescript
// Global 2.5s cooldown giữa các AI request — tránh rate limit backend
api.interceptors.request.use(async (config) => {
  if (config.url?.includes('/ai/')) {
    const now = Date.now()
    const elapsed = now - lastAiRequestTime
    if (elapsed < AI_COOLDOWN_MS) {
      await new Promise(r => setTimeout(r, AI_COOLDOWN_MS - elapsed))
    }
    lastAiRequestTime = Date.now()
  }
  return config
})
```

---

## State Management Patterns

### Zustand Store

```typescript
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
}

interface AuthActions {
  setAuth: (user: User, accessToken: string, refreshToken: string) => void
  logout: () => void
  updateUser: (user: Partial<User>) => void
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      user: null, accessToken: null, refreshToken: null, isAuthenticated: false,
      setAuth: (user, accessToken, refreshToken) => {
        localStorage.setItem('token', accessToken)
        set({ user, accessToken, refreshToken, isAuthenticated: true })
      },
      logout: () => {
        localStorage.removeItem('token')
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false })
      },
      updateUser: (data) => set((s) => ({ user: s.user ? { ...s.user, ...data } : null })),
    }),
    { name: 'auth-storage', storage: createJSONStorage(() => localStorage) }
  )
)
```

### Store Usage — Selective Subscribe

```typescript
// ✅ Subscribe chỉ đến field cần dùng
const user = useAuthStore((s) => s.user)
const logout = useAuthStore((s) => s.logout)

// ❌ Không subscribe toàn bộ store (gây re-render không cần thiết)
const { user, logout, accessToken } = useAuthStore()
```

---

## Form Handling Pattern

```typescript
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
})

export function LoginForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data) => {
    // Gọi hook useLogin
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input {...register('email')} className="w-full border rounded p-3" />
      {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
      </button>
    </form>
  )
}
```

---

## Image Upload Pattern

```typescript
import { uploadImageToR2 } from '@/lib/api'

// Upload ảnh → Sharp optimize → Cloudflare R2 → trả về URL
async function handleUpload(file: File) {
  try {
    const result = await uploadImageToR2(file, {
      folder: 'products',
      maxWidth: 1920,
      quality: 90,
    })
    console.log('Uploaded:', result.url)
    // Lưu URL vào form/product
  } catch (err) {
    console.error('Upload failed:', err)
  }
}
```

---

## AI Chat Pattern

```typescript
'use client'

import { useChatStore } from '@/store/useChatStore'
import { nanoid } from 'nanoid'

export function useChatWidget() {
  const { messages, addMessage, updateLastMessage } = useChatStore()
  const [isStreaming, setIsStreaming] = useState(false)

  const sendMessage = async (content: string, image?: string) => {
    const userMsg: ChatMessage = { id: nanoid(), role: 'user', content, image }
    addMessage(userMsg)
    setIsStreaming(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
          productImage: image,
        }),
      })

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        assistantContent += decoder.decode(value, { stream: true })
        updateLastMessage(assistantContent)
      }
    } finally {
      setIsStreaming(false)
    }
  }

  return { messages, sendMessage, isStreaming }
}
```

---

## API Route Pattern (Edge)

```typescript
// app/api/chat/route.ts — Edge Runtime
export const runtime = 'edge'

export async function POST(req: NextRequest) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL
  const body = await req.json()

  const response = await fetch(`${backendUrl}/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  // Forward streaming response
  return new Response(response.body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
    },
  })
}
```

---

## File Naming Conventions

```
Pages:            kebab-case     → admin/brands/page.tsx
Components:       PascalCase     → BrandTable.tsx, product-card.tsx
Hooks:            camelCase      → useAdminBrands.ts
Stores:           useXStore.ts   → useAuthStore.ts
Utils:            camelCase      → utils.ts
Types:            camelCase      → admin.ts
Tests:            *.test.ts      → api.test.ts
Styles:           *.css          → login.css, homepage-responsive.css
E2E:              *.spec.ts      → smoke.spec.ts
Messages:         en.json, vi.json
Providers:        PascalCase     → AuthProvider.tsx, QueryProvider.tsx
```

---

## Import Order

```typescript
// 1. External (React, Next, third-party)
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { create } from 'zustand'
import axios from 'axios'

// 2. Internal (absolute @/*)
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/useAuthStore'
import { Button } from '@/components/ui/button'

// 3. Types
import type { Brand } from '@/types/admin'

// 4. Relative (co-located)
import { BrandTable } from './BrandTable'
```

---

## Performance Standards

```typescript
// ✅ useCallback cho handlers
const handleDelete = useCallback(async (id: string) => {
  await deleteBrand(id)
}, [deleteBrand])

// ✅ useMemo cho computed values
const filteredBrands = useMemo(() =>
  brands.filter(b => b.status === 'active'),
  [brands]
)

// ✅ Zustand selective subscribe
const brands = useAdminStore((s) => s.brands)

// ✅ Image từ Next.js optimized domain
<Image src={url} alt={name} width={400} height={400} className="rounded-2xl" />
```

---

## Code Review Checklist

- [ ] TypeScript strict mode compliance
- [ ] Server Component (default) / Client Component (`'use client'`) đúng
- [ ] Props properly typed with interface
- [ ] Null checks before accessing nested properties
- [ ] Error handling với try-catch trong async operations
- [ ] Loading states cho tất cả async operations
- [ ] Axios interceptor handles token refresh
- [ ] Zustand selective subscribe (ko subscribe toàn bộ store)
- [ ] Responsive design (mobile-first)
- [ ] Performance (useCallback/useMemo cho expensive operations)
- [ ] Không console.log trong production
- [ ] i18n messages cho text hiển thị
- [ ] Image từ R2 domain được allow trong next.config.ts
