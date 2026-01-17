/**
 * StatCard Component
 *
 * A beautiful, gradient-themed card for displaying statistics and metrics.
 * Highly customizable with support for:
 * - Custom colors (predefined or custom gradients)
 * - Icons with custom backgrounds
 * - Multiple value formats (number, text, currency)
 * - Subtitle/description text
 * - Custom styling and hover effects
 * - Two layout variants: default (horizontal) and stacked (vertical like Journey cards)
 *
 * @example
 * ```tsx
 * // Default horizontal layout
 * <StatCard
 *   value={125}
 *   label="Total Users"
 *   icon={Users}
 *   color="blue"
 * />
 *
 * // Stacked vertical layout (Journey Tracking style)
 * <StatCard
 *   value={125}
 *   label="Allocated"
 *   icon={Users}
 *   color="blue"
 *   variant="stacked"
 * />
 * ```
 */

import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

// Predefined color themes for common use cases
const COLOR_THEMES = {
  blue: {
    gradient: "from-background to-primary/5",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    valueColor: "",
  },
  green: {
    gradient: "from-background to-green-500/5",
    iconBg: "bg-green-500/10",
    iconColor: "text-green-500",
    valueColor: "text-green-600 dark:text-green-400",
  },
  red: {
    gradient: "from-background to-red-500/5",
    iconBg: "bg-red-500/10",
    iconColor: "text-red-500",
    valueColor: "text-red-600 dark:text-red-400",
  },
  orange: {
    gradient: "from-background to-orange-500/5",
    iconBg: "bg-orange-500/10",
    iconColor: "text-orange-500",
    valueColor: "text-orange-600 dark:text-orange-400",
  },
  purple: {
    gradient: "from-background to-purple-500/5",
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-500",
    valueColor: "text-purple-600 dark:text-purple-400",
  },
  yellow: {
    gradient: "from-background to-yellow-500/5",
    iconBg: "bg-yellow-500/10",
    iconColor: "text-yellow-500",
    valueColor: "text-yellow-600 dark:text-yellow-400",
  },
  pink: {
    gradient: "from-background to-pink-500/5",
    iconBg: "bg-pink-500/10",
    iconColor: "text-pink-500",
    valueColor: "text-pink-600 dark:text-pink-400",
  },
  indigo: {
    gradient: "from-background to-indigo-500/5",
    iconBg: "bg-indigo-500/10",
    iconColor: "text-indigo-500",
    valueColor: "text-indigo-600 dark:text-indigo-400",
  },
  neutral: {
    gradient: "from-background to-muted/30",
    iconBg: "bg-muted",
    iconColor: "text-foreground",
    valueColor: "",
  },
} as const;

export type ColorTheme = keyof typeof COLOR_THEMES;

/**
 * Custom hook for animating number values
 * Counts up from 0 to the target value over a specified duration
 */
function useCountAnimation(
  targetValue: number,
  duration: number = 1000
): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Reset count when target changes
    setCount(0);

    // Calculate increment steps
    const steps = 60; // 60 frames for smooth animation
    const increment = targetValue / steps;
    const stepDuration = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setCount(targetValue); // Ensure we end at exact target
        clearInterval(timer);
      } else {
        setCount(Math.floor(increment * currentStep));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [targetValue, duration]);

  return count;
}

