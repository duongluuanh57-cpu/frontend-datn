# Component Architecture — L'essence Frontend

## Component Tree (Tổng quan)

```
RootLayout ([locale]/layout.tsx)
├── PHProvider (PostHog)
├── QueryProvider (TanStack Query)
├── NextIntlClientProvider (i18n)
├── VisitTracker
├── NavigationWrapper
│   ├── Toaster (Sonner notifications)
│   ├── BackendWarmup (ping backend)
│   └── Page Content
│       │
│       ├── Homepage (/)
│       │   ├── Topbar (promo bar)
│       │   ├── Navbar (main navigation)
│       │   ├── Banner (hero carousel)
│       │   ├── BrandsMarquee
│       │   ├── SaleProducts / NewProducts / TrendingProducts
│       │   │   └── ProductCard (reused)
│       │   ├── BrandUSP
│       │   ├── LuxuryGallery
│       │   ├── BlogPosts
│       │   ├── NewsletterSubscription
│       │   ├── Footer
│       │   └── ChatWidget (floating)
│       │
│       ├── Admin (/admin)
│       │   ├── Sidebar + Header
│       │   ├── Brands Module
│       │   │   ├── BrandTable
│       │   │   ├── BrandFilterBar
│       │   │   ├── BrandHeader
│       │   │   ├── BrandPagination
│       │   │   ├── BrandModals (delete)
│       │   │   └── BrandBulkActionBar
│       │   ├── Tags Module
│       │   │   ├── TagTable
│       │   │   └── TagHeader
│       │   ├── Taxonomy Module
│       │   │   ├── TaxonomyTabs (Segments/Scent/Concentration)
│       │   │   ├── TaxonomyTable
│       │   │   ├── TaxonomyHeader
│       │   │   └── TaxonomyModal
│       │   ├── Products Module
│       │   │   ├── ProductTable
│       │   │   ├── ProductFilterBar → BrandDropdown/TagPills/StockSelect/SearchAndSort
│       │   │   ├── ProductHeader
│       │   │   ├── ProductPagination
│       │   │   ├── ProductModals (SingleDeleteModal, BulkDeleteModal)
│       │   │   ├── ProductForm (create/edit)
│       │   │   │   ├── ProductDetailsSection
│       │   │   │   ├── ProductMediaSection
│       │   │   │   ├── ProductSEOSection
│       │   │   │   ├── ProductFormToolbar
│       │   │   │   ├── ProductFormModals
│       │   │   │   └── useProductForm (logic hook)
│       │   │   ├── ImageUpload
│       │   │   └── MultipleImageUpload
│       │   ├── Users Module
│       │   │   ├── UserTable
│       │   │   ├── UserFilterBar
│       │   │   ├── UserHeader
│       │   │   ├── UserStats (dashboard stats)
│       │   │   └── UserModals
│       │   └── Homepage Config Module
│       │       ├── HomepageHeader
│       │       ├── HomepageBannersTab
│       │       ├── HomepageCardTab
│       │       ├── HomepageGalleryTab
│       │       └── HomepageLayoutTab
│       │
│       ├── Login (/login)
│       │   └── LoginForm + LoginIdentity
│       │
│       ├── Register (/register)
│       │   └── RegisterForm + RegisterBenefits + SocialRegister
│       │
│       ├── Profile (/profile)
│       │   ├── ProfileSidebar
│       │   ├── ProfileTab
│       │   ├── OrdersTab + OrderDetailModal
│       │   ├── SecurityTab
│       │   └── SettingsTab
│       │
│       └── Help (/tro-giup)
```

---

## Admin Module Architecture (CRUD Pattern)

Mỗi module trong admin đều theo cùng 1 pattern:

```
Page (Server Component)
  └── Header (title + create button)
  └── FilterBar (search, dropdowns, filters)
  └── Table (data list + select)
  └── Pagination (page navigation)
  └── Modals (delete confirmation, bulk actions)
  └── Hook (state + API logic)
```

### Data Flow

```
AdminBrands Page
    │
    ▼
useAdminBrands hook
    ├─ State: brands[], loading, selected[]
    ├─ Actions: fetchBrands(), createBrand(), updateBrand(), deleteBrand()
    ├─ Gọi api.get/post/patch/delete tới backend
    └─ Trả về { brands, loading, ... }

    │
    ▼
BrandTable → nhận brands[], gọi onDelete
BrandModals → nhận isOpen, onConfirm
BrandFilterBar → search/filter cập nhật params
```

### Ví dụ: Hook implementation

```typescript
// hooks/useAdminBrands.ts
export function useAdminBrands() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)

  const fetchBrands = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/brands')
      setBrands(res.data.data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchBrands() }, [fetchBrands])

  const deleteBrand = useCallback(async (id: string) => {
    await api.delete(`/brands/${id}`)
    await fetchBrands()
  }, [fetchBrands])

  return { brands, loading, fetchBrands, deleteBrand }
}
```

---

## Product Form Architecture

Form sản phẩm phức tạp nhất, chia làm 4 sections:

