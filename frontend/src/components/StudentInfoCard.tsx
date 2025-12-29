import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Mail, Phone, Car, Armchair } from "lucide-react";
import { formatPhoneNumber } from "@/lib/utils";

// Hall color mapping
const HALL_COLORS: Record<
  string,
  { avatar: string; text: string; badge: string }
> = {
  RK: {
    avatar: "bg-blue-500",
    text: "text-blue-950 dark:text-blue-50",
    badge: "text-blue-500",
  },
  VS: {
    avatar: "bg-purple-500",
    text: "text-purple-950 dark:text-purple-50",
    badge: "text-purple-500",
  },
  LBS: {
    avatar: "bg-green-500",
    text: "text-green-950 dark:text-green-50",
    badge: "text-green-500",
  },
  PAN: {
    avatar: "bg-orange-500",
    text: "text-orange-950 dark:text-orange-50",
    badge: "text-orange-500",
  },
  MS: {
    avatar: "bg-pink-500",
    text: "text-pink-950 dark:text-pink-50",
    badge: "text-pink-500",
  },
  HJB: {
    avatar: "bg-cyan-500",
    text: "text-cyan-950 dark:text-cyan-50",
    badge: "text-cyan-500",
  },
  LLR: {
    avatar: "bg-amber-500",
    text: "text-amber-950 dark:text-amber-50",
    badge: "text-amber-500",
  },
};

export interface StudentInfo {
  user_id: string;
  name: string;
  email: string;
  hall: string;
  profile_picture?: string | null;
  phone_number?: string | null;
  seat_position?: number | string;
  allocated_cab_number?: string;
  allocated_cab_region?: string;
}

interface StudentInfoCardProps {
  student: StudentInfo;
  /** Show email row */
  showEmail?: boolean;
  /** Show phone row */
  showPhone?: boolean;
  /** Show seat position row */
  showSeat?: boolean;
  /** Show allocated cab info */
  showAllocatedCab?: boolean;
  /** Compact mode - smaller avatar and less padding */
  compact?: boolean;
  /** Custom className for the wrapper */
  className?: string;
}

export function StudentInfoCard({
  student,
  showEmail = true,
  showPhone = true,
  showSeat = false,
  showAllocatedCab = false,
  compact = false,
  className = "",
}: StudentInfoCardProps) {
  const hallColors = HALL_COLORS[student.hall] || {
    avatar: "bg-gray-500",
    text: "text-gray-950 dark:text-gray-50",
    badge: "text-gray-500",
  };

  const initials = student.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <Item variant="outline" className={`${compact ? "py-2" : ""} ${className}`}>
      <ItemMedia>
        <Avatar className={compact ? "h-10 w-10" : "h-12 w-12"}>
          <AvatarImage
            src={student.profile_picture || undefined}
            alt={student.name}
          />
          <AvatarFallback
            className={`${hallColors.avatar} ${hallColors.text} ${compact ? "text-xs" : "text-sm"} font-bold`}
          >
            {initials}
          </AvatarFallback>
        </Avatar>
      </ItemMedia>

      <ItemContent>
        <ItemTitle className="line-clamp-1 flex items-center gap-2">
          {student.name}
          <Badge
            variant="secondary"
            className={`${hallColors.badge} text-xs font-semibold`}
          >
            {student.hall}
          </Badge>
        </ItemTitle>
        <ItemDescription className="space-y-0.5 mt-1">
          {showEmail && (
            <div className="flex items-center gap-1.5 text-xs">
              <Mail className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{student.email}</span>
            </div>
          )}

          {showPhone && student.phone_number && (
            <div className="flex items-center gap-1.5 text-xs">
              <Phone className="w-3 h-3 flex-shrink-0" />
              <span>{formatPhoneNumber(student.phone_number)}</span>
            </div>
          )}

          {showSeat && student.seat_position && (
            <div className="flex items-center gap-1.5 text-xs">
              <Armchair className="w-3 h-3 flex-shrink-0" />
              <span className="font-mono font-medium">
                Seat {student.seat_position}
              </span>
            </div>
          )}

          {showAllocatedCab && student.allocated_cab_number && (
            <div className="flex items-center gap-1.5 text-xs">
              <Car className="w-3 h-3 flex-shrink-0" />
              <span className="font-medium">
                {student.allocated_cab_number}
                {student.allocated_cab_region && (
                  <span className="text-muted-foreground ml-1">
                    ({student.allocated_cab_region})
                  </span>
                )}
              </span>
            </div>
          )}
        </ItemDescription>
      </ItemContent>
    </Item>
  );
}
