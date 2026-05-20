# UI Conventions - Elite SaaS Frontend

## Design System

### Colors

**Brand Colors:**
```css
--primary: 222.2 47.4% 11.2%        /* Dark blue-gray */
--primary-foreground: 210 40% 98%   /* Light text */

--secondary: 210 40% 96.1%          /* Light gray */
--secondary-foreground: 222.2 47.4% 11.2%

--accent: 210 40% 96.1%
--accent-foreground: 222.2 47.4% 11.2%
```

**Semantic Colors:**
```css
--destructive: 0 84.2% 60.2%        /* Red for errors */
--success: 142 76% 36%              /* Green for success */
--warning: 38 92% 50%               /* Orange for warnings */
--info: 199 89% 48%                 /* Blue for info */
```

**Neutral Colors:**
```css
--background: 0 0% 100%             /* White */
--foreground: 222.2 84% 4.9%        /* Almost black */

--muted: 210 40% 96.1%              /* Light gray */
--muted-foreground: 215.4 16.3% 46.9%

--border: 214.3 31.8% 91.4%
--input: 214.3 31.8% 91.4%
--ring: 222.2 84% 4.9%
```

### Typography

**Font Families:**
```css
--font-sans: 'Inter', system-ui, sans-serif
--font-mono: 'Fira Code', monospace
```

**Font Sizes:**
```css
text-xs:   0.75rem  (12px)
text-sm:   0.875rem (14px)
text-base: 1rem     (16px)
text-lg:   1.125rem (18px)
text-xl:   1.25rem  (20px)
text-2xl:  1.5rem   (24px)
text-3xl:  1.875rem (30px)
text-4xl:  2.25rem  (36px)
```

**Font Weights:**
```css
font-normal:    400
font-medium:    500
font-semibold:  600
font-bold:      700
```

### Spacing

**Scale:** 4px base unit
```css
0:   0px
1:   4px
2:   8px
3:   12px
4:   16px
5:   20px
6:   24px
8:   32px
10:  40px
12:  48px
16:  64px
20:  80px
24:  96px
```

### Border Radius

```css
rounded-none: 0px
rounded-sm:   2px
rounded:      4px
rounded-md:   6px
rounded-lg:   8px
rounded-xl:   12px
rounded-2xl:  16px
rounded-full: 9999px
```

### Shadows

```css
shadow-sm:  0 1px 2px 0 rgb(0 0 0 / 0.05)
shadow:     0 1px 3px 0 rgb(0 0 0 / 0.1)
shadow-md:  0 4px 6px -1px rgb(0 0 0 / 0.1)
shadow-lg:  0 10px 15px -3px rgb(0 0 0 / 0.1)
shadow-xl:  0 20px 25px -5px rgb(0 0 0 / 0.1)
```

---

## Component Patterns

### Button

**Variants:**
```tsx
<Button variant="default">Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Cancel</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
```

**Sizes:**
```tsx
<Button size="default">Default</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Icon /></Button>
```

**States:**
```tsx
<Button disabled>Disabled</Button>
<Button loading>Loading...</Button>
```

### Input

**Basic:**
```tsx
<Input type="text" placeholder="Enter text..." />
<Input type="email" placeholder="Email" />
<Input type="password" placeholder="Password" />
```

**With Label:**
```tsx
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" />
</div>
```

**With Error:**
```tsx
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" className="border-destructive" />
  <p className="text-sm text-destructive">Invalid email</p>
</div>
```

### Card

```tsx
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

### Dialog

```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>Dialog description</DialogDescription>
    </DialogHeader>
    <div className="py-4">
      {/* Dialog content */}
    </div>
    <DialogFooter>
      <Button variant="outline">Cancel</Button>
      <Button>Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

## Layout Patterns

### Container

```tsx
<div className="container mx-auto px-4 sm:px-6 lg:px-8">
  {/* Content */}
</div>
```

### Grid

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
</div>
```

### Flex

```tsx
<div className="flex items-center justify-between">
  <h1>Title</h1>
  <Button>Action</Button>
