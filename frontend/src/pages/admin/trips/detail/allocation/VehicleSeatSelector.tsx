import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Lock, User } from "lucide-react";
import type { StudentOption, SeatAssignments } from "@/types/allocation.types";

const VIEWBOX = { w: 300, h: 420 };

type SeatPosition = keyof SeatAssignments;

type SeatMeta = {
  id: SeatPosition;
  label: string;
  x: number;
  y: number;
  rot?: number;
  size?: "lg" | "sm";
};

interface VehicleSeatSelectorProps {
  seats: SeatAssignments;
  availableStudents: StudentOption[];
  onSeatChange: (seatId: SeatPosition, userId: string | null) => void;
}

export function VehicleSeatSelector({
  seats,
  availableStudents,
  onSeatChange,
}: VehicleSeatSelectorProps) {
  const driverSeat = { x: 192, y: 130, rot: 6 };

  const passengerSeats: SeatMeta[] = [
    { id: "F1", label: "F1", x: 108, y: 130, rot: -6, size: "lg" },
    { id: "M1", label: "M1", x: 112, y: 230, size: "sm" },
    { id: "M2", label: "M2", x: 150, y: 230, size: "sm" },
    { id: "M3", label: "M3", x: 188, y: 230, size: "sm" },
    { id: "B1", label: "B1", x: 112, y: 290, size: "sm" },
    { id: "B2", label: "B2", x: 150, y: 290, size: "sm" },
    { id: "B3", label: "B3", x: 188, y: 290, size: "sm" },
  ];

  const getAssignedStudent = (seatId: SeatPosition) => {
    const userId = seats[seatId];
    return availableStudents.find((s) => s.user_id === userId);
  };

  const assignedCount = Object.values(seats).filter(Boolean).length;
  const totalPassengerSeats = passengerSeats.length;

  return (
    <div className="w-full max-w-[520px] mx-auto">
      {/* Stats Badge */}
      <div className="flex justify-center gap-3 mb-4 flex-wrap">
        <Badge variant="secondary" className="text-sm">
          {assignedCount} / {totalPassengerSeats} seats assigned
        </Badge>
        <Badge variant="outline" className="text-sm flex items-center gap-1">
          <Lock className="w-3.5 h-3.5" />
          Driver locked
        </Badge>
      </div>

      {/* Vehicle container */}
      <div className="relative mx-auto w-full aspect-[300/420] rounded-2xl overflow-hidden border border-border/60 bg-gradient-to-b from-muted/10 to-background">
        <div className="absolute inset-0 opacity-60 pointer-events-none [background:radial-gradient(800px_420px_at_50%_18%,rgba(255,255,255,0.12),transparent_60%),radial-gradient(520px_320px_at_30%_70%,rgba(255,255,255,0.08),transparent_62%),repeating-linear-gradient(90deg,rgba(255,255,255,0.04)_0_10px,transparent_10px_20px)]" />

        {/* Realistic Omni/Van SVG */}
        <svg viewBox="0 0 300 420" className="w-full h-full drop-shadow-2xl">
          <defs>
            <linearGradient id="paint" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#d8dde6" />
              <stop offset="0.25" stopColor="#aeb7c7" />
              <stop offset="0.55" stopColor="#7f8aa0" />
              <stop offset="1" stopColor="#636e84" />
            </linearGradient>
            <linearGradient id="paintHi" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0" stopColor="#ffffff" stopOpacity="0.55" />
              <stop offset="0.35" stopColor="#ffffff" stopOpacity="0.12" />
              <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="glass" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#3b5a80" stopOpacity="0.85" />
              <stop offset="1" stopColor="#0b1220" stopOpacity="0.95" />
            </linearGradient>
            <linearGradient id="glassRef" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0" stopColor="#ffffff" stopOpacity="0.25" />
              <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.05" />
              <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="floor" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#111827" stopOpacity="0.35" />
              <stop offset="1" stopColor="#111827" stopOpacity="0.10" />
            </linearGradient>
            <filter id="outerShadow" x="-25%" y="-25%" width="150%" height="150%">
              <feDropShadow dx="0" dy="14" stdDeviation="12" floodOpacity="0.38" />
            </filter>
          </defs>

          {/* Wheels */}
          <g opacity="0.98">
            <rect x="18" y="80" width="28" height="75" rx="14" fill="#0a0f1a" />
            <rect x="21" y="88" width="22" height="59" rx="11" fill="#111827" />
            <rect x="24" y="95" width="16" height="45" rx="8" fill="#1f2937" />
            <rect x="254" y="80" width="28" height="75" rx="14" fill="#0a0f1a" />
            <rect x="257" y="88" width="22" height="59" rx="11" fill="#111827" />
            <rect x="260" y="95" width="16" height="45" rx="8" fill="#1f2937" />
            <rect x="18" y="265" width="28" height="75" rx="14" fill="#0a0f1a" />
            <rect x="21" y="273" width="22" height="59" rx="11" fill="#111827" />
            <rect x="24" y="280" width="16" height="45" rx="8" fill="#1f2937" />
            <rect x="254" y="265" width="28" height="75" rx="14" fill="#0a0f1a" />
            <rect x="257" y="273" width="22" height="59" rx="11" fill="#111827" />
            <rect x="260" y="280" width="16" height="45" rx="8" fill="#1f2937" />
          </g>

          {/* Body */}
          <g filter="url(#outerShadow)">
            <path
              d="M94,15
                 Q150,5 206,15
                 Q244,23 250,60
                 L250,360
                 Q244,397 206,407
                 Q150,417 94,407
                 Q56,397 50,360
                 L50,60
                 Q56,23 94,15 Z"
              fill="url(#paint)"
            />
            <path
              d="M94,15
                 Q150,5 206,15
                 Q244,23 250,60
                 L250,360
                 Q244,397 206,407
                 Q150,417 94,407
                 Q56,397 50,360
                 L50,60
                 Q56,23 94,15 Z"
              fill="none"
              stroke="#e5e7eb"
              strokeOpacity="0.35"
            />
            <path
              d="M76,50
                 Q150,25 224,55
                 L224,350
                 Q150,390 76,358 Z"
              fill="url(#paintHi)"
              opacity="0.55"
            />
          </g>

          {/* Wheel arches */}
          <g opacity="0.25">
            <path d="M52 92 Q66 80 86 83 L86 150 Q66 153 52 138 Z" fill="#0b1220" />
            <path d="M248 92 Q234 80 214 83 L214 150 Q234 153 248 138 Z" fill="#0b1220" />
            <path d="M52 277 Q66 265 86 268 L86 335 Q66 338 52 323 Z" fill="#0b1220" />
            <path d="M248 277 Q234 265 214 268 L214 335 Q234 338 248 323 Z" fill="#0b1220" />
          </g>

          {/* Cabin floor */}
          <path
            d="M92 100
               Q150 80 208 100
               Q224 106 226 122
               L226 328
               Q224 344 208 352
               Q150 372 92 352
               Q76 344 74 328
               L74 122
               Q76 106 92 100 Z"
            fill="url(#floor)"
            opacity="0.9"
          />

          {/* Windshield */}
          <g>
            <path
              d="M92 52
                 Q150 28 208 52
                 L214 110
                 Q150 94 86 110 Z"
              fill="url(#glass)"
              stroke="#cbd5e1"
              strokeOpacity="0.18"
            />
            <path
              d="M102 58
                 Q150 38 198 58
                 L201 80
                 Q150 68 99 80 Z"
              fill="url(#glassRef)"
              opacity="0.8"
            />
          </g>

          {/* Rear glass */}
          <g>
            <path
              d="M104 326
                 Q150 312 196 326
                 L196 380
                 Q150 394 104 380 Z"
              fill="url(#glass)"
              opacity="0.92"
              stroke="#cbd5e1"
              strokeOpacity="0.16"
            />
            <path
              d="M114 332
                 Q150 322 186 332
                 L186 342
                 Q150 336 114 342 Z"
              fill="url(#glassRef)"
              opacity="0.55"
            />
          </g>

          {/* Door seams + handles */}
          <g opacity="0.30" stroke="#0b1220" strokeWidth="2">
            <path d="M82 138 L82 308" />
            <path d="M218 138 L218 308" />
            <path d="M110 130 L190 130" />
            <path d="M110 318 L190 318" />
          </g>
          <g opacity="0.55" fill="#111827">
            <rect x="72" y="203" width="12" height="28" rx="6" />
            <rect x="216" y="203" width="12" height="28" rx="6" />
          </g>

          {/* Lights */}
          <g opacity="0.9">
            <rect x="78" y="23" width="34" height="10" rx="5" fill="#e5e7eb" opacity="0.65" />
            <rect x="188" y="23" width="34" height="10" rx="5" fill="#e5e7eb" opacity="0.65" />
            <rect x="78" y="395" width="34" height="10" rx="5" fill="#fb7185" opacity="0.65" />
            <rect x="188" y="395" width="34" height="10" rx="5" fill="#fb7185" opacity="0.65" />
          </g>

          {/* Dashboard + steering */}
          <g>
            <rect x="92" y="108" width="116" height="14" rx="7" fill="#0b1220" opacity="0.35" />
            <circle cx="192" cy="120" r="10" fill="none" stroke="#0b1220" strokeWidth="3" opacity="0.85" />
            <circle cx="192" cy="120" r="3" fill="#0b1220" opacity="0.85" />
          </g>
        </svg>

        {/* Overlay seats */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Driver (fixed/locked) */}
          <div
            className="absolute pointer-events-none"
            style={{
              left: `${(driverSeat.x / VIEWBOX.w) * 100}%`,
              top: `${(driverSeat.y / VIEWBOX.h) * 100}%`,
              transform: `translate(-50%, -50%) rotate(${driverSeat.rot}deg)`,
            }}
          >
            <DriverSeat size="lg" />
          </div>

          {/* Passengers */}
          {passengerSeats.map((s) => (
            <div
              key={s.id}
              className="absolute pointer-events-auto"
              style={{
                left: `${(s.x / VIEWBOX.w) * 100}%`,
                top: `${(s.y / VIEWBOX.h) * 100}%`,
                transform: `translate(-50%, -50%) rotate(${s.rot ?? 0}deg)`,
              }}
            >
              <SeatButton
                seatId={s.id}
                label={s.label}
                student={getAssignedStudent(s.id)}
                availableStudents={availableStudents}
                onSelect={(userId) => onSeatChange(s.id, userId)}
                currentValue={seats[s.id]}
                small={s.size === "sm"}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground mt-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-emerald-500/20 border-2 border-emerald-500" />
          <span>Assigned</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-muted border-2 border-border" />
          <span>Available</span>
        </div>
      </div>
    </div>
  );
}

function SeatButton({
  seatId,
  label,
  student,
  availableStudents,
  onSelect,
  currentValue,
  small = false,
}: {
  seatId: string;
  label: string;
  student: StudentOption | undefined;
  availableStudents: StudentOption[];
  onSelect: (userId: string | null) => void;
  currentValue: string | null;
  small?: boolean;
}) {
  const isAssigned = !!student;
  const outer = small ? "w-[58px] h-[56px]" : "w-[66px] h-[64px]";
  const back = small ? "w-[44px] h-[14px]" : "w-[50px] h-[16px]";
  const head = small ? "w-[20px] h-[10px]" : "w-[22px] h-[12px]";
  const avatar = small ? "w-6 h-6 text-[10px]" : "w-7 h-7 text-[11px]";
  const text = small ? "text-[10px]" : "text-[11px]";

  return (
    <Select value={currentValue || "none"} onValueChange={onSelect}>
      <SelectTrigger className="p-0 border-0 bg-transparent shadow-none focus:ring-0 focus:ring-offset-0">
        <div
          className={[
            "relative",
            outer,
            "rounded-2xl border transition-all duration-200",
            "shadow-xl",
            "bg-gradient-to-b from-muted/70 to-muted/35",
            "hover:scale-[1.04] active:scale-[0.98]",
            isAssigned
              ? "border-emerald-500/70 ring-2 ring-emerald-500/15"
              : "border-border/70 hover:border-border",
          ].join(" ")}
          aria-label={`Seat ${seatId}`}
        >
          {/* Backrest */}
          <div
            className={[
              "absolute left-1/2 -top-3 -translate-x-1/2 rounded-full border shadow-md",
              "bg-gradient-to-b from-muted/80 to-muted/35",
              back,
              isAssigned ? "border-emerald-500/50" : "border-border/60",
            ].join(" ")}
          />
          {/* Headrest */}
          <div
            className={[
              "absolute left-1/2 -top-6 -translate-x-1/2 rounded-full border shadow-sm",
              "bg-gradient-to-b from-muted/90 to-muted/45",
              head,
              isAssigned ? "border-emerald-500/50" : "border-border/60",
            ].join(" ")}
          />
          {/* Cushion shine */}
          <div className="absolute inset-0 rounded-2xl pointer-events-none [background:radial-gradient(40px_24px_at_35%_25%,rgba(255,255,255,0.18),transparent_60%)]" />

          {/* Content */}
          <div className="relative z-10 h-full w-full flex flex-col items-center justify-center gap-1 pt-2">
            {isAssigned ? (
              <>
                <Avatar className={avatar}>
                  <AvatarImage src={student.profile_picture || undefined} />
                  <AvatarFallback className="bg-emerald-500 text-emerald-950 font-extrabold text-xs">
                    {student.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .substring(0, 2)
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span
                  className={[
                    text,
                    "font-semibold text-foreground/90 max-w-[52px] truncate",
                  ].join(" ")}
                >
                  {student.name.split(" ")[0]}
                </span>
              </>
            ) : (
              <>
                <User
                  className={[
                    small ? "w-4 h-4" : "w-5 h-5",
                    "text-muted-foreground",
                  ].join(" ")}
                />
                <span
                  className={[text, "font-medium text-muted-foreground"].join(
                    " "
                  )}
                >
                  {label}
                </span>
              </>
            )}
          </div>
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">
          <span className="text-muted-foreground">Empty Seat</span>
        </SelectItem>
        {availableStudents.map((availableStudent) => (
          <SelectItem key={availableStudent.user_id} value={availableStudent.user_id}>
            <div className="flex items-center gap-2">
              <Avatar className="w-6 h-6">
                <AvatarImage src={availableStudent.profile_picture || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                  {availableStudent.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .substring(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm">{availableStudent.name}</span>
                <span className="text-xs text-muted-foreground">
                  {availableStudent.hall}
                </span>
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function DriverSeat({ size = "lg" }: { size?: "lg" | "sm" }) {
  const outer = size === "sm" ? "w-[58px] h-[56px]" : "w-[66px] h-[64px]";
  const back = size === "sm" ? "w-[44px] h-[14px]" : "w-[50px] h-[16px]";
  const head = size === "sm" ? "w-[20px] h-[10px]" : "w-[22px] h-[12px]";
  const text = size === "sm" ? "text-[10px]" : "text-[11px]";

  return (
    <div
      className={[
        "relative",
        outer,
        "rounded-2xl border border-border/60 bg-muted/40 shadow-xl opacity-90",
      ].join(" ")}
    >
      <div
        className={[
          "absolute left-1/2 -top-3 -translate-x-1/2 rounded-full border border-border/60 bg-muted/50 shadow-md",
          back,
        ].join(" ")}
      />
      <div
        className={[
          "absolute left-1/2 -top-6 -translate-x-1/2 rounded-full border border-border/60 bg-muted/60 shadow-sm",
          head,
        ].join(" ")}
      />
      <div className="absolute inset-0 rounded-2xl pointer-events-none [background:radial-gradient(40px_24px_at_35%_25%,rgba(255,255,255,0.14),transparent_60%)]" />
      <div className="relative z-10 h-full w-full flex flex-col items-center justify-center gap-1 pt-2">
        <div className="w-7 h-7 rounded-full bg-muted-foreground/20 flex items-center justify-center">
          <Lock className="w-4 h-4 text-muted-foreground" />
        </div>
        <span className={[text, "font-semibold text-muted-foreground"].join(" ")}>
          Driver
        </span>
      </div>
    </div>
  );
}
