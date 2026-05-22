# State Management — L'essence Frontend (Elite SaaS)

## Overview

Hybrid approach với 3 tầng state:

| State Type | Tool | Stores |
|------------|------|--------|
| Client global | **Zustand** (persist) | Auth, App, Chat |
| Server/API | **Axios interceptors** + local state | Brands, Tags, Products, Orders |
| URL | **next/navigation** (searchParams) | Filters, pagination |
| Component | **useState/useReducer** | Forms, modals, toggles |

---

## Zustand Stores

### 1. useAuthStore — Authentication state

```typescript
// store/useAuthStore.ts
interface AuthState {
  user: User | null            // { id, username, email, role, avatar, tenantId, memberTier }
  accessToken: string | null   // JWT for API calls
  refreshToken: string | null  // JWT for token refresh
  isAuthenticated: boolean
}

// Actions:
setAuth(user, accessToken, refreshToken)  // Set trên login/signup success
logout()                                    // Clear + redirect
updateUser(partial)                         // Update profile fields
```

**Persist:** localStorage (key: `auth-storage`)

**Usage:**
```typescript
const user = useAuthStore((s) => s.user)
const logout = useAuthStore((s) => s.logout)
```

**Sync với localStorage:**
- `setAuth` → `localStorage.setItem('token', accessToken)`
- `logout` → `localStorage.removeItem('token')`
- Axios interceptor đọc `localStorage.getItem('token')` cho Bearer header

---

### 2. useAppStore — Application UI state

```typescript
// store/useAppStore.ts
interface AppState {
  theme: 'light' | 'dark' | 'system'  // Default: 'system'
  sidebarOpen: boolean                  // Default: true
  isInitialized: boolean                // Default: false
}

// Actions:
setTheme(theme)
toggleSidebar()
setInitialized(val)
```

**Không persist** (UI preferences không lưu).

---

### 3. useChatStore — AI Chat state

```typescript
// store/useChatStore.ts
interface ChatState {
  isOpen: boolean                       // Widget open/close
  sessionId: string | null              // Chat session
  isFeedbackOpen: boolean               // Feedback modal
  currentIntent: string | null          // Detected intent
  unreadCount: number                   // Unread messages badge
  messages: ChatMessage[]               // Message history
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  image?: string                        // Attached product image
  isError?: boolean
  rating?: number                       // 1-5 stars
}

// Actions:
setIsOpen, setSessionId, setIsFeedbackOpen, setCurrentIntent
incrementUnread, resetUnread
addMessage(message)
setMessages(messages)
updateLastMessage(content)              // Streaming update
setMessageRating(messageId, rating)
clearMessages()                         // Reset to welcome message
```

**Initial message:**
```typescript
const INITIAL_WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'assistant',
  content: "Chào mừng bạn đến với L'essence. Mình có thể giúp gì cho bạn hôm nay? ✨"
}
```

**Persist:** localStorage (key: `lessence-chat-storage`)

---

## Axios interceptor — Silent Token Refresh

Khi backend trả về 401, hệ thống tự động refresh token mà không làm gián đoạn UX:

```
Request → 401
    │
    ├─ Đã có refresh đang chạy?
    │   ├─ Yes → Queue request, chờ token mới
    │   └─ No → Bắt đầu refresh
    │
    ├─ POST /auth/refresh
    │   ├─ Success → update store, retry tất cả queue
    │   └─ Fail → logout, redirect /login
    │
    └─ Retry original request với token mới
```

```typescript
let isRefreshing = false
let failedQueue: any[] = []

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        })
      }
      // ... refresh logic ...
    }
    return Promise.reject(error)
  }
)
```

---

## Axios interceptor — AI Throttling

Global 2.5s cooldown giữa các AI request để tránh rate limit backend:

```typescript
let lastAiRequestTime = 0
const AI_COOLDOWN_MS = 2500

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

## Hook Pattern (State + API)

Thay vì dùng TanStack Query cho mọi thứ, các hooks tự quản lý local state + gọi API trực tiếp:

```typescript
// hooks/useAdminBrands.ts
export function useAdminBrands() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)

  const fetchBrands = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/brands')
      setBrands(res.data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchBrands() }, [fetchBrands])

  return { brands, loading, refetch: fetchBrands }
}
```

**Lý do:** Đơn giản, dễ đọc, không cần cache layer cho admin CRUD.

---

## Form State

Dùng **React Hook Form** + **Zod** cho tất cả forms:

```typescript
const schema = z.object({
  name: z.string().min(1, 'Tên không được để trống'),
  email: z.string().email('Email không hợp lệ'),
})

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema),
})
```

---

## Best Practices

### 1. Selective Subscribe (Zustand)

```typescript
// ✅ Chỉ re-render khi brands thay đổi
const brands = useAdminStore((s) => s.brands)

// ❌ Re-render khi bất kỳ field nào thay đổi
const { brands, loading, error } = useAdminStore()
```

### 2. Không persist sensitive data

```typescript
persist(
  (set) => ({ /* ... */ }),
  {
    partialize: (state) => ({
      token: state.token,       // OK
      user: state.user,         // OK (public info)
      // password: state.password  // ❌ Không bao giờ persist
    })
  }
)
```

### 3. Xử lý auth redirect

Khi token refresh thất bại → logout + redirect:

```typescript
useAuthStore.getState().logout()
window.location.href = '/login'
```

### 4. Fresh data cho admin pages

Admin CRUD luôn fetch fresh data (không cache):

```typescript
useEffect(() => { fetchBrands() }, [])
// Sau mỗi mutation → fetch lại
const createBrand = async (data) => {
  await api.post('/brands', data)
  await fetchBrands()  // Refresh list
}
```
