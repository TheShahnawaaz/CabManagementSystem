/**
 * Route Guards Module
 * 
 * Professional routing system with declarative permission management.
 * 
 * Features:
 * - Type-safe route metadata
 * - Universal route guard component
 * - Automatic route processing
 * - Loading states during auth checks
 * - Toast notifications for access denial
 * - Validation utilities
 * 
 * @module routes/guards
 */

export { RouteGuard } from './RouteGuard';
export { processRoutes, validateRouteConfig } from './utils';
export type { RouteMeta, CustomRouteObject } from './types';
export { RoutePermission } from './types';
export type { RoutePermission as RoutePermissionType } from './types';

