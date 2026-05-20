# Tech Stack - Elite SaaS Frontend

## Core Technologies

### Framework & Runtime
- **Next.js** `16.2.6` - React framework với App Router
  - Why: Server Components, streaming, built-in optimization
  - Features: File-based routing, API routes, middleware, image optimization
  - Performance: Automatic code splitting, prefetching, caching
  
- **React** `19.2.4` - UI library
  - Why: Component-based, declarative, large ecosystem
  - Features: Hooks, Suspense, Server Components, Concurrent rendering
  - New in 19: Actions, use() hook, improved hydration

### Language
- **TypeScript** `^5.0` - Typed JavaScript
  - Why: Type safety, better IDE support, catch errors early
  - Config: Strict mode, path aliases (`@/*`)
  - Target: ES2017

### Styling
- **Tailwind CSS** `3.4.19` - Utility-first CSS framework
  - Why: Fast development, consistent design, small bundle
  - Features: JIT compiler, custom theme, responsive utilities
  - Plugins: Forms, typography, animations
  
- **shadcn/ui** `^4.7.0` - Component library
  - Why: Accessible, customizable, copy-paste components
  - Based on: Radix UI primitives
  - Styling: Tailwind CSS + CVA (Class Variance Authority)

### State Management
- **Zustand** `^5.0.13` - Lightweight state management
  - Why: Simple API, no boilerplate, TypeScript-first
  - Features: Persist middleware, DevTools, immer integration
  - Use cases: Auth state, cart, UI state
  
- **TanStack Query** `^5.100.10` - Server state management
  - Why: Caching, refetching, optimistic updates
  - Features: Automatic background refetching, pagination, infinite scroll
  - Use cases: API data fetching, caching

### Forms & Validation
- **React Hook Form** `^7.75.0` - Form library
  - Why: Performance, minimal re-renders, easy validation
  - Features: Uncontrolled components, built-in validation
  
- **Zod** `^4.4.3` - Schema validation
  - Why: Type inference, composable schemas
  - Integration: `@hookform/resolvers` for React Hook Form

### Animations
- **Framer Motion** `^12.38.0` - Animation library
  - Why: Declarative animations, gesture support, layout animations
  - Features: Variants, spring physics, SVG animations
  - Use cases: Page transitions, micro-interactions

### Internationalization
- **next-intl** `^4.12.0` - i18n for Next.js
  - Why: Type-safe, App Router support, automatic locale detection
  - Features: Message formatting, pluralization, date/time formatting
  - Languages: English, Vietnamese, French

### HTTP Client
- **Axios** `^1.16.1` - HTTP client
  - Why: Interceptors, request/response transformation, timeout
  - Features: Automatic JSON parsing, CSRF protection
  - Use cases: API communication with Backend

### AI Integration
- **Vercel AI SDK** `^6.0.184` - AI utilities
  - Why: Streaming responses, React hooks, type-safe
  - Features: `useChat`, `useCompletion`, streaming text
  - Use cases: AI chat widget, product recommendations

### UI Components
- **Lucide React** `^1.16.0` - Icon library
  - Why: Consistent design, tree-shakeable, customizable
  - Features: 1000+ icons, SVG-based
  
- **Sonner** `^2.0.7` - Toast notifications
  - Why: Beautiful, accessible, customizable
  - Features: Promise-based, stacking, positioning

### Monitoring & Analytics
- **Sentry** `^10.53.1` - Error tracking
  - Why: Real-time error monitoring, performance tracking
  - Features: Source maps, breadcrumbs, releases
  - Integration: Next.js plugin
  
- **PostHog** `^1.373.4` - Product analytics
  - Why: Event tracking, feature flags, session replay
  - Features: Funnels, cohorts, A/B testing

### Testing
- **Vitest** `^4.1.6` - Unit testing
  - Why: Fast, Vite-powered, Jest-compatible
  - Features: Watch mode, coverage, snapshot testing
  
- **Playwright** `^1.60.0` - E2E testing
  - Why: Cross-browser, reliable, auto-wait
  - Features: Codegen, trace viewer, screenshots
  
- **Testing Library** `^16.3.2` - Component testing
  - Why: User-centric testing, accessibility-focused
  - Features: Query by role, user events

### Development Tools
- **ESLint** `^9.0` - Linting
  - Config: `eslint-config-next` (Next.js recommended rules)
  - Plugins: React, TypeScript, accessibility
  
