# Coding Standards

## General Principles

- TypeScript **strict mode** — no `any`, no implicit `any`.
- **Server Components** by default; only use `'use client'` when interactivity is needed.
- Favor **composition** over inheritance or big components.
- **Memoization** (`React.memo`, `useMemo`, `useCallback`) where re-render cost is high.
- **Lazy loading** via `next/dynamic` for heavy modules.
- Every interactive element needs an **ARIA label** and **keyboard navigation**.
- Write clean code: small functions, descriptive names, no dead code.

## Data Flow

```
Hook → api.ts → Backend
```

- **No service layer.** Each custom hook owns its state + API calls directly.
- `api.ts` contains the raw fetch calls; hooks consume them and manage loading/error/data.

## Component Structure

- Prefer **small focused components** (single responsibility).
- Props typed with `interface ComponentNameProps`.
- Structure: **State → Handlers → Render** in that order.

```tsx
interface CardProps { title: string; onClick: () => void; }
export function Card({ title, onClick }: CardProps) {
  const [expanded, setExpanded] = useState(false);
  const handleClick = useCallback(() => { setExpanded(v => !v); onClick(); }, [onClick]);
  return <button aria-label={title} onClick={handleClick}>{title}</button>;
}
```

## Page Pattern

- **Page** = Server Component (fetch initial data).
- **Client children** = leaf components that need interactivity.
- Keep data fetching high; push event handlers low.

## Form Handling

- Use **React Hook Form** + **Zod resolver** (`@hookform/resolvers/zod`).
- Uncontrolled inputs — minimal re-renders during typing.
- Validation schema at the top of the file.

## Image Upload

```
uploadImageToR2 → sharp optimize → Cloudflare R2 → URL
```

- Client uploads → API route → `sharp` resizes/optimizes → stores in R2 → returns public URL.
- Accept only `image/webp`, `image/jpeg`, `image/png`.

## AI Chat Pattern

```ts
useChatWidget → fetch('/api/chat') → stream reader → updateLastMessage
```

- Hook manages message list, loading state, streaming append.
- Stream from Edge route, parse chunks, append to last message.

## File Naming

| Entity | Convention | Example |
|---|---|---|
| Pages | kebab-case | `product-detail/page.tsx` |
| Components | PascalCase | `ProductCard.tsx` |
| Hooks | camelCase (prefix `use`) | `useProductList.ts` |
| Stores | camelCase (suffix `Store`) | `useAuthStore.ts` |
| Tests | `*.test.ts` | `ProductCard.test.ts` |
| Styles | `*.css` | `product-card.css` |

## Import Order

1. External (react, next, zustand)
2. Internal `@/` aliases
3. Types
4. Relative imports

Group with a blank line between each.

## Performance

- `useCallback` for event handlers passed to children.
- `useMemo` for expensive computed values.
- **Zustand selective subscribe** — never re-render on unrelated slices.
- `next/image` for all user-facing images (lazy loading + WebP).

## Code Review Checklist

- [ ] TypeScript strict, no `any`
- [ ] Server/Client boundary correct
- [ ] Props typed with interface
- [ ] Null/undefined checks on API responses
- [ ] try/catch on all API calls
- [ ] Loading/skeleton states present
- [ ] 401 → token refresh or redirect
- [ ] Zustand selective subscribe used
- [ ] Responsive layout verified
- [ ] No `console.log` in production
- [ ] Display text uses i18n (`useTranslations`)
- [ ] R2 bucket domain listed in `next.config` `images.domains`
