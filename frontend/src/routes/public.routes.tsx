import type { CustomRouteObject } from "./guards";
import TermsPage from "@/pages/legal/TermsPage";
import PrivacyPage from "@/pages/legal/PrivacyPage";
import ContactPage from "@/pages/legal/ContactPage";
import CancellationRefundPage from "@/pages/legal/CancellationRefundPage";

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
 *
 * NOTE: Driver QR validation (/driver-scan) is now a special route in index.tsx
 * to avoid RootLayout header overlap.
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
  // NOTE: driver-scan is now a special route in index.tsx (no layout wrapper)
  {
    path: "terms",
    element: <TermsPage />,
    meta: {
      title: "Terms & Conditions",
      description:
        "Rules for using the Friday Cab Allocation System and booking Friday prayer transport.",
    },
  },
  {
    path: "privacy",
    element: <PrivacyPage />,
    meta: {
      title: "Privacy Policy",
      description:
        "How we collect, use, and protect data for cab booking and QR validation.",
    },
  },
  {
    path: "contact",
    element: <ContactPage />,
    meta: {
      title: "Contact Us",
      description: "Get support for bookings, payments, and QR validation.",
    },
  },
  {
    path: "cancellation-refunds",
    element: <CancellationRefundPage />,
    meta: {
      title: "Cancellation & Refunds",
      description: "Policies for cancelling a booking and receiving refunds.",
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
