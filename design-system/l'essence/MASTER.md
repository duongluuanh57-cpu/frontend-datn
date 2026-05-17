# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** L'essence
**Generated:** 2026-05-17 11:17:50
**Category:** E-commerce Luxury

---

## Global Rules

### Color Palette

| Role | Hex | CSS Variable |
|------|-----|--------------|
| Primary | `#EC4899` | `--color-primary` |
| On Primary | `#FFFFFF` | `--color-on-primary` |
| Secondary | `#F9A8D4` | `--color-secondary` |
| Accent/CTA | `#8B5CF6` | `--color-accent` |
| Background | `#FDF2F8` | `--color-background` |
| Foreground | `#831843` | `--color-foreground` |
| Muted | `#F1EEF5` | `--color-muted` |
| Border | `#FBCFE8` | `--color-border` |
| Destructive | `#DC2626` | `--color-destructive` |
| Ring | `#EC4899` | `--color-ring` |

**Color Notes:** Soft pink + lavender luxury

### Typography

- **Heading Font:** Cormorant
- **Body Font:** Montserrat
- **Mood:** luxury, high-end, fashion, elegant, refined, premium
- **Google Fonts:** [Cormorant + Montserrat](https://fonts.google.com/share?selection.family=Cormorant:wght@400;500;600;700|Montserrat:wght@300;400;500;600;700)

**CSS Import:**
```css
@import url('https://fonts.googleapis.com/css2?family=Cormorant:wght@400;500;600;700&family=Montserrat:wght@300;400;500;600;700&display=swap');
```

### Spacing Variables

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | `4px` / `0.25rem` | Tight gaps |
| `--space-sm` | `8px` / `0.5rem` | Icon gaps, inline spacing |
| `--space-md` | `16px` / `1rem` | Standard padding |
| `--space-lg` | `24px` / `1.5rem` | Section padding |
| `--space-xl` | `32px` / `2rem` | Large gaps |
| `--space-2xl` | `48px` / `3rem` | Section margins |
| `--space-3xl` | `64px` / `4rem` | Hero padding |

### Shadow Depths

| Level | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle lift |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.1)` | Cards, buttons |
| `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)` | Modals, dropdowns |
| `--shadow-xl` | `0 20px 25px rgba(0,0,0,0.15)` | Hero images, featured cards |

---

## Component Specs

### Buttons

```css
/* Primary Button */
.btn-primary {
  background: #8B5CF6;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 200ms ease;
  cursor: pointer;
}

.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* Secondary Button */
.btn-secondary {
  background: transparent;
  color: #EC4899;
  border: 2px solid #EC4899;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 200ms ease;
  cursor: pointer;
}
```

### Cards

```css
.card {
  background: #FDF2F8;
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--shadow-md);
  transition: all 200ms ease;
  cursor: pointer;
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}
```

### Inputs

```css
.input {
  padding: 12px 16px;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 200ms ease;
}

