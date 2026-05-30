# Tech Stack

## Core
- **Framework:** Next.js 16 (App Router, Server Components, SSR, Edge Runtime)
- **Language:** React 19, TypeScript (strict mode)
- **Styling:** Tailwind CSS 3.4, shadcn/ui, CSS Modules

## State Management
- **Client state:** Zustand 5 (with persist middleware)
- **Server state:** TanStack React Query 5

## Forms & Validation
- **Form:** React Hook Form 7
- **Schema:** Zod 4

## HTTP
- **Client:** Fetch-based wrapper (`lib/api.ts`)
  - Dynamic backend discovery
  - JWT refresh queue
  - AI request throttling

## UI Components
- **Icons:** Lucide React
- **Toast:** Sonner
- **Animations:** Framer Motion
- **Drag & Drop:** @dnd-kit
- **Primitives:** @base-ui/react

## AI
- **SDK:** Vercel AI SDK
- **Proxy:** Edge route `/api/chat`

## Monitoring
- **Errors:** Sentry
- **Analytics:** PostHog

## i18n
- **Library:** next-intl
- **Locales:** vi, en

## Testing
- **Unit:** Vitest
- **E2E:** Playwright

## Tooling
- **Linter:** ESLint 9
- **Environment:** Cross-env
