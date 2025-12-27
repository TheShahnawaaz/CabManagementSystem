import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import {
  Breadcrumb as ShadcnBreadcrumb,
  BreadcrumbItem as ShadcnBreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from '@/components/ui/breadcrumb';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { useBreadcrumbs } from '@/hooks/useBreadcrumbs';

/**
 * Smart Breadcrumb component that automatically generates breadcrumb trail
 * from the current URL and route configuration
 * 
 * Features:
 * - Auto-generates from URL
 * - Shows entity names (not IDs)
 * - Truncates long names (30 chars)
 * - Collapses on mobile (shows only last 2 items + dropdown)
 */
export function Breadcrumb() {
  const { breadcrumbs, loading } = useBreadcrumbs();

  if (loading && breadcrumbs.length === 0) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-12" />
        <ChevronRight className="h-4 w-4" />
        <Skeleton className="h-4 w-24" />
      </div>
    );
  }

  if (breadcrumbs.length === 0) {
    return null;
  }

  /**
   * Truncate long text to specified length
   */
  const truncate = (text: string, maxLength: number = 30): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  /**
   * Shorten label for mobile display
   * e.g., "Trip Management" -> "Trips"
   */
  const shortenForMobile = (label: string): string => {
    const mobileShortcuts: Record<string, string> = {
      'Trip Management': 'Trips',
      'User Management': 'Users',
      'Vehicle Management': 'Vehicles',
      'Admin Dashboard': 'Admin',
      'My Bookings': 'Bookings',
      'Active Trips': 'Trips',
    };
    return mobileShortcuts[label] || label;
  };

  /**
   * Mobile: Show only last 2 items + collapsed dropdown
   * Desktop: Show all items
   */
  const shouldCollapse = breadcrumbs.length > 3;

  return (
    <ShadcnBreadcrumb>
      <BreadcrumbList>
        {/* Desktop: Show all breadcrumbs */}
        <div className="hidden md:flex md:items-center md:gap-2">
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;
            const Icon = item.icon;
            const label = truncate(item.label);

            return (
              <div key={item.href} className="flex items-center gap-2">
                <ShadcnBreadcrumbItem>
                  {item.isCurrent || isLast ? (
                    <BreadcrumbPage className="flex items-center gap-1.5">
                      {Icon && <Icon className="h-4 w-4" />}
                      <span>{label}</span>
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link to={item.href} className="flex items-center gap-1.5">
                        {Icon && <Icon className="h-4 w-4" />}
                        <span>{label}</span>
                      </Link>
                    </BreadcrumbLink>
                  )}
                </ShadcnBreadcrumbItem>

                {!isLast && (
                  <BreadcrumbSeparator>
                    <ChevronRight className="h-4 w-4" />
                  </BreadcrumbSeparator>
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile: Show collapsed breadcrumbs */}
        <div className="flex items-center gap-2 md:hidden">
          {shouldCollapse ? (
            <>
              {/* Collapsed items in dropdown */}
              <ShadcnBreadcrumbItem>
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-1">
                    <BreadcrumbEllipsis className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {breadcrumbs.slice(0, -2).map((item) => {
                      const Icon = item.icon;
                      const label = truncate(item.label, 25);
                      return (
                        <DropdownMenuItem key={item.href} asChild>
                          <Link to={item.href} className="flex items-center gap-2">
                            {Icon && <Icon className="h-4 w-4" />}
                            <span>{label}</span>
                          </Link>
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </ShadcnBreadcrumbItem>

              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>

              {/* Last 2 items visible */}
              {breadcrumbs.slice(-2).map((item, index) => {
                const isLast = index === 1; // Last of the 2 items
                const Icon = item.icon;
                const label = truncate(shortenForMobile(item.label), 20); // Shorter for mobile

                return (
                  <div key={item.href} className="flex items-center gap-2">
                    <ShadcnBreadcrumbItem>
                      {isLast ? (
                        <BreadcrumbPage className="flex items-center gap-1.5">
                          {Icon && <Icon className="h-4 w-4 flex-shrink-0" />}
                          <span className="max-w-[100px] truncate">{label}</span>
                        </BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink asChild>
                          <Link to={item.href} className="flex items-center gap-1.5">
                            {Icon && <Icon className="h-4 w-4 flex-shrink-0" />}
                            <span className="max-w-[100px] truncate">{label}</span>
                          </Link>
                        </BreadcrumbLink>
                      )}
                    </ShadcnBreadcrumbItem>

                    {!isLast && (
                      <BreadcrumbSeparator>
                        <ChevronRight className="h-4 w-4" />
                      </BreadcrumbSeparator>
                    )}
                  </div>
                );
              })}
            </>
          ) : (
            // Show all if 3 or fewer items
            breadcrumbs.map((item, index) => {
              const isLast = index === breadcrumbs.length - 1;
              const Icon = item.icon;
              const label = truncate(shortenForMobile(item.label), 15); // Much shorter for mobile

              return (
                <div key={item.href} className="flex items-center gap-2">
                  <ShadcnBreadcrumbItem>
                    {item.isCurrent || isLast ? (
                      <BreadcrumbPage className="flex items-center gap-1.5">
                        {Icon && <Icon className="h-4 w-4 flex-shrink-0" />}
                        <span className="max-w-[80px] truncate">{label}</span>
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link to={item.href} className="flex items-center gap-1.5">
                          {Icon && <Icon className="h-4 w-4 flex-shrink-0" />}
                          <span className="max-w-[80px] truncate">{label}</span>
                        </Link>
                      </BreadcrumbLink>
                    )}
                  </ShadcnBreadcrumbItem>

                  {!isLast && (
                    <BreadcrumbSeparator>
                      <ChevronRight className="h-4 w-4" />
                    </BreadcrumbSeparator>
                  )}
                </div>
              );
            })
          )}
        </div>
      </BreadcrumbList>
    </ShadcnBreadcrumb>
  );
}

