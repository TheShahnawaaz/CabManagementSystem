import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"

export default function CarouselPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 p-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Carousel Demo</h1>
        <p className="text-muted-foreground">Testing carousel component variations</p>
      </div>

      {/* Basic Carousel */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-center">Basic Carousel</h2>
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
      </div>

      {/* Image Carousel */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-center">Image Carousel</h2>
        <Carousel className="w-full max-w-md">
          <CarouselContent>
            {Array.from({ length: 3 }).map((_, index) => (
              <CarouselItem key={index}>
                <div className="p-1">
                  <Card>
                    <CardContent className="flex aspect-video items-center justify-center p-6 bg-gradient-to-br from-blue-500 to-purple-500">
                      <span className="text-2xl font-semibold text-white">
                        Slide {index + 1}
                      </span>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>

      <div className="flex gap-4">
        <Link to="/">
          <Button variant="outline">← Back to Home</Button>
        </Link>
        <Link to="/rough/counter">
          <Button variant="secondary">Go to Counter →</Button>
        </Link>
      </div>
    </div>
  )
}




