import { Car, Users, Eye, Edit, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@/components/ui/item";
import type { CabAllocation } from "@/types/allocation.types";

interface CabListProps {
  cabs: CabAllocation[];
  onEditCab: (cab: CabAllocation) => void;
  onViewStudents: (cab: CabAllocation) => void;
}

export function CabList({ cabs, onEditCab, onViewStudents }: CabListProps) {
  if (cabs.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Car className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium">No cabs added yet</p>
        <p className="text-sm mt-2">
          Run allocation to generate cab assignments
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <ItemGroup>
        {cabs.map((cab, index) => (
          <div key={cab.id || cab.temp_id}>
            <Item className="p-3 sm:p-4 hover:bg-muted/50 transition-colors">
              {/* Cab Icon/Avatar */}
              <ItemMedia>
                <Avatar className="h-12 w-12 sm:h-14 sm:w-14">
                  <AvatarFallback className="bg-blue-500/10 text-blue-600">
                    <Car className="w-5 h-5 sm:w-6 sm:h-6" />
                  </AvatarFallback>
                </Avatar>
              </ItemMedia>

              {/* Cab Details */}
              <ItemContent className="gap-1 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <ItemTitle className="text-base sm:text-lg font-bold">
                    {cab.cab_number || `Cab ${index + 1}`}
                  </ItemTitle>
                  <Badge variant="secondary" className="text-xs">
                    {cab.pickup_region}
                  </Badge>
                </div>

                <ItemDescription className="text-xs sm:text-sm">
                  {cab.driver_name || (
                    <span className="text-destructive italic">
                      Driver name required
                    </span>
                  )}
                </ItemDescription>

                {/* Mobile: Show stats inline */}
                <div className="flex items-center gap-3 mt-1 sm:hidden">
                  <div className="flex items-center gap-1 text-xs">
                    <Users className="w-3 h-3" />
                    <span className="font-medium">
                      {cab.assigned_students.length}/{cab.capacity}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span className="font-mono">🔑 {cab.passkey}</span>
                  </div>
                </div>

                {/* Desktop: Show additional details */}
                <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground mt-1">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>Region: {cab.pickup_region}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-mono">Passkey: {cab.passkey}</span>
                  </div>
                </div>
              </ItemContent>

              {/* Stats & Actions */}
              <ItemContent className="flex-none items-end gap-2">
                {/* Desktop: Show seat badge */}
                <div className="hidden sm:block">
                  <Badge
                    variant={
                      cab.assigned_students.length === cab.capacity
                        ? "default"
                        : cab.assigned_students.length === 0
                          ? "outline"
                          : "secondary"
                    }
                    className="font-mono"
                  >
                    {cab.assigned_students.length}/{cab.capacity} seats
                  </Badge>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-1 sm:gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewStudents(cab)}
                    className="h-8 px-2 sm:px-3"
                  >
                    <Eye className="w-4 h-4 sm:mr-1" />
                    <span className="hidden sm:inline">View</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditCab(cab)}
                    className="h-8 px-2 sm:px-3"
                  >
                    <Edit className="w-4 h-4 sm:mr-1" />
                    <span className="hidden sm:inline">Edit</span>
                  </Button>
                </div>
              </ItemContent>
            </Item>
            {index !== cabs.length - 1 && <ItemSeparator />}
          </div>
        ))}
      </ItemGroup>
    </div>
  );
}
