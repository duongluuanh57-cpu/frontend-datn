# State Management - Elite SaaS Frontend

## Overview

Chúng ta sử dụng **hybrid approach** cho state management:
- **Zustand** - Client-side global state (auth, cart, UI)
- **TanStack Query** - Server state (API data, caching)
- **React Context** - Theme, i18n, providers
- **URL State** - Filters, pagination, search

## Zustand - Global Client State

### Why Zustand?

- ✅ **Simple API** - No boilerplate, easy to learn
- ✅ **TypeScript-first** - Excellent type inference
- ✅ **Small bundle** - Only 1KB gzipped
- ✅ **DevTools** - Redux DevTools integration
- ✅ **Middleware** - Persist, immer, devtools

### Store Structure

```typescript
// store/auth.store.ts
import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
}

interface AuthState {
  // State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        user: null,
        token: null,
        isAuthenticated: false,
        
        // Actions
        login: async (email, password) => {
          const { user, token } = await authService.login(email, password);
          set({ user, token, isAuthenticated: true });
        },
        
        logout: () => {
          set({ user: null, token: null, isAuthenticated: false });
          localStorage.removeItem('token');
        },
        
        setUser: (user) => set({ user }),
        
        setToken: (token) => set({ token })
      }),
      {
        name: 'auth-storage', // localStorage key
        partialize: (state) => ({ 
          token: state.token,
          user: state.user 
        }) // Only persist token and user
      }
    ),
    { name: 'AuthStore' } // DevTools name
  )
);
```

### Usage in Components

```typescript
'use client'

import { useAuthStore } from '@/store/auth.store';

export function UserProfile() {
  // Select specific state (prevents unnecessary re-renders)
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  
  if (!user) return <LoginButton />;
  
  return (
    <div>
      <p>Welcome, {user.name}</p>
      <Button onClick={logout}>Logout</Button>
    </div>
  );
}
```

### Cart Store Example

```typescript
// store/cart.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product) => {
        const items = get().items;
        const existingItem = items.find(item => item.id === product.id);
        
        if (existingItem) {
          set({
            items: items.map(item =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          });
        } else {
          set({
            items: [...items, { ...product, quantity: 1 }]
          });
        }
      },
      
      removeItem: (productId) => {
        set({
          items: get().items.filter(item => item.id !== productId)
        });
      },
      
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        
        set({
          items: get().items.map(item =>
            item.id === productId ? { ...item, quantity } : item
          )
        });
      },
      
      clearCart: () => set({ items: [] }),
      
      get total() {
        return get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
      },
      
      get itemCount() {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      }
    }),
    {
      name: 'cart-storage'
    }
  )
);
```

### UI Store Example

```typescript
// store/ui.store.ts
import { create } from 'zustand';

interface UIState {
  isSidebarOpen: boolean;
  isCartOpen: boolean;
  theme: 'light' | 'dark';
  toggleSidebar: () => void;
  toggleCart: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: false,
  isCartOpen: false,
  theme: 'light',
  
  toggleSidebar: () => set((state) => ({ 
    isSidebarOpen: !state.isSidebarOpen 
  })),
  
  toggleCart: () => set((state) => ({ 
    isCartOpen: !state.isCartOpen 
  })),
  
  setTheme: (theme) => set({ theme })
}));
```

---

## TanStack Query - Server State

### Why TanStack Query?

- ✅ **Automatic caching** - Smart cache management
- ✅ **Background refetching** - Keep data fresh
- ✅ **Optimistic updates** - Instant UI feedback
- ✅ **Pagination & infinite scroll** - Built-in support
- ✅ **DevTools** - Inspect queries and mutations

### Setup

```typescript
// providers/query-provider.tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        refetchOnWindowFocus: false,
      },
    },
  }));
  
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### Query Hooks

```typescript
// hooks/use-products.ts
import { useQuery } from '@tanstack/react-query';
import { productService } from '@/services/product.service';

export function useProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => productService.getProducts(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getProduct(id),
    enabled: !!id, // Only run if id exists
  });
}
```

### Mutation Hooks

```typescript
// hooks/use-create-product.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '@/services/product.service';
import { toast } from 'sonner';

export function useCreateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: productService.createProduct,
    
    onSuccess: (newProduct) => {
      // Invalidate and refetch products list
      queryClient.invalidateQueries({ queryKey: ['products'] });
      
      // Optimistically update cache
      queryClient.setQueryData(['product', newProduct.id], newProduct);
      
      toast.success('Product created successfully');
    },
    
    onError: (error) => {
      toast.error('Failed to create product');
      console.error(error);
    }
  });
}
```

### Usage in Components

```typescript
'use client'

import { useProducts } from '@/hooks/use-products';
import { useCreateProduct } from '@/hooks/use-create-product';

