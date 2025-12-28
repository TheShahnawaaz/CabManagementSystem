import type { RouteObject } from "react-router-dom";
import React from "react";
import { RouteGuard } from "./RouteGuard";
import type { CustomRouteObject } from "./types";

/**
 * Recursively processes custom route objects and wraps elements with RouteGuard
 * based on their metadata configuration.
 *
 * This utility automatically applies authentication and authorization logic
 * to routes without manual wrapping, making route management cleaner and more maintainable.
 *
 * @param routes - Array of custom route objects with optional metadata
 * @returns Array of standard React Router route objects with guards applied
 *
 * @example
 * const routes: CustomRouteObject[] = [
 *   {
 *     path: 'dashboard',
 *     element: <Dashboard />,
 *     meta: { requireAuth: true }
 *   }
 * ];
 *
 * const processedRoutes = processRoutes(routes);
 * // Output: Routes with RouteGuard wrapper applied automatically
 */
export function processRoutes(routes: CustomRouteObject[]): RouteObject[] {
  return routes.map((route) => {
    const { meta, element, children, ...rest } = route;

    // Process the element:
    // - If meta exists, wrap element in RouteGuard using React.createElement
    // - If no meta, element is public (no guard needed)
    const processedElement =
      meta && element
        ? React.createElement(RouteGuard, { meta, children: element })
        : element;

    // Recursively process child routes
    const processedChildren = children ? processRoutes(children) : undefined;

    return {
      ...rest,
      element: processedElement,
      children: processedChildren,
    } as RouteObject;
  });
}

/**
 * Validates route metadata to catch configuration errors early
 *
 * @param routes - Array of custom route objects to validate
 * @throws Error if invalid configuration is detected
 */
export function validateRouteConfig(routes: CustomRouteObject[]): void {
  routes.forEach((route) => {
    const { meta, path } = route;

    if (meta) {
      // Check for conflicting metadata
      if (meta.guestOnly && meta.requireAuth) {
        throw new Error(
          `Invalid route configuration for "${path}": Cannot have both guestOnly and requireAuth`
        );
      }

      if (meta.guestOnly && meta.requireAdmin) {
        throw new Error(
          `Invalid route configuration for "${path}": Cannot have both guestOnly and requireAdmin`
        );
      }

      // Admin routes must also require auth
      if (meta.requireAdmin && !meta.requireAuth) {
        console.warn(
          `Route "${path}" has requireAdmin but not requireAuth. Adding requireAuth automatically.`
        );
        meta.requireAuth = true;
      }
    }

    // Recursively validate children
    if (route.children) {
      validateRouteConfig(route.children);
    }
  });
}