export interface StatCardProps {
  /** The main value to display (number or string) */
  value: number | string;
  /** Label/title for the stat */
  label: string;
  /** Optional description/subtitle below the value */
  description?: string;
  /** Optional icon component from lucide-react */
  icon?: LucideIcon;
  /** Predefined color theme */
  color?: ColorTheme;
  /** Layout variant: 'default' (horizontal) or 'stacked' (vertical like Journey cards) */
  variant?: "default" | "stacked";
  /** Custom gradient classes (overrides color theme) */
  gradient?: string;
  /** Custom icon background classes */
  iconBg?: string;
  /** Custom icon color classes */
  iconColor?: string;
  /** Custom value color classes */
  valueColor?: string;
  /** Custom value size classes (default: text-2xl) */
  valueSize?: string;
  /** Custom label size classes (default: text-xs) */
  labelSize?: string;
  /** Custom description size classes (default: text-xs) */
  descriptionSize?: string;
  /** Custom icon size classes (default: w-5 h-5) */
  iconSize?: string;
  /** Custom icon container size classes (default: p-2.5) */
  iconContainerSize?: string;
  /** Custom icon container border radius (default: rounded-xl for default, rounded-full for stacked) */
  iconContainerRadius?: string;
  /** Additional className for the card */
  className?: string;
  /** Optional click handler */
  onClick?: () => void;
  /** Show loading state */
  loading?: boolean;
  /** Optional trend indicator (shows as small badge) */
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  /** Enable/disable counter animation for numeric values (default: true) */
  animate?: boolean;
  /**
   * Optional formatter function for animated values.
   * Pass a numeric value and this formatter to enable animation with custom formatting.
   * @example formatter={(n) => `₹${n.toLocaleString('en-IN')}`}
   */
  formatter?: (value: number) => string;
}

