# Coding Standards - Elite SaaS Frontend

## General Principles

1. **Type Safety First** - Full TypeScript strict mode
2. **Component Composition** - Small, reusable components
3. **Server Components Default** - Use Client Components only when needed
4. **Accessibility** - WCAG 2.1 AA compliance
5. **Performance** - Code splitting, lazy loading, memoization
6. **Clean Code** - Self-documenting, consistent naming
7. **Testing** - Unit tests for logic, E2E for critical flows

## TypeScript Standards

### Strict Mode Configuration

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true
  }
}
```

### Type Definitions

**DO:**
```typescript
// Explicit types for props
interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

// Type for component
export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  // ...
}

// Const assertions for constants
const ROUTES = {
  HOME: '/',
  PRODUCTS: '/products',
  CART: '/cart'
} as const;

type Route = typeof ROUTES[keyof typeof ROUTES];
```

**DON'T:**
```typescript
// ❌ Implicit any
function handleClick(e) {
  console.log(e.target.value);
}

// ❌ Using any
function processData(data: any) {
  return data.value;
}

// ❌ Non-null assertion without check
const user = users.find(u => u.id === id)!;
```

### Null Safety

```typescript
// DO: Check for null/undefined
const user = await fetchUser(id);
if (!user) {
  return <NotFound />;
}
return <UserProfile user={user} />;

// DO: Use optional chaining
const email = user?.profile?.email;

// DO: Use nullish coalescing
const limit = query.limit ?? 20;

// DON'T: Assume values exist
const email = user.profile.email; // ❌ Can crash
```

---

## Component Standards

### Server Components (Default)

```typescript
// ✅ Good: Server Component (no 'use client')
export default async function ProductsPage() {
  const products = await fetchProducts();
  
  return (
    <div className="container">
      <h1>Products</h1>
      <ProductList products={products} />
    </div>
  );
}
```

**When to use:**
- Fetching data
- Accessing backend resources
- Keeping sensitive information on server
- Reducing client-side JavaScript

### Client Components

```typescript
// ✅ Good: Client Component (with 'use client')
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function AddToCartButton({ product }: Props) {
  const [isAdding, setIsAdding] = useState(false);
  
  const handleClick = async () => {
    setIsAdding(true);
    await addToCart(product);
    setIsAdding(false);
  };
  
  return (
    <Button onClick={handleClick} disabled={isAdding}>
      {isAdding ? 'Adding...' : 'Add to Cart'}
    </Button>
  );
}
```

**When to use:**
- Event handlers (onClick, onChange)
- Hooks (useState, useEffect)
- Browser APIs (localStorage, window)
- Interactive components

### Component Structure

```typescript
// ✅ Good: Well-structured component
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { Product } from '@/types/product.types'

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  // 1. Hooks
  const [isLiked, setIsLiked] = useState(false);
  
  // 2. Event handlers
  const handleLike = () => {
    setIsLiked(!isLiked);
  };
  
  const handleAddToCart = () => {
    onAddToCart(product);
  };
  
  // 3. Render
  return (
    <Card>
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p>${product.price}</p>
      <div className="flex gap-2">
        <Button onClick={handleLike}>
          {isLiked ? 'Unlike' : 'Like'}
        </Button>
        <Button onClick={handleAddToCart}>
          Add to Cart
        </Button>
      </div>
    </Card>
  );
}
```

---

## Hooks Standards

### Custom Hooks

```typescript
// ✅ Good: Reusable custom hook
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
      setIsLoading(false);
    });
    
    return unsubscribe;
  }, []);
  
  const login = async (email: string, password: string) => {
    const user = await authService.login(email, password);
    setUser(user);
  };
  
  const logout = async () => {
    await authService.logout();
    setUser(null);
  };
  
  return { user, isLoading, login, logout };
}
```

### Hook Rules

1. **Only call hooks at top level** - Not inside loops, conditions, or nested functions
2. **Only call hooks from React functions** - Components or custom hooks
3. **Name custom hooks with `use` prefix** - `useAuth`, `useCart`, `useToast`

---

## State Management

### Zustand Store

```typescript
// ✅ Good: Type-safe Zustand store
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartState {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  total: number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (product) => set((state) => ({
        items: [...state.items, { ...product, quantity: 1 }]
      })),
      
      removeItem: (productId) => set((state) => ({
        items: state.items.filter(item => item.id !== productId)
      })),
      
      clearCart: () => set({ items: [] }),
      
      get total() {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      }
    }),
    {
      name: 'cart-storage'
    }
  )
);
```

### TanStack Query

```typescript
// ✅ Good: Type-safe query
export function useProducts(filters: ProductFilters) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => productService.getProducts(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Usage
function ProductsPage() {
  const { data: products, isLoading, error } = useProducts({ category: 'electronics' });
  
  if (isLoading) return <Skeleton />;
  if (error) return <Error message={error.message} />;
  
  return <ProductList products={products} />;
}
```

---

## Form Handling

### React Hook Form + Zod

```typescript
// ✅ Good: Type-safe form with validation
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });
  
  const onSubmit = async (data: LoginFormData) => {
    await authService.login(data.email, data.password);
  };
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Input {...form.register('email')} />
      {form.formState.errors.email && (
        <p className="text-destructive">{form.formState.errors.email.message}</p>
      )}
      
      <Input type="password" {...form.register('password')} />
      {form.formState.errors.password && (
        <p className="text-destructive">{form.formState.errors.password.message}</p>
      )}
      
      <Button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? 'Logging in...' : 'Login'}
      </Button>
    </form>
  );
}
```

---

## API Communication

### Service Layer

```typescript
// ✅ Good: Type-safe API service
import axios from 'axios';
import type { Product, CreateProductDTO } from '@/types/product.types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const productService = {
  async getProducts(filters?: ProductFilters): Promise<Product[]> {
    const { data } = await api.get('/products', { params: filters });
    return data.data;
  },
  
  async getProduct(id: string): Promise<Product> {
    const { data } = await api.get(`/products/${id}`);
    return data.data;
  },
  
  async createProduct(product: CreateProductDTO): Promise<Product> {
    const { data } = await api.post('/products', product);
    return data.data;
  }
};
```

---

## Error Handling

### Error Boundaries

```typescript
// ✅ Good: Error boundary component
'use client'

