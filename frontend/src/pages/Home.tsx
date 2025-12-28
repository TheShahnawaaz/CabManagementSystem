import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Link } from "react-router-dom";
import { FlaskConical } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 p-8">
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
        <div className="flex gap-2">
          <Button variant="default">Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="destructive">Destructive</Button>
        </div>
      </div>

      {/* Link to Rough Pages */}
      <div className="mt-4">
        <Link to="/rough">
          <Button variant="outline" size="lg" className="gap-2">
            <FlaskConical className="w-5 h-5" />
            View Rough/Testing Pages
          </Button>
        </Link>
      </div>

      <p className="text-sm text-muted-foreground">
        shadcn/ui is successfully integrated! ✨
      </p>
    </div>
  );
}
