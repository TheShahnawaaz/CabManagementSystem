import { createBrowserRouter } from 'react-router-dom'
import RootLayout from '@/components/layout/RootLayout'
import Home from '@/pages/Home'
import { roughRoutes } from './rough.routes'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { 
        index: true, 
        element: <Home /> 
      },
      roughRoutes,
      // Future routes can be added here:
      // adminRoutes,
      // userRoutes,
      // bookingRoutes,
    ]
  }
])