export function ProductsPage() {
  const { data: products, isLoading, error } = useProducts({ 
    category: 'electronics' 
  });
  
  const createProduct = useCreateProduct();
  
  const handleCreate = async (data: CreateProductDTO) => {
    await createProduct.mutateAsync(data);
  };
  
  if (isLoading) return <Skeleton />;
  if (error) return <Error message={error.message} />;
  
  return (
    <div>
      <ProductList products={products} />
      <CreateProductForm onSubmit={handleCreate} />
    </div>
  );
}
```

### Optimistic Updates

```typescript
export function useUpdateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: productService.updateProduct,
    
    onMutate: async (updatedProduct) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['product', updatedProduct.id] });
      
      // Snapshot previous value
      const previousProduct = queryClient.getQueryData(['product', updatedProduct.id]);
      
      // Optimistically update cache
      queryClient.setQueryData(['product', updatedProduct.id], updatedProduct);
      
      // Return context with snapshot
      return { previousProduct };
    },
    
    onError: (err, updatedProduct, context) => {
      // Rollback on error
      queryClient.setQueryData(
        ['product', updatedProduct.id],
        context?.previousProduct
      );
    },
    
    onSettled: (updatedProduct) => {
      // Refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['product', updatedProduct?.id] });
    }
  });
}
```

### Pagination

```typescript
export function useProductsPaginated(page: number, limit: number) {
  return useQuery({
    queryKey: ['products', 'paginated', page, limit],
    queryFn: () => productService.getProducts({ page, limit }),
    keepPreviousData: true, // Keep old data while fetching new
  });
}

// Usage
function ProductsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isPreviousData } = useProductsPaginated(page, 20);
  
  return (
    <div>
      <ProductList products={data?.products} />
      <Pagination
        page={page}
        totalPages={data?.totalPages}
        onPageChange={setPage}
        disabled={isPreviousData}
      />
    </div>
  );
}
```

### Infinite Scroll

```typescript
export function useProductsInfinite() {
  return useInfiniteQuery({
    queryKey: ['products', 'infinite'],
    queryFn: ({ pageParam = 1 }) => 
      productService.getProducts({ page: pageParam, limit: 20 }),
    getNextPageParam: (lastPage, pages) => 
      lastPage.hasMore ? pages.length + 1 : undefined,
  });
}

// Usage
function ProductsInfiniteList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useProductsInfinite();
  
  return (
    <div>
      {data?.pages.map((page) => (
        page.products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))
      ))}
      
      {hasNextPage && (
        <Button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? 'Loading...' : 'Load More'}
        </Button>
      )}
    </div>
  );
}
```

---

## URL State

### Search Params

```typescript
'use client'

import { useSearchParams, useRouter } from 'next/navigation';

export function ProductFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const category = searchParams.get('category') || 'all';
  const sort = searchParams.get('sort') || 'newest';
  
  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set(key, value);
    router.push(`?${params.toString()}`);
  };
  
  return (
    <div>
      <Select value={category} onValueChange={(v) => updateFilter('category', v)}>
        <option value="all">All</option>
        <option value="electronics">Electronics</option>
      </Select>
      
      <Select value={sort} onValueChange={(v) => updateFilter('sort', v)}>
        <option value="newest">Newest</option>
        <option value="price-asc">Price: Low to High</option>
      </Select>
    </div>
  );
}
```

---

## Best Practices

### 1. Choose the Right Tool

| State Type | Tool | Example |
|------------|------|---------|
| Client global state | Zustand | Auth, cart, UI preferences |
| Server state | TanStack Query | API data, products, orders |
| Form state | React Hook Form | Login, checkout forms |
| URL state | Search params | Filters, pagination, search |
| Component state | useState | Toggle, input value |

### 2. Avoid Prop Drilling

```typescript
// ❌ Bad: Prop drilling
<Parent user={user}>
  <Child user={user}>
    <GrandChild user={user} />
  </Child>
</Parent>

// ✅ Good: Use Zustand
function GrandChild() {
  const user = useAuthStore((state) => state.user);
  return <div>{user.name}</div>;
}
```

### 3. Selective Subscriptions

```typescript
// ❌ Bad: Subscribe to entire store
const { user, token, isAuthenticated } = useAuthStore();

// ✅ Good: Subscribe only to what you need
const user = useAuthStore((state) => state.user);
```

### 4. Derived State

```typescript
// ✅ Good: Compute derived state in store
export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  
  get total() {
    return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  },
  
  get itemCount() {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  }
}));
```

### 5. Persist Sensitive Data Carefully

```typescript
// ✅ Good: Only persist non-sensitive data
persist(
  (set, get) => ({ /* ... */ }),
  {
    name: 'auth-storage',
    partialize: (state) => ({ 
      token: state.token, // OK to persist
      // Don't persist: password, credit card, etc.
    })
  }
)
```

---

## Related Documentation

- [Project Structure](./PROJECT_STRUCTURE.md)
- [Tech Stack](./TECH_STACK.md)
- [UI Conventions](./UI_CONVENTIONS.md)
- [Coding Standards](./CODING_STANDARDS.md)
- [Environment Variables](./ENV_VARIABLES.md)