```
ProductForm (Client Component)
├── useProductForm (logic hook)
│   ├── State: form data, images, variants, tags, taxonomy, SEO
│   ├── Handlers: onChange, onImageAdd, onVariantAdd
│   └── Submit: tạo/cập nhật product + relations
│
├── ProductFormToolbar (top actions)
│   ├── Back button
│   ├── Save Draft / Publish buttons
│   └── AI Generate buttons
│
├── ProductDetailsSection
│   ├── Name, Description (text inputs)
│   ├── Brand (dropdown)
│   ├── Gender (radio: Male/Female/Unisex)
│   └── Variants (size + price + stock rows)
│
├── ProductMediaSection
│   ├── ImageUpload (single)
│   ├── MultipleImageUpload (drag & drop)
│   └── Image gallery preview
│
├── ProductSEOSection
│   ├── Meta title, description
│   ├── Slug
│   └── Keywords (tag input)
│
└── ProductFormModals
    ├── AI generation preview
    └── Confirmation dialogs
```

---

## Homepage Architecture

### Server-Side Section Rendering

Trang chủ render các section động dựa trên config từ backend:

```
Homepage Page (Server Component)
  │
  ▼
HomepageDynamicRenderer
  ├─ Fetch homepage config từ backend
  ├─ Map sections theo order + enabled
  └─ Render từng section:
      ├─ banner → Banner component
      ├─ brandsMarquee → BrandsMarquee
      ├─ saleProducts → SaleProducts
      ├─ newProducts → NewProducts
      ├─ trendingProducts → TrendingProducts
      ├─ brandUsp → BrandUSP
      ├─ luxuryGallery → LuxuryGallery
      └─ blogPosts → BlogPosts
```

### Dynamic Sections

Mỗi section component có thể:

```typescript
// Config mẫu từ backend
sections: [
  { id: 'banner', enabled: true, order: 0 },
  { id: 'newProducts', enabled: true, order: 3 },
  { id: 'luxuryGallery', enabled: false, order: 6 },
]
```

---

## Chat Widget Architecture

### Flow

```
ChatWidget (floating button)
    │ click
    ▼
ChatWidget Panel (slide up)
    ├── ChatWidgetHeader (title + close)
    ├── ChatWidgetMessageList (messages + loading)
    ├── ChatProductCard (product suggestions)
    ├── ChatWidgetInputArea (text + image + send)
    └── ChatFeedback (rating 1-5)
    │
    ▼
useChatWidget (logic hook)
    ├─ Gửi message → fetch('/api/chat', POST)
    ├─ Stream response → updateLastMessage()
    ├─ Thêm rating → POST /api/ai/feedback
    └─ Save to useChatStore
    │
    ▼
/api/chat (Edge Route)
    └─ Proxy → Backend /api/ai/chat (streaming)
```

### Key Components

| Component | Responsibility |
|-----------|---------------|
| `chat-widget.tsx` | Floating button + panel container |
| `ChatWidgetHeader.tsx` | Title bar with close/minimize |
| `ChatWidgetMessageList.tsx` | Scrollable message list + typing indicator |
| `ChatProductCard.tsx` | Product recommendation cards |
| `ChatWidgetInputArea.tsx` | Text input, image attach, send button |
| `chat-feedback.tsx` | Star rating + feedback form |
| `useChatWidget.ts` | State management + API calls + streaming |
| `useChatStore` | Zustand: messages, session, isOpen |

---

## Key Hooks Reference

| Hook | Module | API Endpoints |
|------|--------|---------------|
| `useLogin` | Auth | `POST /auth/login` |
| `useRegister` | Auth | `POST /auth/register` |
| `useUserProfile` | Profile | `GET /auth/me`, `PATCH /auth/update-profile`, `POST /auth/change-password` |
| `useAdminBrands` | Brands | `GET/POST/PATCH/DELETE /brands` |
| `useAdminTags` | Tags | `GET/POST/PATCH/DELETE /tags` |
| `useAdminTaxonomy` | Taxonomy | `GET/POST/PATCH/DELETE /taxonomies` |
| `useAdminUsers` | Users | `GET/PATCH/DELETE /users`, `PATCH /users/:id/role` |
| `useAdminHomepage` | Homepage | `GET/PUT /homepage-config` |
| `useProductCatalog` | Products | `GET /products/new`, `/limited`, `/trending`, `/sale` |
| `useHomepageConfig` | Homepage | `GET /homepage-config` |
| `useHomepageTags` | Homepage | `GET /tags` |
| `useHomepageTaxonomies` | Homepage | `GET /taxonomies/active?type=...` |
| `useChatWidget` | Chat | `POST /api/ai/chat` (via proxy) |

---

## Testing

### Unit Tests (Vitest)

```typescript
// lib/api.test.ts — Test API layer
import { resolveImageUrl, getBackendOrigin } from './api'

describe('resolveImageUrl', () => {
  it('should return URL as-is for absolute HTTP URLs', () => {
    expect(resolveImageUrl('https://cdn.example.com/img.webp')).toBe('https://cdn.example.com/img.webp')
  })
  it('should prepend backend origin for relative paths', () => {
    expect(resolveImageUrl('/uploads/test.jpg')).toContain('/uploads/test.jpg')
  })
})
```

### E2E Tests (Playwright)

```typescript
// e2e/smoke.spec.ts — Homepage load + locale switch
test('homepage loads with banner', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('h1')).toBeVisible()
})

// e2e/chat-widget.spec.ts — Chat flow
test('chat widget opens and sends message', async ({ page }) => {
  await page.click('[data-testid="chat-trigger"]')
  await expect(page.locator('[data-testid="chat-panel"]')).toBeVisible()
})
```
