# Project Structure — L'essence Frontend (Elite SaaS)

## Tổng quan kiến trúc

Frontend được xây dựng với **Next.js 16 (App Router)** + **React 19**, sử dụng kiến trúc **Page-based** (không feature-based) với App Router file-based routing.

```
HTTP Request → Next.js Edge/Middleware
    │
    ▼
┌──────────────────────────────────────────────────────┐
│  App Router (src/app/)                                │
│  ├─ [locale]/ — Internationalized routes (vi/en)     │
│  │   ├─ layout.tsx — Root layout (providers stack)   │
│  │   ├─ page.tsx — Homepage (banner, products, ...)  │
│  │   ├─ admin/ — Admin dashboard CRUD               │
│  │   ├─ login/, register/ — Auth pages              │
│  │   ├─ profile/ — User profile & orders            │
│  │   └─ tro-giup/ — Help page                       │
│  │                                                    │
│  ├─ api/ — Next.js API routes (Edge)                  │
│  │   └─ chat/route.ts — AI chat proxy → Backend     │
│  └─ globals.css — Global + Tailwind styles           │
│                                                       │
│  DATA FLOW: Page → Components → Hooks → lib/api.ts   │
└──────────────────────┬───────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│  Layers                                               │
│                                                       │
│  Page (app/) → Server Component (default)             │
│    │                                                   │
│    ├─ Layout: providers, navigation, footer            │
│    ├─ Page: fetches data, renders sections             │
│    └─ Components: reusable UI blocks                   │
│         │                                              │
│         └─ Client Components ('use client')            │
│              │                                         │
│              ├─ Hooks: state + side effects            │
│              │   ├─ useLogin, useRegister              │
│              │   ├─ useAdminBrands, useAdminTags       │
│              │   ├─ useHomepageConfig                  │
│              │   └─ useChatWidget, useProductCatalog   │
│              │                                         │
│              ├─ lib/api.ts — Axios instance            │
│              │   ├─ Base URL config                    │
│              │   ├─ JWT interceptor (Bearer token)     │
│              │   ├─ AI throttling (2.5s cooldown)     │
│              │   └─ Silent token refresh queue         │
│              │                                         │
│              ├─ Store (Zustand)                        │
│              │   ├─ useAuthStore — user, tokens        │
│              │   ├─ useAppStore — theme, sidebar       │
│              │   └─ useChatStore — messages, session   │
│              │                                         │
│              └─ lib/api.ts → Backend API               │
└──────────────────────────────────────────────────────┘
```

---

## Cấu trúc thư mục