import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 text-center">
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message}</p>
        </div>
      );
    }
    
    return this.props.children;
  }
}
```

---

## Performance Optimization

### Memoization

```typescript
// ✅ Good: Memoize expensive calculations
import { useMemo } from 'react';

function ProductList({ products, filters }: Props) {
  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.category === filters.category &&
      p.price >= filters.minPrice &&
      p.price <= filters.maxPrice
    );
  }, [products, filters]);
  
  return (
    <div>
      {filteredProducts.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

### Lazy Loading

```typescript
// ✅ Good: Lazy load heavy components
import { lazy, Suspense } from 'react';

const HeavyChart = lazy(() => import('./HeavyChart'));

function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <Suspense fallback={<Skeleton />}>
        <HeavyChart />
      </Suspense>
    </div>
  );
}
```

---

## Testing Standards

### Unit Tests

```typescript
// ✅ Good: Test component behavior
import { render, screen, fireEvent } from '@testing-library/react';
import { AddToCartButton } from './AddToCartButton';

describe('AddToCartButton', () => {
  it('should call onAddToCart when clicked', () => {
    const mockAddToCart = vi.fn();
    const product = { id: '1', name: 'Test Product', price: 100 };
    
    render(<AddToCartButton product={product} onAddToCart={mockAddToCart} />);
    
    const button = screen.getByRole('button', { name: /add to cart/i });
    fireEvent.click(button);
    
    expect(mockAddToCart).toHaveBeenCalledWith(product);
  });
  
  it('should show loading state when adding', async () => {
    const mockAddToCart = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(<AddToCartButton product={product} onAddToCart={mockAddToCart} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(button).toHaveTextContent('Adding...');
    expect(button).toBeDisabled();
  });
});
```

---

## File Naming Conventions

```
Components:     PascalCase      → ProductCard.tsx
Pages:          kebab-case      → product-detail/page.tsx
Hooks:          camelCase       → useAuth.ts
Services:       camelCase       → auth.service.ts
Types:          camelCase       → product.types.ts
Stores:         camelCase       → cart.store.ts
Utils:          camelCase       → format-price.ts
Constants:      UPPER_SNAKE     → API_ROUTES.ts
```

---

## Import Order

```typescript
// 1. External dependencies
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'

// 2. Internal modules (absolute imports)
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { productService } from '@/services/product.service'

// 3. Types
import type { Product } from '@/types/product.types'

// 4. Relative imports (co-located files)
import { ProductCard } from './ProductCard'

// 5. Styles
import './styles.css'
```

---

## Code Review Checklist

- [ ] TypeScript strict mode compliance
- [ ] Server Components used by default
- [ ] Client Components only when needed ('use client')
- [ ] Props properly typed
- [ ] Null checks before accessing properties
- [ ] Error boundaries for error handling
- [ ] Loading states for async operations
- [ ] Accessibility (ARIA labels, keyboard navigation)
- [ ] Responsive design (mobile-first)
- [ ] Performance (memoization, lazy loading)
- [ ] Tests for critical functionality
- [ ] No console.log in production code
- [ ] Proper error messages
- [ ] Consistent naming conventions

---

## Related Documentation

- [Project Structure](./PROJECT_STRUCTURE.md)
- [Tech Stack](./TECH_STACK.md)
- [UI Conventions](./UI_CONVENTIONS.md)
- [State Management](./STATE_MANAGEMENT.md)
- [Environment Variables](./ENV_VARIABLES.md)
