import { Outlet } from 'react-router-dom'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { useAuth } from '@/hooks'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function RootLayout() {
  const { user, signOut, isAdmin } = useAuth()

  return (
    <div className="min-h-screen relative">
      {/* Header with user info and controls */}
      <header className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          {user && (
            <>
              <div className="flex items-center gap-2">
                {user.profile_picture && (
                  <img 
                    src={user.profile_picture} 
                    alt={user.name}
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <div>
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                </div>
              </div>
              {isAdmin && (
                <Badge variant="default">Admin</Badge>
              )}
            </>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={signOut}
            >
              Logout
            </Button>
          )}
        </div>
      </header>
      
      {/* Page content will be rendered here */}
      <Outlet />
    </div>
  )
}

