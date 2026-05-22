# L'essence Frontend — Elite SaaS 2026

Frontend E-commerce luxury cho thương hiệu nước hoa **L'essence Haute Parfumerie**. Xây dựng với **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS**, và **Zustand**.

---

## Quick Start

```bash
npm install
cp .env.example .env.local    # Chỉnh sửa NEXT_PUBLIC_API_URL
npm run dev                    # → http://localhost:3000
npm run build                  # Production build
npm start                      # Start production server
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development + hot reload |
| `npm run build` | Production build (esbuild) |
| `npm start` | Start production server |
| `npm run lint` | ESLint check |
| `npm test` | Vitest unit tests |
| `npx playwright test` | E2E tests |

## Tech Stack

- **Framework:** Next.js 16 (App Router), React 19
- **Styling:** Tailwind CSS 3.4, shadcn/ui
- **State:** Zustand 5 (persist), Axios interceptors
- **Forms:** React Hook Form + Zod 4
- **AI:** Vercel AI SDK, Edge proxy → Backend Gemini
- **i18n:** next-intl (vi + en)
- **Testing:** Vitest + Playwright
- **Monitoring:** Sentry + PostHog

## Project Structure

```
src/
├── app/[locale]/          # Pages (admin, login, register, profile...)
├── app/api/chat/          # AI chat proxy (Edge)
├── components/ui/         # Public components (banner, product-card, chat-widget...)
├── components/admin/      # Admin components (ProductForm, ImageUpload...)
├── hooks/                 # Custom hooks (useLogin, useAdminBrands...)
├── lib/                   # API client, utilities
├── store/                 # Zustand stores (useAuthStore, useChatStore...)
├── providers/             # Context providers (Auth, Query, PostHog...)
└── messages/              # i18n translations (en.json, vi.json)
```

## Documentation

Chi tiết trong thư mục [Docs/](./Docs/):

- **[Project Structure](./Docs/PROJECT_STRUCTURE.md)** — Kiến trúc, routes, data flow
- **[Tech Stack](./Docs/TECH_STACK.md)** — Công nghệ & lý do chọn
- **[Coding Standards](./Docs/CODING_STANDARDS.md)** — Patterns, hooks, interceptors
- **[State Management](./Docs/STATE_MANAGEMENT.md)** — Zustand stores, Axios interceptor, silent refresh
- **[UI Conventions](./Docs/UI_CONVENTIONS.md)** — Design tokens (L'essence palette), components
- **[Component Architecture](./Docs/COMPONENT_ARCHITECTURE.md)** — Component tree, admin CRUD pattern
- **[Environment Variables](./Docs/ENV_VARIABLES.md)** — Cấu hình biến môi trường

---

*Frontend cho L'essence Haute Parfumerie — Elite SaaS Stack 2026*
