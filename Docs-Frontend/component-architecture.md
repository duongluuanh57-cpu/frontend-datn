# Component Architecture

## Component Tree (simplified)

```
RootLayout
└── PHProvider
    └── QueryProvider
        └── NextIntlClientProvider
            └── NavigationWrapper
                └── Page Content

├── Homepage
│   ├── Topbar
│   ├── Navbar
│   ├── Banner
│   ├── BrandsMarquee
│   ├── ProductSections (Sale / New / Trending)
│   ├── BrandUSP
│   ├── LuxuryGallery
│   ├── BlogPosts
│   ├── Newsletter
│   ├── Footer
│   └── ChatWidget
│
├── Admin (Sidebar + Header → Dynamic Module)
│   ├── Dashboard
│   ├── Brands
│   ├── Categories
│   ├── Tags
│   ├── Taxonomy
│   ├── Products
│   ├── Orders
│   ├── Vouchers
│   ├── Users
│   └── Homepage
│
├── Blog
│   ├── BlogList
│   └── BlogDetail
│
├── Product
│   └── ProductDetail
│
├── Login
│   └── LoginForm + LoginIdentity
│
├── Register
│   └── RegisterForm + Benefits + SocialRegister
│
├── Profile
│   ├── ProfileSidebar
│   ├── ProfileTab
│   ├── OrdersTab
│   ├── SecurityTab
│   └── SettingsTab
│
└── Help
```

## Admin CRUD Pattern (per module)

```
Page
├── Header (title + Add button)
├── FilterBar (search, status, sort)
├── Table (columns, rows, actions)
├── Pagination
├── Modals (Create / Edit / Delete confirm)
└── Hook (e.g. useAdminBrands → fetches + mutations)
```

## Key Hooks

| Hook | Endpoint | Purpose |
|---|---|---|
| `useLogin` | `POST /auth/login` | Authenticate user |
| `useRegister` | `POST /auth/register` | Create account |
| `useUserProfile` | `GET /users/profile` | Fetch current user |
| `useAdminBrands` | `GET/POST/PUT/DELETE /admin/brands` | CRUD brands |
| `useAdminCategories` | `GET/POST/PUT/DELETE /admin/categories` | CRUD categories |
| `useAdminProducts` | `GET/POST/PUT/DELETE /admin/products` | CRUD products |
| `useAdminOrders` | `GET /admin/orders`, `PUT /admin/orders/:id` | Manage orders |
| `useAdminUsers` | `GET /admin/users`, `PUT /admin/users/:id` | Manage users |

## Testing

- **Unit:** Vitest — `lib/api.test.ts`
- **E2E:** Playwright — `e2e/smoke.spec.ts`
