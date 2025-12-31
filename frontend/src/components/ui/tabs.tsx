import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

interface TabsListProps extends React.ComponentPropsWithoutRef<
  typeof TabsPrimitive.List
> {
  rounded?: boolean;
}

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  TabsListProps
>(({ className, rounded = false, ...props }, ref) => {
  const localRef = React.useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = React.useState({
    left: 0,
    width: 0,
  });

  const updateIndicator = React.useCallback(() => {
    const container = localRef.current;
    if (container) {
      const active = container.querySelector(
        '[data-state="active"]'
      ) as HTMLElement;
      if (active) {
        const containerRect = container.getBoundingClientRect();
        const activeRect = active.getBoundingClientRect();
        setIndicatorStyle({
          left: activeRect.left - containerRect.left,
          width: activeRect.width,
        });
      }
    }
  }, []);

  React.useEffect(() => {
    // Initial setup
    const timer = setTimeout(updateIndicator, 50);

    const observer = new MutationObserver(updateIndicator);

    if (localRef.current) {
      observer.observe(localRef.current, {
        attributes: true,
        subtree: true,
        attributeFilter: ["data-state"],
      });
    }

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [updateIndicator]);

  return (
    <TabsPrimitive.List
      ref={(node) => {
        localRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      }}
      className={cn(
        "inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground relative",
        className
      )}
      {...props}
    >
      {/* Sliding indicator */}
      <span
        className={cn(
          "absolute h-[calc(100%-8px)] bg-background shadow-sm transition-all duration-300 ease-out pointer-events-none z-0",
          rounded ? "rounded-full" : "rounded-md"
        )}
        style={{
          left: `${indicatorStyle.left}px`,
          width: `${indicatorStyle.width}px`,
          top: "4px",
        }}
      />
      {props.children}
    </TabsPrimitive.List>
  );
});
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-foreground relative z-10",
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
