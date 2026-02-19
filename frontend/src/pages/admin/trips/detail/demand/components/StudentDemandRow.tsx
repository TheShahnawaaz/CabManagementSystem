import { Phone } from "lucide-react";
import { format } from "date-fns";
import { formatPhoneNumber } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import {
  HALL_AVATAR_BORDER_COLORS,
  HALL_AVATAR_RING_GRADIENTS,
  HALL_BADGE_CLASSES,
} from "../../hallColors";
import type { StudentDemandWithHall } from "../types";

export function StudentDemandRow({
  student,
  showHallInline = false,
}: {
  student: StudentDemandWithHall;
  showHallInline?: boolean;
}) {
  return (
    <Item className="p-4">
      <ItemMedia>
        <div
          className="rounded-full p-[3px]"
          style={{
            background:
              HALL_AVATAR_RING_GRADIENTS[student.hall] ||
              "linear-gradient(135deg, #d1d5db, #9ca3af)",
          }}
        >
          <Avatar
            className="h-14 w-14 border-2 border-background"
            style={{
              boxShadow: `0 0 0 1px ${HALL_AVATAR_BORDER_COLORS[student.hall] || "#9ca3af"}40`,
            }}
          >
            <AvatarImage src={student.profile_picture || undefined} />
            <AvatarFallback className="text-xl">
              {student.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      </ItemMedia>
      <ItemContent className="gap-0.5">
        <div className="flex items-center gap-2">
          <ItemTitle className="text-base font-semibold">{student.name}</ItemTitle>
          {showHallInline && (
            <Badge
              variant="outline"
              className={`text-[10px] h-5 px-1.5 ${HALL_BADGE_CLASSES[student.hall] || "bg-gray-500/10 text-gray-700 border-gray-400/30 dark:text-gray-300"}`}
            >
              {student.hall}
            </Badge>
          )}
        </div>
        <ItemDescription className="text-sm">{student.email}</ItemDescription>
        <ItemDescription className="text-sm flex items-center gap-2">
          <Phone className="w-3 h-3 text-muted-foreground" />
          <a
            href={`tel:${student.phone_number}`}
            className="hover:text-primary hover:underline"
          >
            {formatPhoneNumber(student.phone_number)}
          </a>
        </ItemDescription>
        <ItemDescription className="text-xs mt-1 text-muted-foreground">
          Booked: {format(new Date(student.created_at), "dd MMM yyyy, HH:mm")}
        </ItemDescription>
      </ItemContent>
      <ItemContent className="flex-none items-end">
        <Badge variant="outline" className="font-mono text-xs">
          #{student.booking_id}
        </Badge>
      </ItemContent>
    </Item>
  );
}
