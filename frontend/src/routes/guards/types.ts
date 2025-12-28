import type { RouteObject } from "react-router-dom";
import type { BreadcrumbConfig } from "@/types/breadcrumb.types";

/**
 * Route metadata configuration for access control and page settings
 */
export interface RouteMeta {
  /**
   * Requires user to be authenticated
   * @default false
   */
  requireAuth?: boolean;

  /**
   * Requires user to have admin privileges
   * @default false
   */
  requireAdmin?: boolean;

  /**
   * Only accessible to non-authenticated users (e.g., login page)
   * Authenticated users will be redirected away
   * @default false
   */
  guestOnly?: boolean;

  /**
   * Page title - will be set as document.title
   */
  title?: string;

  /**
   * Page description for SEO/meta tags
   */
  description?: string;

  /**
   * Custom redirect path if access is denied
   * If not specified, uses default redirect logic
   */
  redirectTo?: string;

  /**
   * Breadcrumb configuration for this route
   */
  breadcrumb?: BreadcrumbConfig;
}

/**
 * Extended RouteObject with metadata support
 */
export interface CustomRouteObject extends Omit<RouteObject, "children"> {
  /**
   * Route metadata for permissions and configuration
   */
  meta?: RouteMeta;

  /**
   * Child routes with metadata support
   */
  children?: CustomRouteObject[];
}

/**
 * Route permission levels for easy identification
 */
export const RoutePermission = {
  PUBLIC: "public",
  GUEST_ONLY: "guest_only",
  AUTHENTICATED: "authenticated",
  ADMIN_ONLY: "admin_only",
} as const;

export type RoutePermission =
  (typeof RoutePermission)[keyof typeof RoutePermission];
