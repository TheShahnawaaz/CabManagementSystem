import { Spinner } from "./spinner";

/**
 * Professional loading screen component
 * Used during authentication checks and route transitions
 */
export function LoadingScreen({
  message = "Loading...",
}: {
  message?: string;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center space-y-4">
        {/* Spinner from shadcn/ui */}
        <div className="flex justify-center">
          <Spinner className="size-16 text-blue-600 dark:text-blue-400" />
        </div>

        {/* Message */}
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {message}
        </p>
      </div>
    </div>
  );
}

/**
 * Inline loader for smaller sections
 */
export function InlineLoader({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "size-4",
    md: "size-8",
    lg: "size-12",
  };

  return (
    <div className="flex items-center justify-center">
      <Spinner className={sizes[size]} />
    </div>
  );
}
