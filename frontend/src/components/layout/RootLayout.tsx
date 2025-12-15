import { Outlet } from 'react-router-dom'
import { ThemeToggle } from '@/components/layout/ThemeToggle'

export default function RootLayout() {
  return (
    <div className="min-h-screen relative">
      {/* Theme Toggle in top-right corner */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      
      {/* Page content will be rendered here */}
      <Outlet />
    </div>
  )
}