.input:focus {
  border-color: #EC4899;
  outline: none;
  box-shadow: 0 0 0 3px #EC489920;
}
```

### Modals

```css
.modal-overlay {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.modal {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: var(--shadow-xl);
  max-width: 500px;
  width: 90%;
}
```

---

## Style Guidelines

**Style:** Liquid Glass

**Keywords:** Flowing glass, morphing, smooth transitions, fluid effects, translucent, animated blur, iridescent, chromatic aberration

**Best For:** Premium SaaS, high-end e-commerce, creative platforms, branding experiences, luxury portfolios

**Key Effects:** Morphing elements (SVG/CSS), fluid animations (400-600ms curves), dynamic blur (backdrop-filter), color transitions

### Page Pattern

**Pattern Name:** Feature-Rich Showcase

- **CTA Placement:** Above fold
- **Section Order:** Hero > Features > CTA

---

## Anti-Patterns (Do NOT Use)

- ❌ Vibrant & Block-based
- ❌ Playful colors

### Additional Forbidden Patterns

- ❌ **Emojis as icons** — Use SVG icons (Heroicons, Lucide, Simple Icons)
- ❌ **Missing cursor:pointer** — All clickable elements must have cursor:pointer
- ❌ **Layout-shifting hovers** — Avoid scale transforms that shift layout
- ❌ **Low contrast text** — Maintain 4.5:1 minimum contrast ratio
- ❌ **Instant state changes** — Always use transitions (150-300ms)
- ❌ **Invisible focus states** — Focus states must be visible for a11y

---

## Pre-Delivery Checklist

Before delivering any UI code, verify:

- [ ] No emojis used as icons (use SVG instead)
- [ ] All icons from consistent icon set (Heroicons/Lucide)
- [ ] `cursor-pointer` on all clickable elements
- [ ] Hover states with smooth transitions (150-300ms)
- [ ] Light mode: text contrast 4.5:1 minimum
- [ ] Focus states visible for keyboard navigation
- [ ] `prefers-reduced-motion` respected
- [ ] Responsive: 375px, 768px, 1024px, 1440px
- [ ] No content hidden behind fixed navbars
- [ ] No horizontal scroll on mobile

---

## Usage Guide

### How to Use Color Tokens

Use CSS variables for colors:

```tsx
// Primary colors
<div className="bg-primary text-on-primary">Primary Button</div>
<div className="bg-secondary text-foreground">Secondary Section</div>
<div className="bg-accent text-white">Accent CTA</div>

// Background & Foreground
<div className="bg-background text-foreground">Main Content</div>
<div className="bg-muted text-foreground">Muted Section</div>

// Borders
<div className="border border-default">Card with border</div>
```

Or use CSS variables directly:

```css
.custom-element {
  background: var(--color-primary);
  color: var(--color-on-primary);
}
```

### How to Use Spacing Tokens

Use design system spacing instead of arbitrary values:

```tsx
// Gap utilities
<div className="flex gap-md">Items with medium gap</div>
<div className="grid gap-lg">Grid with large gap</div>

// Padding utilities
<section className="p-xl">Section with XL padding</section>
<div className="p-2xl">Hero with 2XL padding</div>

// Margin utilities
<div className="m-lg">Element with large margin</div>
<section className="m-3xl">Section with 3XL margin</section>
```

### How to Use Shadow Tokens

Use design system shadows for depth:

```tsx
// Shadow utilities
<div className="shadow-sm">Subtle lift</div>
<div className="shadow-md">Card elevation</div>
<div className="shadow-lg">Modal/Dropdown</div>
<div className="shadow-xl">Hero image</div>
```

### How to Use Component Classes

Pre-built component classes:

```tsx
// Buttons
<button className="btn-primary">Shop Now</button>
<button className="btn-secondary">Learn More</button>

// Cards (auto-hover effect included)
<div className="card">
  <h3>Product Title</h3>
  <p>Product description...</p>
</div>

// Inputs (focus state with ring included)
<input type="text" className="input" placeholder="Enter email..." />
<textarea className="input" placeholder="Your message..." />

// Modals
<div className="modal-overlay">
  <div className="modal">
    <h2>Modal Title</h2>
    <p>Modal content...</p>
  </div>
</div>
```

### Typography Usage

```tsx
// Headings (Cormorant)
<h1 style={{ fontFamily: 'var(--font-heading)' }}>
  Elegant Heading
</h1>

// Body text (Montserrat) - Applied by default
<p>Body text uses Montserrat automatically</p>
```

### Best Practices

**✅ DO:**

```tsx
// Use design system tokens
<div className="p-lg gap-md shadow-md bg-primary">

// Use component classes
<button className="btn-primary">Click me</button>

// Use CSS variables
<div style={{ padding: 'var(--space-xl)' }}>
```

**❌ DON'T:**

```tsx
// Don't use arbitrary values
<div className="p-[23px] gap-[17px]">

// Don't use hardcoded colors
<div style={{ background: '#EC4899' }}>

// Don't use inline shadow values
<div style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
```

### Complete Examples

**Product Card:**

```tsx
<div className="card">
  <img src="/product.jpg" alt="Product" className="rounded-lg" />
  <h3 className="text-foreground" style={{ fontFamily: 'var(--font-heading)' }}>
    Luxury Perfume
  </h3>
  <p className="text-muted">Elegant fragrance for special occasions</p>
  <button className="btn-primary">Add to Cart</button>
</div>
```

**Hero Section:**

```tsx
<section className="p-3xl bg-background">
  <div className="flex flex-col gap-lg items-center">
    <h1 
      className="text-foreground text-5xl font-bold"
      style={{ fontFamily: 'var(--font-heading)' }}
    >
      L'essence
    </h1>
    <p className="text-muted text-lg">Luxury fragrances for the modern soul</p>
    <button className="btn-primary">Explore Collection</button>
  </div>
</section>
```

**Form:**

```tsx
<form className="flex flex-col gap-md p-xl bg-background shadow-lg rounded-lg">
  <input type="email" className="input" placeholder="Your email" />
  <input type="text" className="input" placeholder="Your name" />
  <textarea className="input" placeholder="Message" rows={4} />
  <button type="submit" className="btn-primary">Send Message</button>
</form>
```

### Responsive Usage

Combine with Tailwind responsive prefixes:

```tsx
<section className="p-md md:p-lg lg:p-xl xl:p-2xl">
  // Responsive padding using design system tokens
</section>

<div className="gap-sm md:gap-md lg:gap-lg">
  // Responsive gap
</div>
```
