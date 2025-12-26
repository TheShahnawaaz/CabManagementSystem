import { FileQuestionIcon, HomeIcon } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

/**
 * 404 Not Found Page
 * 
 * Displayed when user navigates to a non-existent route
 * Uses shadcn/ui Empty component for professional design
 */
export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Empty className="border-dashed">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FileQuestionIcon className="size-6" />
          </EmptyMedia>
          <EmptyTitle>404 - Page Not Found</EmptyTitle>
          <EmptyDescription>
            The page you're looking for doesn't exist or has been moved.
            Try going back to the dashboard or contact support if you need help.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Link to="/dashboard" className="w-full max-w-xs">
            <Button className="w-full" size="sm">
              <HomeIcon className="size-4" />
              Back to Dashboard
            </Button>
          </Link>
          <EmptyDescription>
            Need help? <Link to="/about" className="text-primary hover:underline">Contact support</Link>
          </EmptyDescription>
        </EmptyContent>
      </Empty>
    </div>
  );
}