</div>
```

### Stack

```tsx
<div className="space-y-4">
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
</div>
```

---

## Responsive Design

### Breakpoints

```css
sm:  640px   /* Mobile landscape */
md:  768px   /* Tablet */
lg:  1024px  /* Desktop */
xl:  1280px  /* Large desktop */
2xl: 1536px  /* Extra large */
```

### Mobile-First Approach

```tsx
<div className="
  text-sm          /* Mobile: 14px */
  md:text-base     /* Tablet: 16px */
  lg:text-lg       /* Desktop: 18px */
">
  Responsive text
</div>
```

### Hide/Show

```tsx
<div className="hidden md:block">
  Desktop only
</div>

<div className="block md:hidden">
  Mobile only
</div>
```

---

## Animation Patterns

### Fade In

```tsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>
```

### Slide In

```tsx
<motion.div
  initial={{ x: -20, opacity: 0 }}
  animate={{ x: 0, opacity: 1 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>
```

### Scale

```tsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Click me
</motion.button>
```

---

## Form Patterns

### Basic Form

```tsx
<form onSubmit={handleSubmit}>
  <div className="space-y-4">
    <div className="space-y-2">
      <Label htmlFor="name">Name</Label>
      <Input id="name" {...register('name')} />
      {errors.name && (
        <p className="text-sm text-destructive">{errors.name.message}</p>
      )}
    </div>
    
    <Button type="submit">Submit</Button>
  </div>
</form>
```

### Form with React Hook Form + Zod

```tsx
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
})

const form = useForm({
  resolver: zodResolver(schema)
})

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <Button type="submit">Submit</Button>
  </form>
</Form>
```

---

## Loading States

### Skeleton

```tsx
<div className="space-y-4">
  <Skeleton className="h-12 w-full" />
  <Skeleton className="h-4 w-3/4" />
  <Skeleton className="h-4 w-1/2" />
</div>
```

### Spinner

```tsx
<div className="flex items-center justify-center">
  <Loader2 className="h-8 w-8 animate-spin" />
</div>
```

---

## Toast Notifications

```tsx
import { toast } from 'sonner'

// Success
toast.success('Product added to cart')

// Error
toast.error('Failed to add product')

// Info
toast.info('New update available')

// Warning
toast.warning('Low stock')

// Promise
toast.promise(
  saveProduct(),
  {
    loading: 'Saving...',
    success: 'Product saved!',
    error: 'Failed to save'
  }
)
```

---

## Accessibility

### ARIA Labels

```tsx
<Button aria-label="Close dialog">
  <X className="h-4 w-4" />
</Button>
```

### Focus Management

```tsx
<Dialog>
  <DialogContent>
    <Input autoFocus />
  </DialogContent>
</Dialog>
```

### Keyboard Navigation

```tsx
<div
  role="button"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick()
    }
  }}
>
  Clickable div
</div>
```

---

## Icon Usage

```tsx
import { Search, ShoppingCart, User } from 'lucide-react'

<Button>
  <Search className="mr-2 h-4 w-4" />
  Search
</Button>

<Button size="icon">
  <ShoppingCart className="h-4 w-4" />
</Button>
```

---

## Best Practices

1. **Use semantic HTML** - `<button>` not `<div onClick>`
2. **Mobile-first** - Start with mobile, add desktop styles
3. **Consistent spacing** - Use Tailwind spacing scale
4. **Accessible colors** - Ensure sufficient contrast (WCAG AA)
5. **Loading states** - Show feedback for async operations
6. **Error states** - Clear error messages
7. **Empty states** - Helpful messages when no data
8. **Keyboard navigation** - All interactive elements focusable
9. **ARIA labels** - For icon-only buttons
10. **Responsive images** - Use Next.js Image component

---

## Related Documentation

- [Project Structure](./PROJECT_STRUCTURE.md)
- [Tech Stack](./TECH_STACK.md)
- [Coding Standards](./CODING_STANDARDS.md)
- [State Management](./STATE_MANAGEMENT.md)
- [Environment Variables](./ENV_VARIABLES.md)
