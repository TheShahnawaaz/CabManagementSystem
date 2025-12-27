import { useState, useEffect, useMemo } from 'react';
import { useLocation, useParams, matchPath } from 'react-router-dom';
import { Home } from 'lucide-react';
import type { BreadcrumbItem } from '@/types/breadcrumb.types';
import { breadcrumbCache } from '@/lib/breadcrumbCache';
import { allRoutes } from '@/routes';

/**
 * Hook to generate breadcrumb trail from current URL
 * Automatically fetches entity names for dynamic segments
 */
export function useBreadcrumbs() {
  const location = useLocation();
  const params = useParams();
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Generate breadcrumbs whenever location changes
  useEffect(() => {
    generateBreadcrumbs();
  }, [location.pathname]);

  const generateBreadcrumbs = async () => {
    setLoading(true);
    const items: BreadcrumbItem[] = [];

    // Always start with Home
    items.push({
      label: 'Home',
      href: '/dashboard',
      isCurrent: location.pathname === '/dashboard',
      icon: Home,
    });

    // Split pathname into segments
    const segments = location.pathname.split('/').filter(Boolean);
    
    // Build path progressively
    let currentPath = '';
    
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      currentPath += `/${segment}`;
      const isLast = i === segments.length - 1;

      // Find matching route for this path
      const matchedRoute = findMatchingRoute(currentPath);
      
      if (!matchedRoute || matchedRoute.meta?.breadcrumb?.hide) {
        continue;
      }

      const breadcrumbConfig = matchedRoute.meta?.breadcrumb;

      // Check if this segment is a dynamic parameter (UUID or ID)
      const isDynamic = breadcrumbConfig?.dynamic || isUUID(segment);

      if (isDynamic && breadcrumbConfig?.fetchEntity && breadcrumbConfig?.entityType) {
        // Dynamic segment - fetch entity name
        const entityId = segment;
        const entityType = breadcrumbConfig.entityType;

        // Check cache first
        let entityName = breadcrumbCache.get(entityType, entityId);

        if (!entityName) {
          // Not in cache - fetch it
          try {
            entityName = await breadcrumbConfig.fetchEntity(entityId);
            // Cache the result
            breadcrumbCache.set(entityType, entityId, entityName);
          } catch (error) {
            console.error('Error fetching entity name for breadcrumb:', error);
            entityName = breadcrumbConfig.label || 'Loading...';
          }
        }

        items.push({
          label: entityName,
          href: currentPath,
          isCurrent: isLast,
          icon: breadcrumbConfig.icon,
        });
      } else if (breadcrumbConfig?.label) {
        // Static segment with label
        items.push({
          label: breadcrumbConfig.label,
          href: currentPath,
          isCurrent: isLast,
          icon: breadcrumbConfig.icon,
        });
      }
    }

    setBreadcrumbs(items);
    setLoading(false);
  };

  return { breadcrumbs, loading };
}

/**
 * Find route configuration that matches the given path
 */
function findMatchingRoute(path: string) {
  for (const route of allRoutes) {
    const match = matchPath(route.path!, path);
    if (match) {
      return route;
    }
    
    // Check children
    if (route.children) {
      for (const child of route.children) {
        const childPath = route.path + '/' + child.path;
        const childMatch = matchPath(childPath, path);
        if (childMatch) {
          return child;
        }
      }
    }
  }
  return null;
}

/**
 * Check if a string is a UUID
 */
function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

