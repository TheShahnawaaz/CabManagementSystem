/**
 * Quick Actions Component (Reusable)
 *
 * Professional collapsible action buttons for common tasks
 * Can be used in both user and admin dashboards
 */

import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";

export interface QuickAction {
  label: string;
  description: string;
  icon: LucideIcon;
  href: string;
}

interface QuickActionsProps {
  title?: string;
  titleIcon?: LucideIcon;
  actions: QuickAction[];
  defaultOpen?: boolean;
}

export function QuickActions({
  title = "Quick Actions",
  titleIcon: TitleIcon,
  actions,
  defaultOpen = true,
}: QuickActionsProps) {
  return (
    <Card>
      <Accordion
        type="single"
        collapsible
        defaultValue={defaultOpen ? "quick-actions" : undefined}
      >
        <AccordionItem value="quick-actions" className="border-none">
          <AccordionTrigger className="px-6 py-3 hover:no-underline">
            <div className="flex items-center gap-2">
              {TitleIcon && <TitleIcon className="h-5 w-5 text-primary" />}
              <h2 className="text-lg font-semibold">{title}</h2>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-0">
              {actions.map((action) => (
                <Link key={action.label} to={action.href} className="block">
                  <Button
                    variant="outline"
                    className="w-full h-auto p-4 justify-start items-start flex-col gap-2 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-2 w-full">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <action.icon className="h-4 w-4" />
                      </div>
                      <span className="font-semibold text-sm flex-1 text-left">
                        {action.label}
                      </span>
                      <ArrowRight className="h-4 w-4 opacity-50" />
                    </div>
                    <p className="text-xs text-muted-foreground font-normal text-left w-full">
                      {action.description}
                    </p>
                  </Button>
                </Link>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}