```
Frontend-client/
├── .env.local                    # NEXT_PUBLIC_API_URL, PostHog keys
├── .env.example                  # Template
├── next.config.ts                # Next.js config (Sentry, i18n, images, headers)
├── tailwind.config.js            # L'essence colors: #D4A5A5, #7A5C5C, ...
├── tsconfig.json                 # Strict TS, path alias @/*
├── vitest.config.ts              # Vitest (jsdom)
├── playwright.config.ts          # Playwright E2E
├── components.json               # shadcn/ui config
├── eslint.config.mjs             # ESLint (Next.js + TS rules)
├── sentry.client.config.ts       # Sentry browser init
├── sentry.server.config.ts       # Sentry server init
├── postcss.config.js             # Tailwind + autoprefixer
│
├── src/
│   ├── app/
│   │   ├── globals.css                    # Tailwind directives + base styles
│   │   │
│   │   ├── [locale]/                      # Internationalized routes
│   │   │   ├── layout.tsx                 # Root layout: providers, nav, footer
│   │   │   ├── page.tsx                   # Homepage (Server Component)
│   │   │   ├── homepage-responsive.css    # Homepage custom styles
│   │   │   │
│   │   │   ├── admin/                     # Admin dashboard (CRUD modules)
│   │   │   │   ├── layout.tsx             # Admin layout (sidebar, header)
│   │   │   │   ├── page.tsx               # Admin dashboard overview
│   │   │   │   ├── admin.css              # Admin custom styles
│   │   │   │   ├── brands/                # Brand CRUD
│   │   │   │   │   ├── page.tsx               # List + bulk delete
│   │   │   │   │   ├── [id]/page.tsx          # Edit brand
│   │   │   │   │   ├── new/page.tsx           # Create brand
│   │   │   │   │   └── components/            # BrandTable, BrandHeader, etc.
│   │   │   │   ├── tags/                  # Tag CRUD
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── [id]/page.tsx
│   │   │   │   │   ├── new/page.tsx
│   │   │   │   │   └── components/
│   │   │   │   ├── taxonomy/              # Taxonomy CRUD (v1 + v2)
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── components/            # TaxonomyTabs, TaxonomyTable, etc.
│   │   │   │   ├── products/              # Product CRUD
│   │   │   │   │   ├── page.tsx               # List with filters
│   │   │   │   │   ├── [id]/page.tsx          # Edit (EditProductClient)
│   │   │   │   │   ├── new/page.tsx           # Create
│   │   │   │   │   └── components/            # ProductTable, FilterBar, Modals
│   │   │   │   ├── users/                 # User management (admin)
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── components/            # UserTable, UserStats, etc.
│   │   │   │   └── homepage/              # Homepage config editor
│   │   │   │       ├── page.tsx
│   │   │   │       └── components/            # Banners, Gallery, Card, Layout tabs
│   │   │   │
│   │   │   ├── login/                     # Login page
│   │   │   │   ├── page.tsx
│   │   │   │   ├── login.css
│   │   │   │   └── components/                # LoginForm, LoginIdentity
│   │   │   ├── register/                  # Register page
│   │   │   │   ├── page.tsx
│   │   │   │   ├── register.css
│   │   │   │   └── components/                # RegisterForm, Benefits, SocialRegister
│   │   │   ├── auth/
│   │   │   │   └── callback/page.tsx      # OAuth callback handler
│   │   │   ├── profile/                   # User profile & orders
│   │   │   │   ├── page.tsx
│   │   │   │   ├── profile.css
│   │   │   │   └── components/                # ProfileSidebar, OrdersTab, SettingsTab
│   │   │   └── tro-giup/                  # Help page
│   │   │       └── page.tsx
│   │   │
│   │   └── api/                           # Next.js API routes
│   │       └── chat/
│   │           └── route.ts               # Edge proxy → Backend /api/ai/chat
│   │
│   ├── components/                        # Reusable UI components
│   │   ├── ui/                            # Public section components
│   │   │   ├── banner.tsx, banner.css     # Hero banner (responsive) — composer
│   │   │   ├── banner/                    # BannerBackground, BannerTitle, BannerDescription,
│   │   │   │                              # EditableBannerLabel, BannerActions, ImageEditorModal, useBannerData
│   │   │   ├── product-card.tsx           # Re-export from product-card/
│   │   │   ├── product-card/              # ProductImage, ProductInfo, types, index
│   │   │   ├── navbar.tsx                 # Main navigation — composer
│   │   │   ├── navbar/                    # NavbarLogo, NavbarNavLink, NavbarSearch, NavbarCart, NavbarUser
│   │   │   ├── topbar.tsx                 # Top bar (promo, language)
│   │   │   ├── footer.tsx, footer.css     # Site footer
│   │   │   ├── navigation-wrapper.tsx     # Client wrapper for navbar
│   │   │   ├── brands-marquee.tsx         # Brand logo strip
│   │   │   ├── new-products.tsx           # New products section
│   │   │   ├── new-products/              # FilterBar, Skeleton, hooks
│   │   │   ├── limited-products.tsx       # Limited edition section
│   │   │   ├── limited-products/          # FilterBar, hooks
│   │   │   ├── trending-products.tsx      # Trending section
│   │   │   ├── trending-products/         # FilterBar, Skeleton, hooks
│   │   │   ├── sale-products.tsx          # Sale section
│   │   │   ├── brand-usp.tsx              # Brand value props
│   │   │   ├── luxury-gallery.tsx         # Image gallery + lightbox
│   │   │   ├── luxury-gallery/            # Lightbox, hooks
│   │   │   ├── blog-posts.tsx             # Blog posts section
│   │   │   ├── customer-reviews.tsx       # Reviews section
│   │   │   ├── newsletter-subscription.tsx # Email subscribe
│   │   │   ├── chat-widget.tsx            # AI chat widget
│   │   │   ├── chat-widget.css
│   │   │   ├── chat-widget/               # InputArea, MessageList, ProductCard
│   │   │   ├── chat-feedback.tsx          # Feedback form (rating)
│   │   │   ├── homepage-dynamic-renderer.tsx # Re-export from homepage-dynamic-renderer/
│   │   │   ├── homepage-dynamic-renderer/ # SectionFallback, useSectionOrder, index
│   │   │   └── image-upload-panel.tsx     # Image upload UI
│   │   │
│   │   ├── admin/                         # Admin components
│   │   │   ├── ProductForm.tsx            # Full product form
│   │   │   ├── product-form/              # Sub-sections (Details, Media, SEO)
│   │   │   ├── ImageUpload.tsx            # Single image upload
│   │   │   ├── AIChatPanel.tsx            # AI chat panel — composer
│   │   │   ├── ai-chat-panel/             # ChatHeader, ChatMessage, ChatInput
│   │   │   ├── MultipleImageUpload.tsx    # Bulk image upload — composer
│   │   │   └── multiple-image-upload/     # ImagePreview, UploadArea
│   │   │
│   │   └── animations/
│   │       └── FadeIn.tsx                 # Framer Motion fade animation
│   │
│   ├── hooks/                             # Custom React hooks
│   │   ├── useLogin.ts                    # Login logic + token storage
│   │   ├── useRegister.ts                 # Register logic
│   │   ├── useProductCatalog.ts           # Product collections (new, trending, etc.)
│   │   ├── useHomepageConfig.ts           # Fetch homepage config — composer
│   │   ├── homepage-config/               # types.ts, constants.ts
│   │   ├── useHomepageTags.ts             # Fetch tags for homepage
│   │   ├── useHomepageTaxonomies.ts       # Fetch taxonomies
│   │   ├── useAdminBrands.ts              # Admin brand CRUD
│   │   ├── useAdminTags.ts                # Admin tag CRUD
│   │   ├── useAdminTaxonomy.ts            # Admin taxonomy CRUD — composer
│   │   ├── admin-taxonomy/                # useTaxonomyQuery, useTaxonomyMutations, useTaxonomySelection
│   │   ├── useAdminOrders.ts              # Admin order management — composer
│   │   ├── admin-orders/                  # useOrderFilters
│   │   ├── useAdminUsers.ts               # Admin user management — composer
│   │   ├── admin-users/                   # useUserFilters, useUserSelection
│   │   ├── useAdminHomepage.ts            # Admin homepage config — composer
│   │   ├── admin/                         # useAdminHomepage{Banners,Gallery,Cards,Layout,NavbarFooter,Sections}
│   │   ├── useUserProfile.ts              # User profile management — composer
│   │   └── profile/                       # useProfileDetails, useProfilePassword, useProfileAddresses, useProfileOrders
│   │
│   ├── lib/
│   │   ├── api.ts                         # Axios instance, interceptors, helpers
│   │   ├── api.test.ts                    # API layer tests
│   │   ├── utils.ts                       # cn() class merger + helpers
│   │   └── evals/
│   │       └── ai-eval.ts                 # AI evaluation utilities
│   │
│   ├── store/                             # Zustand stores
│   │   ├── useAuthStore.ts                # Auth: user, tokens, setAuth/logout
│   │   ├── useAppStore.ts                 # App: theme, sidebar, initialized
│   │   └── useChatStore.ts                # Chat: messages, session, feedback
│   │
│   ├── providers/                         # React context providers
│   │   ├── AuthProvider.tsx               # Auth initialization
│   │   ├── QueryProvider.tsx              # TanStack Query client
│   │   ├── posthog-provider.tsx           # PostHog analytics
│   │   ├── BackendWarmup.tsx              # Ping backend on mount
│   │   ├── backend-warmup.css
│   │   └── VisitTracker.tsx               # Track page visits
│   │
│   ├── messages/                          # i18n translations
│   │   ├── en.json                        # English
│   │   └── vi.json                        # Vietnamese
│   │
│   ├── types/
│   │   └── admin.ts                       # Admin type definitions
│   │
│   ├── test/
│   │   └── setup.ts                       # Vitest setup (Testing Library)
│   │
│   ├── features/
│   │   └── email/
│   │       └── templates/
│   │           └── WelcomeEmail.ts        # Email template string
│   │
│   ├── i18n.ts                            # next-intl config
│   ├── navigation.ts                      # Typed navigation helpers
│   └── proxy.ts                           # API proxy config
│
├── design-system/
│   └── l'essence/
│       └── MASTER.md                      # Design system (Liquid Glass)
│
├── e2e/
│   ├── smoke.spec.ts                      # Homepage load + locale switch
│   └── chat-widget.spec.ts                # Chat open/close, send message
│
├── public/
│   ├── images/                            # Static images (banners, icons)
│   └── ...                                # Static assets
│
└── Docs/                                  # Tài liệu kỹ thuật
    ├── PROJECT_STRUCTURE.md               # File này
    ├── TECH_STACK.md
    ├── CODING_STANDARDS.md
    ├── STATE_MANAGEMENT.md
    ├── UI_CONVENTIONS.md
    ├── COMPONENT_ARCHITECTURE.md
    └── ENV_VARIABLES.md
```