- **Autoprefixer** `^10.4.19` - CSS vendor prefixes
  - Why: Automatic browser compatibility
  
- **cross-env** `^10.1.0` - Cross-platform env variables
  - Why: Works on Windows, Mac, Linux

## Package.json Scripts

```json
{
  "scripts": {
    "dev": "cross-env NODE_OPTIONS='--max-old-space-size=2048' next dev",
    "build": "cross-env NODE_OPTIONS='--max-old-space-size=2048' next build",
    "start": "next start",
    "lint": "eslint .",
    "test": "vitest run",
    "clean": "node -e \"const fs = require('fs'); ['.next', 'dist', '.turbo'].forEach(d => { if (fs.existsSync(d)) { fs.rmSync(d, { recursive: true, force: true }); console.log('🧹 Cleaned ' + d); } })\""
  }
}
```

## TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "strict": true,
    "jsx": "react-jsx",
    "module": "esnext",
    "moduleResolution": "bundler",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## Tailwind Configuration

```javascript
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Custom colors
      },
      fontFamily: {
        // Custom fonts
      }
    }
  },
  plugins: [
    require('tw-animate-css')
  ]
}
```

## Next.js Configuration

```typescript
const nextConfig = {
  images: {
    qualities: [70, 75, 80, 90, 95, 100],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.r2.dev',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
}
```

## Why These Choices?

### Next.js 16 over Create React App
- **Server Components** - Better performance, SEO
- **App Router** - Modern routing, layouts, streaming
- **Built-in optimization** - Image, font, script optimization
- **API routes** - Backend functionality without separate server

### React 19 over Vue/Angular
- **Largest ecosystem** - More libraries, resources
- **Server Components** - Render on server, reduce JS bundle
- **Concurrent rendering** - Better UX, smoother interactions
- **Actions** - Simplified form handling

### Tailwind over CSS-in-JS
- **Faster** - No runtime, smaller bundle
- **Consistent** - Design system built-in
- **Developer experience** - IntelliSense, autocomplete
- **Production-ready** - Purge unused styles

### shadcn/ui over Material-UI
- **Customizable** - Copy-paste, full control
- **Accessible** - Built on Radix UI primitives
- **Lightweight** - Only include what you use
- **Modern design** - Clean, minimal aesthetic

### Zustand over Redux
- **Simpler** - Less boilerplate, easier to learn
- **Smaller** - 1KB vs 10KB+
- **TypeScript-first** - Better type inference
- **Flexible** - No strict patterns required

### TanStack Query over SWR
- **More features** - Pagination, infinite scroll, mutations
- **Better DevTools** - Inspect queries, mutations
- **Larger community** - More resources, examples
- **Framework agnostic** - Works with any framework

### Framer Motion over React Spring
- **Easier API** - Declarative, component-based
- **Layout animations** - Automatic layout transitions
- **Gestures** - Built-in drag, hover, tap
- **Better docs** - Comprehensive examples

### Vitest over Jest
- **10x faster** - Vite-powered
- **Better TypeScript** - Native support
- **Compatible** - Jest API, easy migration
- **Modern** - ESM, top-level await

### Playwright over Cypress
- **Cross-browser** - Chromium, Firefox, WebKit
- **Faster** - Parallel execution
- **Auto-wait** - No flaky tests
- **Better debugging** - Trace viewer, screenshots

## Performance Benchmarks

### Build Time
- Development: ~2s (Fast Refresh)
- Production: ~30s (optimized build)

### Bundle Size
- First Load JS: ~85KB (gzipped)
- Page JS: ~10-20KB per route

### Lighthouse Scores
- Performance: 95+
- Accessibility: 100
- Best Practices: 100
- SEO: 100

## Browser Support

```
> 0.5%
last 2 versions
Firefox ESR
not dead
not IE 11
```

## Production Deployment

### Environment
- **Platform**: Vercel (recommended) or Netlify
- **Node Version**: 18+
- **Memory**: 1GB minimum

### Build Process
```bash
npm run build
npm start
```

### Environment Variables
See [ENV_VARIABLES.md](./ENV_VARIABLES.md)

## Related Documentation

- [Project Structure](./PROJECT_STRUCTURE.md)
- [UI Conventions](./UI_CONVENTIONS.md)
- [Coding Standards](./CODING_STANDARDS.md)
- [State Management](./STATE_MANAGEMENT.md)
- [Environment Variables](./ENV_VARIABLES.md)
