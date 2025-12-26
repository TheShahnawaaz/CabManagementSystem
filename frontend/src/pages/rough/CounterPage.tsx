import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from 'react-router-dom'

export default function CounterPage() {
  const [count, setCount] = useState(0)
  const [step, setStep] = useState(1)

  const increment = () => setCount(count + step)
  const decrement = () => setCount(count - step)
  const reset = () => setCount(0)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 p-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Counter Demo</h1>
        <p className="text-muted-foreground">Testing state management and button interactions</p>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Interactive Counter</CardTitle>
          <CardDescription>Click buttons to modify the counter value</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Counter Display */}
          <div className="flex items-center justify-center">
            <div className="text-6xl font-bold text-primary">
              {count}
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex gap-2 justify-center">
            <Button onClick={decrement} variant="outline" size="lg">
              - {step}
            </Button>
            <Button onClick={reset} variant="secondary" size="lg">
              Reset
            </Button>
            <Button onClick={increment} size="lg">
              + {step}
            </Button>
          </div>

          {/* Step Control */}
          <div className="space-y-2">
            <p className="text-sm text-center text-muted-foreground">Step Size: {step}</p>
            <div className="flex gap-2 justify-center">
              <Button 
                onClick={() => setStep(1)} 
                variant={step === 1 ? "default" : "outline"}
                size="sm"
              >
                1
              </Button>
              <Button 
                onClick={() => setStep(5)} 
                variant={step === 5 ? "default" : "outline"}
                size="sm"
              >
                5
              </Button>
              <Button 
                onClick={() => setStep(10)} 
                variant={step === 10 ? "default" : "outline"}
                size="sm"
              >
                10
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Link to="/">
          <Button variant="outline">← Back to Home</Button>
        </Link>
        <Link to="/rough/carousel">
          <Button variant="secondary">Go to Carousel →</Button>
        </Link>
      </div>
    </div>
  )
}




