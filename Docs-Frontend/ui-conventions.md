# UI Conventions

**Brand:** L'essence Haute Parfumerie
**Theme:** "Liquid Glass" — Luxury, minimal, ethereal

## Colors

| Token | Hex | Usage |
|---|---|---|
| `primary` | `#D4A5A5` | Buttons, links, active |
| `accent` | `#E7B8B8` | Hover, secondary |
| `background` | `#FFF5F5` | Page bg, cards |
| `content` | `#7A5C5C` | Body text, headings |
| `contrast` | `#C08497` | Badges, tags, highlights |

## Typography

- Font: **Inter** (sans-serif)
- Sizes: `xs` (12px) → `4xl` (36px)

## Spacing & Layout

- Base unit: **4px**
- Max container: **1440px**

## Border Radius

| Token | Value | Applied to |
|---|---|---|
| `rounded-2xl` | 16px | Cards |
| `rounded-full` | 9999px | Buttons, badges |
| `rounded-xl` | 12px | Inputs |

## Component Patterns

- **Button**: `rounded-full uppercase tracking-wider bg-primary`
- **Card**: `aspect-square overflow-hidden rounded-2xl hover:scale-105`
- **Input**: `rounded-xl border focus:ring-2`
- **Badge**: `rounded-full text-xs bg-background`
- **Modal**: `fixed inset-0 bg-black/30 backdrop-blur rounded-2xl bg-white`

## Animations

- **FadeIn wrapper** — Framer Motion: `opacity 0→1`, `y 20→0`, `whileInView`

## Responsive

- Tailwind breakpoints: `sm` / `md` / `lg` / `xl` / `2xl`

## Images

- Format: **WebP** from R2
- Aspect ratios: 1:1 (products), 3:4 (gallery), 16:9 (banners)
- Max width: 1920px
- Loading: lazy
