import type { CustomRouteObject } from "./guards";

/**
 * Public Routes Configuration
 *
 * These routes are accessible to everyone, regardless of authentication status.
 * No authentication or authorization checks are performed.
 *
 * Use cases:
 * - Landing pages
 * - About/Contact pages
 * - Public documentation
 * - Terms of service
 * - Privacy policy
 */

// Placeholder components - these will be created as needed
const AboutPage = () => (
  <div className="container mx-auto px-4 py-8">
    <h1 className="text-3xl font-bold mb-4">About Friday Cab</h1>
    <p className="text-gray-600 dark:text-gray-400">
      Information about the Friday Cab allocation system.
    </p>
  </div>
);

export const publicRoutes: CustomRouteObject[] = [
  {
    path: "about",
    element: <AboutPage />,
    meta: {
      title: "About Us",
      description: "Learn more about Friday Cab System",
    },
  },
  // Add more public routes as needed:
  // {
  //   path: 'contact',
  //   element: <ContactPage />,
  //   meta: { title: 'Contact Us' }
  // },
  // {
  //   path: 'terms',
  //   element: <TermsPage />,
  //   meta: { title: 'Terms of Service' }
  // },
];