---

## Route Structure (Thực tế)

```
/[locale]                   → Homepage (page.tsx)
/[locale]/admin             → Admin dashboard
/[locale]/admin/brands      → Brand CRUD
/[locale]/admin/tags        → Tag CRUD
/[locale]/admin/taxonomy    → Taxonomy CRUD
/[locale]/admin/products    → Product CRUD
/[locale]/admin/products/new    → Create product
/[locale]/admin/products/:id    → Edit product
/[locale]/admin/users       → User management
/[locale]/admin/homepage    → Homepage config
/[locale]/login             → Login page
/[locale]/register          → Register page
/[locale]/auth/callback     → OAuth callback
/[locale]/profile           → User profile & orders
/[locale]/tro-giup          → Help page
/api/chat                   → AI chat proxy (Edge)
```

---

## Data Flow Patterns

### Pattern 1: Public Page (Homepage)
```
page.tsx (Server Component)
  → Sử dụng hooks client component bên trong (new-products.tsx)
    → useHomepageTags() gọi api.get('/tags')
    → ProductCatalogSection render products
```

### Pattern 2: Admin CRUD
```
admin/brands/page.tsx
  → BrandTable component ('use client')
    → useAdminBrands() hook
      → api.get('/brands'), api.post('/brands'), etc.
      → setState locally (NOT TanStack Query)
    → BrandModals for delete confirmation
```

