import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { ThemeToggle } from '@/components/theme-toggle'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 p-8 relative">
      {/* Theme Toggle in top-right corner */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Friday Cab Project</h1>
        <p className="text-muted-foreground">Vite + React + shadcn/ui</p>
      </div>
      
      {/* Carousel Demo */}
      <Carousel className="w-full max-w-xs">
        <CarouselContent>
          {Array.from({ length: 5 }).map((_, index) => (
            <CarouselItem key={index}>
              <div className="p-1">
                <Card>
                  <CardContent className="flex aspect-square items-center justify-center p-6">
                    <span className="text-4xl font-semibold">{index + 1}</span>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
      
      <div className="flex flex-col items-center gap-4">
        <Button onClick={() => setCount((count) => count + 1)} size="lg">
          Count is {count}
        </Button>
        
        <div className="flex gap-2">
          <Button variant="default">Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="destructive">Destructive</Button>
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground">
        shadcn/ui is successfully integrated! ✨
      </p>
    </div>
  )
}

export default App