export function StatCard({
  value,
  label,
  description,
  icon: Icon,
  color = "neutral",
  variant = "default",
  gradient,
  iconBg,
  iconColor,
  valueColor,
  valueSize = "text-2xl",
  labelSize = "text-xs",
  descriptionSize = "text-xs",
  iconSize = "w-5 h-5",
  iconContainerSize = "p-2.5",
  iconContainerRadius,
  className,
  onClick,
  loading = false,
  trend,
  animate = true,
  formatter,
}: StatCardProps) {
  const theme = COLOR_THEMES[color];

  // Animate numeric values (only if animate is true)
  const isNumericValue = typeof value === "number";
  const animatedValue = useCountAnimation(
    isNumericValue && animate ? value : 0,
    1000 // 1.0 seconds animation duration
  );

  // Determine display value:
  // 1. If formatter provided and value is numeric, format the animated value
  // 2. If numeric and animate, show animated value
  // 3. Otherwise show raw value
  let displayValue: string | number;
  if (isNumericValue && animate && formatter) {
    displayValue = formatter(animatedValue);
  } else if (isNumericValue && animate) {
    displayValue = animatedValue;
  } else {
    displayValue = value;
  }

  // Auto-set border radius based on variant
  const defaultRadius = variant === "stacked" ? "rounded-full" : "rounded-xl";
  const finalRadius = iconContainerRadius || defaultRadius;

  const cardClasses = cn(
    "p-4 bg-gradient-to-br",
    gradient || theme.gradient,
    onClick && "cursor-pointer hover:shadow-md transition-shadow",
    className
  );

  const iconContainerClasses = cn(
    iconContainerSize,
    finalRadius,
    iconBg || theme.iconBg
  );

  const iconClasses = cn(iconSize, iconColor || theme.iconColor);

  const valueClasses = cn(
    valueSize,
    "font-bold",
    valueColor || theme.valueColor
  );

  const labelClasses = cn(labelSize, "text-muted-foreground");
  const descriptionClasses = cn(descriptionSize, "text-muted-foreground");

  if (loading) {
    return (
      <Card className={cn("p-2.5 sm:p-4", className)}>
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          <div className="p-1.5 sm:p-2.5 rounded-full bg-muted animate-pulse w-7 h-7 sm:w-10 sm:h-10" />
          <div className="space-y-1 sm:space-y-1.5 flex-1">
            <div className="h-2.5 sm:h-3 w-16 sm:w-20 bg-muted animate-pulse rounded" />
            <div className="h-4 sm:h-6 w-12 sm:w-16 bg-muted animate-pulse rounded" />
            <div className="h-2.5 sm:h-3 w-20 sm:w-24 bg-muted animate-pulse rounded" />
          </div>
        </div>
      </Card>
    );
  }

  // Stacked variant (like Journey Tracking cards) - icon LEFT, value+label RIGHT
  if (variant === "stacked") {
    // Responsive classes for mobile optimization
    const mobileValueClasses = cn(
      "text-base sm:text-lg md:text-2xl", // Smaller on mobile
      "font-bold truncate",
      valueColor || theme.valueColor
    );

    const mobileLabelClasses = cn(
      "text-[10px] sm:text-xs", // Smaller label on mobile
      "text-muted-foreground truncate"
    );

    const mobileDescClasses = cn(
      "text-[10px] sm:text-xs", // Smaller description on mobile
      "text-muted-foreground truncate mt-0.5"
    );

    const mobileIconClasses = cn(
      "w-4 h-4 sm:w-5 sm:h-5", // Smaller icon on mobile
      iconColor || theme.iconColor
    );

    const mobileIconContainerClasses = cn(
      "p-1.5 sm:p-2.5", // Smaller padding on mobile
      finalRadius,
      iconBg || theme.iconBg,
      "flex-shrink-0"
    );

    return (
      <Card className={cn(cardClasses, "p-2.5 sm:p-4")} onClick={onClick}>
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {Icon && (
            <div className={mobileIconContainerClasses}>
              <Icon className={mobileIconClasses} />
            </div>
          )}
          <div className="min-w-0 flex-1 overflow-hidden">
            <p className={mobileLabelClasses}>{label}</p>
            <div className="flex items-baseline gap-1 min-w-0">
              <p className={mobileValueClasses}>{displayValue}</p>
              {trend && (
                <span
                  className={cn(
                    "text-[10px] sm:text-xs font-medium flex-shrink-0",
                    trend.isPositive ? "text-green-500" : "text-red-500"
                  )}
                >
                  {trend.value}
                </span>
              )}
            </div>
            {description && <p className={mobileDescClasses}>{description}</p>}
          </div>
        </div>
      </Card>
    );
  }

  // Default variant (horizontal layout - original style)
  return (
    <Card className={cardClasses} onClick={onClick}>
      <div className="flex items-center gap-3">
        {Icon && (
          <div className={iconContainerClasses}>
            <Icon className={iconClasses} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <p className={valueClasses}>{displayValue}</p>
            {trend && (
              <span
                className={cn(
                  "text-xs font-medium",
                  trend.isPositive ? "text-green-500" : "text-red-500"
                )}
              >
                {trend.value}
              </span>
            )}
          </div>
          <p className={cn(labelClasses, "truncate")}>{label}</p>
          {description && (
            <p className={cn(descriptionClasses, "truncate mt-0.5")}>
              {description}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

/**
 * StatCardGrid Component
 *
 * A responsive grid container for StatCard components.
 * Automatically handles responsive breakpoints.
 *
 * @example
 * ```tsx
 * <StatCardGrid columns={4}>
 *   <StatCard value={125} label="Users" icon={Users} color="blue" />
 *   <StatCard value={89} label="Active" icon={CheckCircle} color="green" />
 * </StatCardGrid>
 * ```
 */
export interface StatCardGridProps {
  children: React.ReactNode;
  /** Number of columns on large screens (default: 4) */
  columns?: 2 | 3 | 4 | 5 | 6;
  /** Custom gap size (default: gap-4) */
  gap?: string;
  /** Additional className */
  className?: string;
}

export function StatCardGrid({
  children,
  columns = 4,
  gap = "gap-2 sm:gap-4",
  className,
}: StatCardGridProps) {
  const gridColsClass = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-4",
    5: "md:grid-cols-3 lg:grid-cols-5",
    6: "md:grid-cols-3 lg:grid-cols-6",
  }[columns];

  return (
    <div
      className={cn(
        "grid grid-cols-2", // 2 columns on mobile
        gridColsClass,
        gap,
        className
      )}
    >
      {children}
    </div>
  );
}
