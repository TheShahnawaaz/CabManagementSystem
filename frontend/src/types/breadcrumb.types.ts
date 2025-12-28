import type { LucideIcon } from "lucide-react";

/**
 * Configuration for breadcrumb display
 */
export interface BreadcrumbConfig {
  /** Static label to display */
  label?: string;

  /** Icon to display (optional) */
  icon?: LucideIcon;

  /** Whether this segment represents a dynamic entity (has ID) */
  dynamic?: boolean;

  /** Type of entity for dynamic segments */
  entityType?: "trip" | "booking" | "user" | "cab" | "payment";

  /** Function to fetch entity name by ID */
  fetchEntity?: (id: string) => Promise<string>;

  /** Hide this segment from breadcrumb trail */
  hide?: boolean;
}

/**
 * Represents a single breadcrumb item in the trail
 */
export interface BreadcrumbItem {
  /** Display label */
  label: string;

  /** URL path to navigate to */
  href: string;

  /** Whether this is the current/active page */
  isCurrent: boolean;

  /** Optional icon */
  icon?: LucideIcon;

  /** Loading state for dynamic breadcrumbs */
  isLoading?: boolean;
}

/**
 * Extended route metadata with breadcrumb config
 */
export interface RouteMetadata {
  requireAuth?: boolean;
  requireAdmin?: boolean;
  guestOnly?: boolean;
  title?: string;
  description?: string;
  breadcrumb?: BreadcrumbConfig;
}
