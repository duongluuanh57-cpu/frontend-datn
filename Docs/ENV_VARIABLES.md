# Environment Variables - Elite SaaS Frontend

## Overview

Next.js supports environment variables with different prefixes:
- `NEXT_PUBLIC_*` - Exposed to browser (client-side)
- No prefix - Server-side only (API routes, Server Components)

## Required Variables

### API Configuration

```bash
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:4000/api

# API timeout (milliseconds)
NEXT_PUBLIC_API_TIMEOUT=30000
```

**Usage:**
- `NEXT_PUBLIC_API_URL` - Base URL for all API requests
- `NEXT_PUBLIC_API_TIMEOUT` - Request timeout (default: 30 seconds)

**Development:**
```
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

**Production:**
```
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
```

---

### Application Configuration

```bash
# App URL (for OAuth redirects, emails)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# App name
NEXT_PUBLIC_APP_NAME=Elite SaaS

# Environment
NODE_ENV=development
```

---

### Monitoring & Analytics

```bash
# Sentry DSN (Error Tracking)
NEXT_PUBLIC_SENTRY_DSN=https://abc123@o123456.ingest.sentry.io/7654321
SENTRY_ORG=elite-saas
SENTRY_PROJECT=frontend

# PostHog (Product Analytics)
NEXT_PUBLIC_POSTHOG_KEY=phc_abc123def456
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

**Sentry Setup:**
1. Go to [Sentry.io](https://sentry.io/)
2. Create new project (Next.js)
3. Copy DSN, org, and project name

**PostHog Setup:**
1. Go to [PostHog](https://posthog.com/)
2. Create account
3. Copy API key from Project Settings

---

### Authentication (Optional)

```bash
# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
```

**How to get:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Add authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/google/callback`
   - Production: `https://yourdomain.com/api/auth/google/callback`

---

### Feature Flags (Optional)

```bash
# Enable/disable features
NEXT_PUBLIC_ENABLE_AI_CHAT=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_2FA=true
```

---

## Environment Files

### .env.local (Development)

```bash
# API
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_API_TIMEOUT=30000

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Elite SaaS
NODE_ENV=development

# Monitoring (optional in dev)
NEXT_PUBLIC_SENTRY_DSN=
NEXT_PUBLIC_POSTHOG_KEY=

# Features
NEXT_PUBLIC_ENABLE_AI_CHAT=true
NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

### .env.production (Production)

```bash
# API
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
NEXT_PUBLIC_API_TIMEOUT=30000

# App
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_APP_NAME=Elite SaaS
NODE_ENV=production

# Monitoring
NEXT_PUBLIC_SENTRY_DSN=https://abc123@o123456.ingest.sentry.io/7654321
SENTRY_ORG=elite-saas
SENTRY_PROJECT=frontend
NEXT_PUBLIC_POSTHOG_KEY=phc_abc123def456
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com

# Features
NEXT_PUBLIC_ENABLE_AI_CHAT=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_2FA=true
```

---

## Usage in Code

### Client Components

```typescript
'use client'

// ✅ Good: Use NEXT_PUBLIC_ prefix
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const appName = process.env.NEXT_PUBLIC_APP_NAME;

export function Header() {
  return <h1>{appName}</h1>;
}
```

### Server Components

```typescript
// ✅ Good: Can access both public and private vars
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const secretKey = process.env.SECRET_KEY; // Server-only

export default async function Page() {
  const data = await fetch(apiUrl);
  return <div>{/* ... */}</div>;
}
```

### API Routes

```typescript
// app/api/example/route.ts
export async function GET() {
  // ✅ Good: Server-side only
  const secretKey = process.env.SECRET_KEY;
  
  return Response.json({ data: '...' });
}
```

---

## Type Safety

Create a typed config file:

```typescript
// lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  // Public (client-side)
  NEXT_PUBLIC_API_URL: z.string().url(),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_APP_NAME: z.string(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  
  // Private (server-side)
  NODE_ENV: z.enum(['development', 'production', 'test']),
});

export const env = envSchema.parse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
  NODE_ENV: process.env.NODE_ENV,
});

// Usage
import { env } from '@/lib/env';

const apiUrl = env.NEXT_PUBLIC_API_URL; // Type-safe!
```

---

## Security Best Practices

### 1. Never Commit .env Files

```bash
# .gitignore
.env
.env.local
.env.*.local
.env.production
```

### 2. Use .env.example as Template

```bash
# .env.example
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Elite SaaS
NEXT_PUBLIC_SENTRY_DSN=
NEXT_PUBLIC_POSTHOG_KEY=
```

### 3. Don't Expose Secrets to Client

```bash
# ❌ Bad: Exposing secret to client
NEXT_PUBLIC_SECRET_KEY=abc123

# ✅ Good: Keep secret server-side only
SECRET_KEY=abc123
```

### 4. Validate Environment Variables

```typescript
// Fail fast on startup if required vars are missing
if (!process.env.NEXT_PUBLIC_API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL is required');
}
```

### 5. Use Different Values Per Environment

```bash
# Development
NEXT_PUBLIC_API_URL=http://localhost:4000/api

# Staging
NEXT_PUBLIC_API_URL=https://api-staging.yourdomain.com/api

# Production
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
```

---

## Vercel Deployment

### Environment Variables in Vercel

1. Go to Project Settings → Environment Variables
2. Add variables for each environment:
   - **Production** - Used for production deployments
   - **Preview** - Used for preview deployments (PRs)
   - **Development** - Used for local development

### Automatic Environment Detection

Vercel automatically sets:
```bash
VERCEL=1
VERCEL_ENV=production|preview|development
VERCEL_URL=your-project.vercel.app
```

---

## Troubleshooting

### Variable Not Updating

**Problem:** Changed env var but not reflecting in app

**Solution:**
1. Restart dev server: `npm run dev`
2. Clear Next.js cache: `rm -rf .next`
3. Rebuild: `npm run build`

### Variable Undefined in Browser

**Problem:** `process.env.MY_VAR` is undefined in client component

**Solution:**
- Add `NEXT_PUBLIC_` prefix: `NEXT_PUBLIC_MY_VAR`
- Restart dev server

### CORS Issues

**Problem:** API requests blocked by CORS

**Solution:**
- Check `NEXT_PUBLIC_API_URL` is correct
- Ensure backend allows your frontend origin
- Check backend CORS configuration

---

## Environment-Specific Configurations

### Development

```bash
# Fast refresh, verbose logging
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

### Staging

```bash
# Production-like, with debugging
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api-staging.yourdomain.com/api
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_SENTRY_DSN=https://...
```

### Production

```bash
# Optimized, monitoring enabled
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_SENTRY_DSN=https://...
NEXT_PUBLIC_POSTHOG_KEY=phc_...
```

---

## Feature Flags

Use environment variables for feature flags:

```typescript
// lib/features.ts
export const features = {
  aiChat: process.env.NEXT_PUBLIC_ENABLE_AI_CHAT === 'true',
  analytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  twoFactor: process.env.NEXT_PUBLIC_ENABLE_2FA === 'true',
};

// Usage
import { features } from '@/lib/features';

export function Header() {
  return (
    <div>
      {features.aiChat && <AIChatButton />}
    </div>
  );
}
```

---

## Related Documentation

- [Project Structure](./PROJECT_STRUCTURE.md)
- [Tech Stack](./TECH_STACK.md)
- [UI Conventions](./UI_CONVENTIONS.md)
- [Coding Standards](./CODING_STANDARDS.md)
- [State Management](./STATE_MANAGEMENT.md)
