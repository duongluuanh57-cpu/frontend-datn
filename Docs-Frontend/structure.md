# Project Structure & Routes

## Architecture tổng quan

Page-based architecture với **Next.js 16 App Router** + **React 19**. Data flow một chiều:

```
Page (Server/Client) → Components → Hooks → lib/api.ts → Backend API
```

- Server Components mặc định, `'use client'` chỉ dùng khi cần interactivity (state, effects, event handlers).
- API calls tập trung qua `lib/api.ts` — fetch-based, không dùng axios.
- State management: Zustand (auth, app, chat) + TanStack Query (server cache cho một số module).

## Cấu trúc thư mục chính

```
Frontend-client/
├── src/
│   ├── app/[locale]/          # Internationalized routes
│   │   ├── admin/             # Admin dashboard CRUD
│   │   ├── login/, register/
│   │   ├── profile/
│   │   ├── blog/
│   │   ├── product/[id]/
│   │   └── tro-giup/
│   ├── app/api/chat/          # Edge proxy → Backend AI
│   ├── components/ui/         # Public section components
│   ├── components/admin/      # Admin components
│   ├── hooks/                 # Custom hooks (useAdmin*, useLogin, etc.)
│   ├── lib/                   # api.ts, backendDiscovery.ts, utils.ts
│   ├── store/                 # Zustand stores
│   ├── providers/             # Auth, Query, PostHog, etc.
│   ├── types/                 # TypeScript type definitions
│   ├── messages/              # i18n en.json, vi.json
│   └── test/                  # Vitest setup
├── e2e/                       # Playwright tests
├── public/                    # Static assets
└── design-system/             # MASTER.md
```

## Route Structure

Tất cả routes đều nằm trong `/[locale]/...`:

| Route | Chức năng |
|---|---|
| `/` | Homepage |
| `/admin` | Dashboard overview |
| `/admin/brands` | CRUD brands |
| `/admin/categories` | CRUD categories |
| `/admin/tags` | CRUD tags |
| `/admin/taxonomy` | Quản lý taxonomy |
| `/admin/products` | CRUD products |
| `/admin/orders` | Quản lý đơn hàng |
| `/admin/vouchers` | CRUD vouchers |
| `/admin/users` | Quản lý users |
| `/admin/homepage` | Cấu hình homepage |
| `/login` | Đăng nhập |
| `/register` | Đăng ký |
| `/auth/callback` | OAuth callback |
| `/profile` | Hồ sơ người dùng |
| `/blog` | Danh sách blog |
| `/blog/:slug` | Chi tiết blog |
| `/product/:id` | Chi tiết sản phẩm |
| `/tro-giup` | Trợ giúp |
| `/api/chat` | Edge proxy → Backend AI |

## Providers Stack (thứ tự trong `layout.tsx`)

```
PHProvider → QueryProvider → NextIntlClientProvider
  → VisitTracker → NavigationWrapper → Toaster
  → BackendWarmup → children
```
