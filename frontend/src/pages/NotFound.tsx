/**
 * 404 Not Found Page
 * 
 * Displayed when user navigates to a non-existent route
 */
export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-gray-300 dark:text-gray-700">404</h1>
        <h2 className="text-2xl font-semibold">Page Not Found</h2>
        <p className="text-gray-600 dark:text-gray-400">
          The page you're looking for doesn't exist.
        </p>
        <a href="/dashboard" className="text-blue-600 hover:underline">
          Go to Dashboard
        </a>
      </div>
    </div>
  );
}

