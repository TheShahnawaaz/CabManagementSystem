# Frontend Project Structure

## 📁 Organized Folder Structure

```
frontend/src/
├── App.tsx                      # Main app component (clean routing only)
├── main.tsx                     # Entry point
├── index.css                    # Global styles
│
├── providers/                   # 🎯 Context Providers
│   ├── ThemeProvider.tsx        # Theme context provider
│   └── index.ts                 # Barrel export
│
├── hooks/                       # 🎣 Custom React Hooks
│   ├── useTheme.ts             # Theme hook
│   └── index.ts                 # Barrel export
│
├── components/
│   ├── layout/                  # 🏗️ Layout Components
│   │   ├── RootLayout.tsx      # Main layout wrapper
│   │   └── ThemeToggle.tsx     # Theme toggle UI
│   │
│   └── ui/                      # 🎨 UI Components (shadcn/ui)
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── carousel.tsx
│       ├── dropdown-menu.tsx
│       └── select.tsx
│
├── pages/                       # 📄 Page Components
│   ├── Home.tsx                # Home page
│   └── rough/                  # Development/testing pages
│       ├── RoughIndex.tsx      # /rough - Navigation hub
│       ├── CarouselPage.tsx    # /rough/carousel
│       ├── CounterPage.tsx     # /rough/counter
│       └── VehiclePage.tsx     # /rough/vehicle
│
├── routes/                      # 🛣️ Route Configuration
│   ├── index.tsx               # Main router setup
│   └── rough.routes.tsx        # /rough/* sub-routes
│
├── lib/                         # 🔧 Utilities
│   └── utils.ts                # Helper functions (cn, etc.)
│
└── assets/                      # 🖼️ Static Assets
    └── react.svg
```

## 🎯 Design Principles

### 1. **Separation of Concerns**
- **Providers** - Context providers only
- **Hooks** - Custom hooks for reusable logic
- **Components** - UI components organized by purpose
- **Pages** - Route-specific page components
- **Routes** - Routing configuration

### 2. **Naming Conventions**
- **Components/Providers**: PascalCase (e.g., `ThemeProvider.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useTheme.ts`)
- **Utilities**: camelCase (e.g., `utils.ts`)
- **Routes**: kebab-case for paths (e.g., `/rough/carousel`)

### 3. **Import Aliases**
```typescript
// Configured in tsconfig and vite.config
@/components  → src/components
@/hooks       → src/hooks
@/providers   → src/providers
@/lib         → src/lib
@/pages       → src/pages
```

## 📦 Import Examples

### ✅ Clean Imports with Barrel Exports

```typescript
// Import provider
import { ThemeProvider } from '@/providers'

// Import hook
import { useTheme } from '@/hooks'

// Import UI component
import { Button } from '@/components/ui/button'

// Import layout component
import { ThemeToggle } from '@/components/layout/ThemeToggle'
```

### ❌ Avoid Direct File Imports (when barrel exists)

```typescript
// Don't do this
import { useTheme } from '@/hooks/useTheme'

// Do this instead
import { useTheme } from '@/hooks'
```

## 🔄 Data Flow

```
main.tsx
  └─ ThemeProvider (providers/)
      └─ App.tsx
          └─ Router (routes/)
              └─ RootLayout (components/layout/)
                  ├─ ThemeToggle (components/layout/)
                  │   └─ useTheme hook (hooks/)
                  │
                  └─ Page Components (pages/)
```

## 🚀 Adding New Features

### Adding a New Provider
1. Create `src/providers/YourProvider.tsx`
2. Export from `src/providers/index.ts`
3. Wrap in `main.tsx` or create `AppProviders.tsx`

### Adding a New Hook
1. Create `src/hooks/useYourHook.ts`
2. Export from `src/hooks/index.ts`

### Adding a New Page
1. Create `src/pages/YourPage.tsx`
2. Add route in `src/routes/index.tsx` or relevant route file

### Adding a New Route Module
1. Create `src/routes/your-feature.routes.tsx`
2. Import and add to `src/routes/index.tsx`

## 📋 Best Practices

### ✅ Do's
- Keep components small and focused
- Use barrel exports for cleaner imports
- Organize by feature when it makes sense
- Use TypeScript for type safety
- Keep providers lightweight

### ❌ Don'ts
- Don't mix business logic in components
- Don't create deep nesting (max 3 levels)
- Don't put everything in one folder
- Don't skip TypeScript types
- Don't create circular dependencies

## 🎨 Component Organization

```
components/
├── layout/          # Layout wrappers, navigation, headers
├── ui/              # shadcn/ui components (auto-generated)
└── [feature]/       # Feature-specific components (future)
```

## 📚 Related Documentation
- [Routing Structure](./ROUTING.md)
- [Backend API](./BE.md)
- [Frontend Setup](./FE.md)

---

**Last Updated**: December 2025  
**Structure Version**: 1.0 (Production-Ready)

