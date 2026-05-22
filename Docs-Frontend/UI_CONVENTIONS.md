# UI Conventions — L'essence Frontend (Elite SaaS)

## Brand Identity

**Brand:** L'essence Haute Parfumerie
**Theme:** "Liquid Glass" — Luxury, minimal, ethereal
**Vibe:** Pink/lavender pastels, glassmorphism, serif typography

---

## Design Tokens (Tailwind Config)

### Colors (L'essence Palette)

```javascript
// tailwind.config.js
colors: {
  primary:   '#D4A5A5',   // Dusty rose (chính)
  accent:    '#E7B8B8',   // Light pink (phụ)
  background:'#FFF5F5',   // Rose white (nền)
  content:   '#7A5C5C',   // Mahogany (chữ)
  contrast:  '#C08497',   // Mauve lavender (nhấn)
}
```

| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | `#D4A5A5` | Buttons, links, active states |
| `accent` | `#E7B8B8` | Hover states, secondary elements |
| `background` | `#FFF5F5` | Page backgrounds, cards |
| `content` | `#7A5C5C` | Body text, headings |
| `contrast` | `#C08497` | Badges, tags, highlights |

### Typography

```css
--font-inter: 'Inter', sans-serif    /* body text */
```

**Sizes:**
```
xs:   0.75rem  (12px)  — labels, badges
sm:   0.875rem (14px)  — body small
base: 1rem     (16px)  — body text
lg:   1.125rem (18px)  — card titles
xl:   1.25rem  (20px)  — section headers
2xl:  1.5rem   (24px)  — page titles
3xl:  1.875rem (30px)  — hero headings
4xl:  2.25rem  (36px)  — large display
```

### Spacing

```
Space scale: 4px base (p-1 = 4px, p-2 = 8px, p-4 = 16px, ...)
Max container: 1440px (mx-auto)
Page padding: px-4 sm:px-6 lg:px-8
```

### Border Radius

```css
rounded-2xl: 16px    /* Cards, containers */
rounded-full: 9999px /* Buttons, badges, avatars */
rounded-xl: 12px     /* Inputs, dropdowns */
```

### Shadows

```css
shadow-sm:   0 1px 3px rgba(0,0,0,0.06)
shadow-md:   0 4px 12px rgba(0,0,0,0.08)
shadow-lg:   0 8px 30px rgba(0,0,0,0.12)
```

---

## Component Patterns

### Button

```tsx
<button className="bg-primary text-white px-8 py-3 rounded-full text-sm uppercase tracking-wider hover:bg-accent transition-colors">
  Khám phá
</button>
```

- `rounded-full` (pill shape)
- `uppercase tracking-wider` cho text
- `hover:bg-accent` transition
- `bg-primary` cho CTA, `bg-white border border-content` cho secondary

### Card (Product)

```tsx
<div className="group cursor-pointer">
  <div className="relative aspect-square overflow-hidden rounded-2xl bg-background">
    <img src={url} alt={name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700" />
    {discount && (
      <span className="absolute top-3 left-3 bg-[#D4A5A5] text-white text-xs px-3 py-1 rounded-full">
        -{discount}%
      </span>
    )}
  </div>
  <p className="mt-3 text-xs text-content/60 uppercase tracking-wider">{brand}</p>
  <p className="text-sm font-medium mt-1">{name}</p>
  <p className="text-base font-semibold mt-1">{price.toLocaleString()}₫</p>
</div>
```

### Input

```tsx
<input className="w-full px-4 py-3 rounded-xl border border-[#E8D5C4] bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm" />
```

### Badge / Tag

```tsx
<span className="inline-block px-3 py-1 rounded-full text-xs bg-background text-content border border-[#E8D5C4]">
  Hương hoa
</span>
```

---

## Layout Patterns

### Homepage Sections

Mỗi section là một component riêng:

```
├─ Banner (hero banner carousel)
├─ BrandsMarquee (logo strip)
├─ SaleProducts (giảm giá)
├─ NewProducts (mới nhất)
├─ TrendingProducts (thịnh hành)
├─ BrandUSP (giá trị thương hiệu)
├─ LuxuryGallery (ảnh gallery + lightbox)
├─ BlogPosts (bài viết)
└─ NewsletterSubscription (đăng ký email)
```