### Pattern 3: Auth
```
login/page.tsx
  → LoginForm component ('use client')
    → useLogin() hook
      → api.post('/auth/login')
      → useAuthStore.setAuth(user, accessToken, refreshToken)
      → router.push('/')
```

### Pattern 4: AI Chat
```
chat-widget.tsx
  → useChatWidget hook
    → fetch('/api/chat', { body: messages })
    → api/chat/route.ts (Edge)
      → fetch backend /api/ai/chat
      → Stream response back
    → useChatStore.addMessage()
    → ChatWidgetMessageList renders
```

---

## Key Architectural Decisions

| Decision | Rationale |
|----------|-----------|
| **No services/ directory** | Hooks + api.ts trực tiếp, đơn giản hơn service layer |
| **TanStack Query only for server cache** | Thực tế hooks tự quản lý state riêng, không dùng useQuery phổ biến |
| **Zustand persist middleware** | Auth + Chat state được persist vào localStorage |
| **Edge API proxy cho AI** | /api/chat route chạy Edge Runtime để proxy streaming |
| **Axios interceptors** | Token refresh queue + AI throttling (2.5s cooldown) |
| **Server Components mặc định** | Chỉ 'use client' khi cần interactivity, hooks, browser APIs |

---

## Providers Stack (Thứ tự trong layout.tsx)

```
PHProvider (PostHog)
  └─ QueryProvider (TanStack Query)
      └─ NextIntlClientProvider (i18n)
          └─ VisitTracker
              └─ NavigationWrapper
                  ├─ Toaster (Sonner)
                  ├─ BackendWarmup (ping backend)
                  └─ children (page content)
```
