# Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | No | Dynamic | Fallback backend URL (runtime via backendDiscovery) |
| `NEXT_PUBLIC_POSTHOG_KEY` | No | `phc_placeholder` | PostHog API key |
| `NEXT_PUBLIC_POSTHOG_HOST` | No | `https://us.i.posthog.com` | PostHog host |
| `NEXT_PUBLIC_SENTRY_DSN` | No | `dummy` | Sentry DSN |

## Notes

- `NEXT_PUBLIC_API_URL` is a **static fallback only**.
- Runtime uses `backendDiscovery.ts` — pings localhost + Render, caches result for 30s.
- Never commit `.env.local`.
- All client-exposed vars must use `NEXT_PUBLIC_` prefix.
