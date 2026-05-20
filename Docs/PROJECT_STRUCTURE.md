# Project Structure - Elite SaaS Frontend

## Overview
Modern Next.js 16 frontend application với React 19, TypeScript, Tailwind CSS, và shadcn/ui. Tập trung vào **performance**, **accessibility**, và **internationalization**.

## Architecture Pattern
**Feature-based Architecture** với App Router (Next.js 16)

```
Request → Middleware → Layout → Page → Components → Services → API
            ↓           ↓        ↓         ↓           ↓
         i18n/Auth   Shared   Route    Features    Backend
```

## Directory Structure

```
Frontend-client/
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── [locale]/          # Internationalized routes
│   │   │   ├── (auth)/        # Auth route group
│   │   │   │   ├── login/
│   │   │   │   ├── register/
│   │   │   │   └── 2fa/
│   │   │   │
│   │   │   ├── (dashboard)/   # Dashboard route group
│   │   │   │   ├── products/
│   │   │   │   ├── orders/
│   │   │   │   ├── brands/
│   │   │   │   └── settings/
│   │   │   │
│   │   │   ├── (shop)/        # Public shop routes
│   │   │   │   ├── page.tsx   # Homepage
│   │   │   │   ├── products/
│   │   │   │   ├── cart/
│   │   │   │   └── checkout/
│   │   │   │
│   │   │   ├── layout.tsx     # Root layout
│   │   │   └── page.tsx       # Home page
│   │   │
│   │   ├── api/               # API routes (if needed)
│   │   ├── globals.css        # Global styles
│   │   └── not-found.tsx      # 404 page
│   │
│   ├── components/            # Reusable components
│   │   ├── ui/                # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── card.tsx
│   │   │   └── ...
│   │   │
│   │   └── animations/        # Framer Motion animations
│   │       ├── fade-in.tsx
│   │       ├── slide-in.tsx
│   │       └── ...
│   │
│   ├── features/              # Feature modules
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── types/
│   │   │
│   │   ├── products/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── types/
│   │   │
│   │   ├── orders/
│   │   ├── cart/
│   │   ├── ai-chat/
│   │   └── email/
│   │
│   ├── hooks/                 # Global custom hooks
│   │   ├── use-auth.ts
│   │   ├── use-cart.ts
│   │   ├── use-toast.ts
│   │   └── use-media-query.ts
│   │
│   ├── lib/                   # Utilities & configs
│   │   ├── utils.ts           # Helper functions
│   │   ├── cn.ts              # Class name merger
│   │   ├── api.ts             # API client
│   │   └── constants.ts       # App constants
│   │
│   ├── services/              # API services
│   │   ├── auth.service.ts
│   │   ├── product.service.ts
│   │   ├── order.service.ts
│   │   └── ai.service.ts
│   │
│   ├── store/                 # Zustand state management
│   │   ├── auth.store.ts
│   │   ├── cart.store.ts
│   │   └── ui.store.ts
│   │
│   ├── types/                 # TypeScript types
│   │   ├── auth.types.ts
│   │   ├── product.types.ts
│   │   ├── order.types.ts
│   │   └── api.types.ts
│   │
│   ├── providers/             # React Context providers
│   │   ├── query-provider.tsx # TanStack Query
│   │   ├── theme-provider.tsx
│   │   └── posthog-provider.tsx
│   │
│   ├── messages/              # i18n translations
│   │   ├── en.json
│   │   ├── vi.json
│   │   └── fr.json
│   │
│   ├── test/                  # Test utilities
│   │   ├── setup.ts
│   │   └── utils.tsx
│   │
│   ├── i18n.ts                # next-intl config
│   ├── navigation.ts          # Typed navigation
│   └── proxy.ts               # API proxy config
│
├── public/                    # Static assets
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── e2e/                       # Playwright E2E tests
│   ├── smoke.spec.ts
│   └── chat-widget.spec.ts
│
├── design-system/             # Design system docs
│   └── l'essence/
│
├── Docs/                      # Documentation
│   ├── PROJECT_STRUCTURE.md
│   ├── TECH_STACK.md
│   ├── UI_CONVENTIONS.md
│   ├── CODING_STANDARDS.md
│   ├── STATE_MANAGEMENT.md
│   └── ENV_VARIABLES.md
│
├── .env.example
├── .env.local
├── next.config.ts
├── tailwind.config.js
├── tsconfig.json
├── components.json            # shadcn/ui config
├── playwright.config.ts
└── vitest.config.ts
```

## Layer Responsibilities

