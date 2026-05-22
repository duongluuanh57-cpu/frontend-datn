# Environment Variables — L'essence Frontend

## Required Variables (`.env.local`)

```bash
# Backend API URL (bắt buộc)
NEXT_PUBLIC_API_URL=http://127.0.0.1:4000/api

# PostHog Analytics (tùy chọn, có fallback mặc định)
NEXT_PUBLIC_POSTHOG_KEY=phc_w3qWKPXDFk5e3ovbcwToEe2uFVYPmtQYnTNnDiHyMDNe
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

## Environment-Specific

### Development
```bash
NEXT_PUBLIC_API_URL=http://127.0.0.1:4000/api
NEXT_PUBLIC_POSTHOG_KEY=phc_xxx
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

### Production
```bash
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
NEXT_PUBLIC_POSTHOG_KEY=phc_prod_key
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# Sentry (optional, tự động từ sentry.client.config.ts)
NEXT_PUBLIC_SENTRY_DSN=https://dummy@sentry.io/123
```

## Variable Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | ✅ | `http://localhost:4000/api` | Backend API base URL |
| `NEXT_PUBLIC_POSTHOG_KEY` | ❌ | `phc_placeholder` | PostHog project API key |
| `NEXT_PUBLIC_POSTHOG_HOST` | ❌ | `https://us.i.posthog.com` | PostHog host URL |
| `NEXT_PUBLIC_SENTRY_DSN` | ❌ | `https://dummy@sentry.io/123` | Sentry DSN (production only) |

## Usage in Code

```typescript
// lib/api.ts — Backend URL for Axios
const apiBase = process.env.NEXT_PUBLIC_API_URL?.trim() || 'http://localhost:4000/api'

// providers/posthog-provider.tsx — Analytics
posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, { ... })

// app/api/chat/route.ts — Edge proxy
const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000/api'
```

## Security Best Practices

1. **Never commit `.env.local`** — Đã có trong `.gitignore`
2. **Use `NEXT_PUBLIC_` prefix** — Cho biến client-side (server-side biến không cần prefix)
3. **Separate keys per environment** — Dev keys ≠ Prod keys
