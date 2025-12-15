# Frontend Routing Structure

## 📁 Folder Structure

```
frontend/src/
├── App.tsx                      # ✅ Clean - only RouterProvider
├── main.tsx                     # Entry point
├── index.css                    # Global styles
│
├── routes/                      # 🎯 All routing configuration
│   ├── index.tsx               # Main router setup
│   └── rough.routes.tsx        # /rough/* sub-routes
│
├── pages/                       # 📄 Page components
│   ├── Home.tsx                # / (home page)
│   └── rough/                  # /rough/* pages
│       ├── CarouselPage.tsx    # /rough/carousel
│       └── CounterPage.tsx     # /rough/counter
│
├── components/
│   ├── layout/
│   │   └── RootLayout.tsx      # Root layout with theme toggle
│   ├── theme-provider.tsx
│   ├── theme-toggle.tsx
│   └── ui/                     # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── carousel.tsx
│       └── dropdown-menu.tsx
│
└── lib/
    └── utils.ts
```

## 🛣️ Available Routes

| Route | File | Description |
|-------|------|-------------|
| `/` | `pages/Home.tsx` | Home page with demo content |
| `/rough/carousel` | `pages/rough/CarouselPage.tsx` | Carousel component demos |
| `/rough/counter` | `pages/rough/CounterPage.tsx` | Counter state management demo |

## ✨ Key Features

### 1. Modular Route Configuration
- Main routes defined in `routes/index.tsx`
- Sub-routes modularized (e.g., `rough.routes.tsx`)
- Easy to add new route modules (admin, user, booking, etc.)

### 2. Professional Structure
- Clean separation: Routes → Pages → Components
- Scalable and maintainable
- Similar to backend routing patterns

### 3. Easy Extension

To add a new route under `/rough/*`:
```typescript
// routes/rough.routes.tsx
export const roughRoutes: RouteObject = {
  path: 'rough',
  children: [
    { path: 'carousel', element: <CarouselPage /> },
    { path: 'counter', element: <CounterPage /> },
    { path: 'new-page', element: <NewPage /> },  // ← Just add here!
  ]
}
```

To add a new route module:
```typescript
// routes/admin.routes.tsx
export const adminRoutes: RouteObject = {
  path: 'admin',
  children: [
    { path: 'dashboard', element: <AdminDashboard /> },
    { path: 'users', element: <UserManagement /> },
  ]
}

// routes/index.tsx
import { adminRoutes } from './admin.routes'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      roughRoutes,
      adminRoutes,  // ← Import and add here!
    ]
  }
])
```

## 🚀 Getting Started

```bash
npm run dev
```

Then visit:
- http://localhost:5173/ - Home page
- http://localhost:5173/rough/carousel - Carousel demo
- http://localhost:5173/rough/counter - Counter demo