### 1. App Router (`src/app/`)
- File-based routing với Next.js 16
- Server Components by default
- Layouts, loading states, error boundaries
- Route groups: `(auth)`, `(dashboard)`, `(shop)`
- Internationalization với `[locale]`

### 2. Components (`src/components/`)
- **ui/**: shadcn/ui components (Button, Input, Dialog, etc.)
- **animations/**: Framer Motion wrappers
- Reusable, composable, accessible
- **Client Components** when needed (`'use client'`)

### 3. Features (`src/features/`)
- Feature-specific components, hooks, types
- Self-contained modules
- Example: `features/auth/`, `features/products/`
- Co-located with related code

### 4. Services (`src/services/`)
- API communication với Backend
- Axios instances với interceptors
- Error handling
- Type-safe requests/responses

### 5. Store (`src/store/`)
- Zustand for global state
- Separate stores per domain (auth, cart, ui)
- Persist middleware for localStorage
- DevTools integration

### 6. Hooks (`src/hooks/`)
- Custom React hooks
- Reusable logic
- Examples: `useAuth`, `useCart`, `useToast`

### 7. Providers (`src/providers/`)
- React Context providers
- TanStack Query setup
- Theme provider
- Analytics (PostHog)

## Data Flow Example

```typescript
// User clicks "Add to Cart"
1. Component (Client Component)
   → features/products/components/ProductCard.tsx
   → onClick handler

2. Store (Zustand)
   → store/cart.store.ts
   → addItem(product)

3. Service (API call)
   → services/cart.service.ts
   → POST /api/cart/items

4. Backend API
   → Backend-api/src/routes/cart.routes.ts

5. Update UI
   → Store updates
   → Components re-render
   → Toast notification
```

## Route Groups

### (auth) - Authentication Routes
```
/[locale]/login
/[locale]/register
/[locale]/2fa
/[locale]/forgot-password
```

### (dashboard) - Admin Dashboard
```
/[locale]/dashboard
/[locale]/dashboard/products
/[locale]/dashboard/orders
/[locale]/dashboard/brands
/[locale]/dashboard/settings
```

### (shop) - Public Shop
```
/[locale]                    # Homepage
/[locale]/products           # Product listing
/[locale]/products/[slug]    # Product detail
/[locale]/cart               # Shopping cart
/[locale]/checkout           # Checkout
```

## Key Principles

1. **Server Components First** - Use Server Components by default, Client Components only when needed
2. **Type Safety** - Full TypeScript coverage with strict mode
3. **Accessibility** - WCAG 2.1 AA compliance with shadcn/ui
4. **Performance** - Code splitting, lazy loading, image optimization
5. **Internationalization** - Multi-language support với next-intl
6. **Responsive Design** - Mobile-first approach
7. **SEO Optimized** - Metadata, Open Graph, structured data
8. **Error Handling** - Error boundaries, fallback UI

## File Naming Conventions

```
Components:     PascalCase      → ProductCard.tsx
Pages:          kebab-case      → product-detail/page.tsx
Hooks:          camelCase       → useAuth.ts
Services:       camelCase       → auth.service.ts
Types:          camelCase       → product.types.ts
Stores:         camelCase       → cart.store.ts
Utils:          camelCase       → format-price.ts
```

## Import Conventions

```typescript
// 1. External dependencies
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'

// 2. Internal modules (absolute imports with @/)
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { productService } from '@/services/product.service'

// 3. Types
import type { Product } from '@/types/product.types'

// 4. Relative imports (only for co-located files)
import { ProductCard } from './ProductCard'
```

## Server vs Client Components

### Server Components (Default)
```typescript
// No 'use client' directive
// Can fetch data directly
// Cannot use hooks, event handlers

export default async function ProductsPage() {
  const products = await fetch('...')
  return <ProductList products={products} />
}
```

### Client Components
```typescript
'use client'

// Can use hooks, event handlers
// Cannot fetch data directly (use useEffect or TanStack Query)

export function ProductCard({ product }: Props) {
  const [isLiked, setIsLiked] = useState(false)
  
  return (
    <Card onClick={() => setIsLiked(!isLiked)}>
      {/* ... */}
    </Card>
  )
}
```

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Run E2E tests
npx playwright test
```

## Related Documentation

- [Tech Stack Details](./TECH_STACK.md)
- [UI Conventions](./UI_CONVENTIONS.md)
- [Coding Standards](./CODING_STANDARDS.md)
- [State Management](./STATE_MANAGEMENT.md)
- [Environment Variables](./ENV_VARIABLES.md)