### Admin Dashboard

```
├─ Sidebar (navigation menu)
├─ Header (breadcrumb + user info)
└─ Content area
    ├─ Brand CRUD (Table + FilterBar + Modals)
    ├─ Tag CRUD
    ├─ Taxonomy CRUD (Tabs: Segments/Scent/Concentration)
    ├─ Product CRUD (Table + FilterBar + Modals)
    ├─ User management (Table + Stats)
    └─ Homepage Config (Tabs: Banners/Card/Gallery/Layout)
```

---

## Admin Table Pattern

```tsx
'use client'

export function BrandTable() {
  const { brands, loading, selected, setSelected, deleteBrand } = useAdminBrands()

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <table className="w-full">
        <thead className="bg-background border-b border-[#E8D5C4]">
          <tr>
            <th className="text-left p-4 text-xs uppercase tracking-wider text-content/60">Tên</th>
            <th className="text-left p-4 text-xs uppercase tracking-wider text-content/60">Xuất xứ</th>
            <th className="text-left p-4 text-xs uppercase tracking-wider text-content/60">Trạng thái</th>
            <th className="text-right p-4 text-xs uppercase tracking-wider text-content/60">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {brands.map((brand) => (
            <tr key={brand._id} className="border-b border-[#F0E8E0] hover:bg-background/50">
              <td className="p-4 text-sm">{brand.name}</td>
              <td className="p-4 text-sm text-content/60">{brand.origin}</td>
              <td className="p-4">
                <span className={`px-3 py-1 rounded-full text-xs ${
                  brand.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {brand.status === 'active' ? 'Hoạt động' : 'Ẩn'}
                </span>
              </td>
              <td className="p-4 text-right">
                <button onClick={() => deleteBrand(brand._id)} className="text-red-400 hover:text-red-600 text-sm">Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

## Filter Bar Pattern

```tsx
export function ProductFilterBar() {
  return (
    <div className="flex flex-wrap gap-3 items-center mb-6">
      <SearchInput />
      <BrandDropdown />
      <TagPills tags={tags} />
      <StockSelect />
      <SortSelect />
    </div>
  )
}
```

---

## Modal Pattern

```tsx
// Xác nhận xóa
export function DeleteModal({ isOpen, onConfirm, onClose, title }: Props) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-lg">
        <h3 className="text-lg font-medium mb-2">Xác nhận xóa</h3>
        <p className="text-sm text-content/60 mb-6">Bạn có chắc muốn xóa "{title}"?</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-full border text-sm">Hủy</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-full bg-red-500 text-white text-sm">Xóa</button>
        </div>
      </div>
    </div>
  )
}
```

---

## Animation Patterns (Framer Motion)

### FadeIn Wrapper

```tsx
'use client'
import { motion } from 'framer-motion'

export function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
    >
      {children}
    </motion.div>
  )
}
```

### Micro-interactions

```css
/* Scale on hover (product card) */
.group:hover img { transform: scale(1.05); }

/* Smooth transitions */
.transition-all { transition: all 0.3s ease; }
```

---

## Responsive Breakpoints

```css
/* Tailwind defaults */
sm:  640px    /* Mobile landscape */
md:  768px    /* Tablet */
lg:  1024px   /* Desktop */
xl:  1280px   /* Wide */
2xl: 1536px   /* Ultra-wide */

/* Homepage responsive */
/* homepage-responsive.css chứa custom media queries */
```

---

## AI Chat Widget

```
Position: Fixed bottom-right
Trigger: Floating button with unread badge
Panel: 380px wide, 600px max-height
Style: White card with shadow, rounded-2xl
Header: "Tư vấn AI" + close button
Messages: User (right, primary bg) / AI (left, light bg)
Input: Text input + image attach + send button
Feedback: Star rating (1-5) after AI response
```

---

## Image Standards

- **Format:** WebP (CDN từ Cloudflare R2)
- **Aspect ratios:** 1:1 (product cards), 3:4 (gallery), 16:9 (banners)
- **Max width:** 1920px (desktop)
- **Lazy loading:** `loading="lazy"` for below-fold images
- **Next.js Image:** Cho phép domain `*.r2.dev` trong `next.config.ts`
