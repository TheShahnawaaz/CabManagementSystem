import { Moon, Sun, Monitor } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "@/hooks/useTheme";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Tabs
      value={theme}
      onValueChange={(value) => setTheme(value as "light" | "dark" | "system")}
    >
      <TabsList rounded className="rounded-full h-9 p-1">
        <TabsTrigger value="light" className="h-7 w-7 p-0 rounded-full">
          <Sun className="h-4 w-4" />
          <span className="sr-only">Light theme</span>
        </TabsTrigger>
        <TabsTrigger value="dark" className="h-7 w-7 p-0 rounded-full">
          <Moon className="h-4 w-4" />
          <span className="sr-only">Dark theme</span>
        </TabsTrigger>
        <TabsTrigger value="system" className="h-7 w-7 p-0 rounded-full">
          <Monitor className="h-4 w-4" />
          <span className="sr-only">System theme</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

// Full-width version for dropdown menus using Tabs
export function ThemeToggleDropdown() {
  const { theme, setTheme } = useTheme();

  return (
    <Tabs
      value={theme}
      onValueChange={(value) => setTheme(value as "light" | "dark" | "system")}
      className="w-full"
    >
      <TabsList rounded className="grid w-full grid-cols-3 rounded-full h-10">
        <TabsTrigger value="light" className="rounded-full">
          <Sun className="h-4 w-4" />
        </TabsTrigger>
        <TabsTrigger value="dark" className="rounded-full">
          <Moon className="h-4 w-4" />
        </TabsTrigger>
        <TabsTrigger value="system" className="rounded-full">
          <Monitor className="h-4 w-4" />
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
