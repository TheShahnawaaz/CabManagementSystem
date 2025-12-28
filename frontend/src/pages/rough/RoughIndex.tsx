import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Blocks, Calculator, Car, Home } from "lucide-react";

export default function RoughIndex() {
  const roughPages = [
    {
      title: "Carousel Demo",
      description: "Testing carousel component with multiple variations",
      path: "/rough/carousel",
      icon: Blocks,
      color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    },
    {
      title: "Counter Demo",
      description: "Interactive counter with state management and step control",
      path: "/rough/counter",
      icon: Calculator,
      color: "bg-green-500/10 text-green-500 border-green-500/20",
    },
    {
      title: "Vehicle Selector",
      description:
        "Omni vehicle seat reservation system with interactive seat selection",
      path: "/rough/vehicle",
      icon: Car,
      color: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">🧪 Rough / Testing Pages</h1>
          <p className="text-muted-foreground text-lg">
            Development and testing area for components and features
          </p>
        </div>

        {/* Back to Home */}
        <div className="flex justify-center">
          <Link to="/">
            <Button variant="outline" className="gap-2">
              <Home className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Grid of cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roughPages.map((page) => (
            <Link key={page.path} to={page.path}>
              <Card className="h-full hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer border-2">
                <CardHeader>
                  <div
                    className={`w-12 h-12 rounded-lg ${page.color} flex items-center justify-center mb-3 border`}
                  >
                    <page.icon className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-xl">{page.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {page.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="secondary" className="w-full">
                    Open Demo →
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Info section */}
        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle className="text-lg">About Rough Pages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• These pages are for development and testing purposes</p>
            <p>
              • Add new rough pages by updating{" "}
              <code className="text-xs bg-muted px-1 py-0.5 rounded">
                routes/rough.routes.tsx
              </code>
            </p>
            <p>
              • Perfect for trying out new UI components and features before
              production
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
