# Tech Stack — L'essence Frontend (Elite SaaS)

## Core Technologies

### Framework & Runtime
- **Next.js** `16.2.6` — React framework với App Router
  - Server Components (mặc định), Streaming SSR, Edge Runtime
  - File-based routing, Image/Font optimization
  - `next-intl` plugin cho i18n, `@sentry/nextjs` cho monitoring

- **React** `19.2.4` — UI library
  - Server Components, Hooks, Concurrent features
  - New: `use()` hook, Server Actions

### Language
- **TypeScript** `^5.0` — Strict mode, path alias `@/*`

### Styling
- **Tailwind CSS** `3.4.19` — Utility-first CSS, L'essence custom colors
- **shadcn/ui** `^4.7.0` — Component registry (style: base-nova)
- **tw-animate-css** `^1.4.0` — Tailwind animation plugin
- **CSS modules** — Page-specific styles (login.css, admin.css)

### State Management
- **Zustand** `^5.0.13` — Client state (persist middleware)
  - Stores: useAuthStore (user + tokens), useAppStore (theme/sidebar), useChatStore (messages)
  - Middleware: subscribeWithSelector, persist (localStorage)

### Forms & Validation
- **React Hook Form** `^7.75.0` — Form library (uncontrolled, minimal re-renders)
- **Zod** `^4.4.3` — Schema validation (tích hợp với `@hookform/resolvers`)

### HTTP Client
- **Axios** `^1.16.1` — API communication
  - Interceptors: JWT Bearer, AI throttling (2.5s cooldown), silent token refresh queue

### UI Components
- **Lucide React** `^1.16.0` — Icons (tree-shakeable, SVG)
- **Sonner** `^2.0.7` — Toast notifications
- **Framer Motion** `^12.38.0` — Animations (FadeIn, page transitions)
- **@dnd-kit** — Drag & drop (core, sortable, utilities)
- **@base-ui/react** `^1.4.1` — Headless UI primitives

### AI Integration
- **Vercel AI SDK** `^6.0.184` — AI streaming (`@ai-sdk/react`)
- **Edge Proxy** — `app/api/chat/route.ts` proxy → Backend

### Monitoring & Analytics
- **Sentry** `^10.53.1` — Error tracking (client + server)
- **PostHog** `^1.373.4` — Product analytics (via `posthog-js`)

### Internationalization
- **next-intl** `^4.12.0` — i18n (vi + en)
  - `i18n.ts` config với dynamic imports per locale

### Testing
- **Vitest** `^4.1.6` — Unit tests (jsdom, Testing Library)
- **Playwright** `^1.60.0` — E2E tests (chromium, HTML reporter)

### Development
- **ESLint** `^9.0` — `eslint-config-next` (core-web-vitals + typescript)
- **Cross-env** `^10.1.0` — Cross-platform env (NODE_OPTIONS memory limit)

---

## Why These Choices?

| Choice | Alternative | Reason |
|--------|-------------|--------|
| **Next.js** | CRA, Vite | Server Components, SEO, built-in optimization |
| **Zustand** | Redux (10KB) | 1KB bundle, simpler API, TypeScript-first |
| **Axios** | fetch | Interceptors cho token refresh + AI throttling |
| **shadcn/ui** | MUI, Chakra | Customizable, copy-paste, lightweight |
| **Tailwind** | CSS-in-JS | No runtime, purge unused, consistent tokens |
| **React Hook Form** | Formik | Uncontrolled, minimal re-renders |
| **Sonner** | react-hot-toast | Beautiful default, promise support |
| **Playwright** | Cypress | Cross-browser, faster, auto-wait |

---

## Package Highlights

| Package | Purpose | Key Feature |
|---------|---------|-------------|
| `next` | Framework | App Router, RSC, Edge Runtime |
| `react` + `react-dom` | UI | Server Components, `use()` |
| `zustand` | State | persist, subscribeWithSelector |
| `axios` | HTTP | Interceptors, queue, throttling |
| `react-hook-form` | Forms | Zod resolver, uncontrolled |
| `zod` | Validation | Type inference, composable |
| `framer-motion` | Animation | FadeIn, whileInView |
| `lucide-react` | Icons | Tree-shakeable SVG |
| `sonner` | Toast | Promise-based, stacking |
| `@dnd-kit` | DnD | Sortable lists |
| `ai` + `@ai-sdk/react` | AI | Streaming hooks |
| `@sentry/nextjs` | Errors | Source maps, replay |
| `posthog-js` | Analytics | Events, feature flags |
| `next-intl` | i18n | App Router integration |
| `nanoid` | IDs | Unique ID generation |
| `clsx` + `tailwind-merge` | CSS | Class merging |
| `class-variance-authority` | Variants | Component variants |

---

## Scripts

```json
{
  "dev": "cross-env NODE_OPTIONS='--max-old-space-size=2048' next dev",
  "build": "cross-env NODE_OPTIONS='--max-old-space-size=2048' next build",
  "start": "next start",
  "lint": "eslint .",
  "test": "vitest run",
  "clean": "node -e \"require('fs').rmSync('.next',{recursive:true,force:true})\""
}
```

## Build Information

- **Development:** ~2s (Fast Refresh)
- **Production build:** ~30s
- **First Load JS:** ~85KB (gzipped)
- **Target browsers:** Last 2 versions (Chrome, Firefox, Safari, Edge)
