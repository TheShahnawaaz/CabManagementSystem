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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        {/* Spinner from shadcn/ui */}
        <div className="flex justify-center">
          <Spinner className="size-16 text-primary" />
        </div>

        {/* Message */}
        <p className="text-sm font-medium text-muted-foreground">{message}</p>
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
