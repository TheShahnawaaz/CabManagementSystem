"use client"

import { useMemo, useState } from "react"

import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check, Lock, User, Users } from "lucide-react"
import { Link } from "react-router-dom"

type User = {
  id: string
  name: string
  avatar: string
}

const availableUsers: User[] = [
  { id: "1", name: "John Smith", avatar: "JS" },
  { id: "2", name: "Sarah Johnson", avatar: "SJ" },
  { id: "3", name: "Mike Davis", avatar: "MD" },
  { id: "4", name: "Emily Chen", avatar: "EC" },
  { id: "5", name: "Alex Turner", avatar: "AT" },
  { id: "6", name: "Lisa Park", avatar: "LP" },
  { id: "7", name: "David Kim", avatar: "DK" },
  { id: "8", name: "Rachel Green", avatar: "RG" },
  { id: "9", name: "Tom Wilson", avatar: "TW" },
  { id: "10", name: "Anna Lee", avatar: "AL" },
]

type PassengerSeatId =
  | "frontPassenger"
  | "mid1"
  | "mid2"
  | "mid3"
  | "back1"
  | "back2"
  | "back3"

type SeatAssignment = Record<PassengerSeatId, string | null>

type SeatMeta = {
  id: PassengerSeatId
  label: string
  x: number // SVG coords 0..300
  y: number // SVG coords 0..520
  rot?: number
  size?: "lg" | "sm"
}

const VIEWBOX = { w: 300, h: 520 }

export default function VehiclePage() {
  const [seatAssignments, setSeatAssignments] = useState<SeatAssignment>({
    frontPassenger: null,
    mid1: null,
    mid2: null,
    mid3: null,
    back1: null,
    back2: null,
    back3: null,
  })

  // Driver seat (fixed / locked)
  const driverSeat = useMemo(() => ({ x: 192, y: 165, rot: 6 }), [])

  // Passenger layout: 1 + 3 + 3
  const passengerSeats: SeatMeta[] = useMemo(
    () => [
      // Front passenger (1)
      { id: "frontPassenger", label: "Front", x: 108, y: 165, rot: -6, size: "lg" },
      // Middle row (3)
      { id: "mid1", label: "M1", x: 112, y: 285, size: "sm" },
      { id: "mid2", label: "M2", x: 150, y: 285, size: "sm" },
      { id: "mid3", label: "M3", x: 188, y: 285, size: "sm" },
      // Back row (3)
      { id: "back1", label: "B1", x: 112, y: 350, size: "sm" },
      { id: "back2", label: "B2", x: 150, y: 350, size: "sm" },
      { id: "back3", label: "B3", x: 188, y: 350, size: "sm" },
    ],
    []
  )

  const handleSeatChange = (seatId: PassengerSeatId, userId: string | null) => {
    setSeatAssignments((prev) => ({
      ...prev,
      [seatId]: userId === "none" ? null : userId,
    }))
  }

  const getAssignedUser = (seatId: PassengerSeatId) => {
    const userId = seatAssignments[seatId]
    return availableUsers.find((u) => u.id === userId)
  }

  const getAvailableUsersForSeat = (currentSeatId: PassengerSeatId) => {
    const assignedUserIds = Object.entries(seatAssignments)
      .filter(([seatId, userId]) => seatId !== currentSeatId && userId !== null)
      .map(([, userId]) => userId as string)

    return availableUsers.filter((user) => !assignedUserIds.includes(user.id))
  }

  const assignedCount = Object.values(seatAssignments).filter(Boolean).length
  const totalPassengerSeats = passengerSeats.length // 7

  return (
    <div className="min-h-screen p-8">
      <div className="w-full max-w-5xl mx-auto">
        {/* Back button */}
        <div className="mb-6">
          <Link to="/rough">
            <Button variant="outline">← Back to Rough Pages</Button>
          </Link>
        </div>

        <Card className="bg-card border-border">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
              <Users className="w-6 h-6" />
              Omni Vehicle Reservation
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Driver seat is fixed. Assign passengers to {totalPassengerSeats} seats (1 + 3 + 3).
            </CardDescription>
            <div className="flex justify-center gap-3 mt-4 flex-wrap">
              <Badge variant="secondary" className="text-sm">
                {assignedCount} / {totalPassengerSeats} passenger seats assigned
              </Badge>
              <Badge variant="outline" className="text-sm flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" />
                Driver locked
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {/* Vehicle container */}
            <div className="relative mx-auto w-full max-w-[520px] aspect-[300/520] rounded-2xl overflow-hidden border border-border/60 bg-gradient-to-b from-muted/10 to-background">
              <div className="absolute inset-0 opacity-60 pointer-events-none [background:radial-gradient(800px_420px_at_50%_18%,rgba(255,255,255,0.12),transparent_60%),radial-gradient(520px_320px_at_30%_70%,rgba(255,255,255,0.08),transparent_62%),repeating-linear-gradient(90deg,rgba(255,255,255,0.04)_0_10px,transparent_10px_20px)]" />

              {/* Realistic Omni/Van SVG */}
              <svg viewBox="0 0 300 520" className="w-full h-full drop-shadow-2xl">
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
                  <rect x="18" y="94" width="28" height="88" rx="14" fill="#0a0f1a" />
                  <rect x="21" y="103" width="22" height="70" rx="11" fill="#111827" />
                  <rect x="24" y="111" width="16" height="54" rx="8" fill="#1f2937" />
                  <rect x="254" y="94" width="28" height="88" rx="14" fill="#0a0f1a" />
                  <rect x="257" y="103" width="22" height="70" rx="11" fill="#111827" />
                  <rect x="260" y="111" width="16" height="54" rx="8" fill="#1f2937" />
                  <rect x="18" y="338" width="28" height="88" rx="14" fill="#0a0f1a" />
                  <rect x="21" y="347" width="22" height="70" rx="11" fill="#111827" />
                  <rect x="24" y="355" width="16" height="54" rx="8" fill="#1f2937" />
                  <rect x="254" y="338" width="28" height="88" rx="14" fill="#0a0f1a" />
                  <rect x="257" y="347" width="22" height="70" rx="11" fill="#111827" />
                  <rect x="260" y="355" width="16" height="54" rx="8" fill="#1f2937" />
                </g>

                {/* Body */}
                <g filter="url(#outerShadow)">
                  <path
                    d="M94,18
                       Q150,6 206,18
                       Q244,28 250,70
                       L250,450
                       Q244,492 206,502
                       Q150,514 94,502
                       Q56,492 50,450
                       L50,70
                       Q56,28 94,18 Z"
                    fill="url(#paint)"
                  />
                  <path
                    d="M94,18
                       Q150,6 206,18
                       Q244,28 250,70
                       L250,450
                       Q244,492 206,502
                       Q150,514 94,502
                       Q56,492 50,450
                       L50,70
                       Q56,28 94,18 Z"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeOpacity="0.35"
                  />
                  <path
                    d="M76,60
                       Q150,30 224,70
                       L224,430
                       Q150,480 76,442 Z"
                    fill="url(#paintHi)"
                    opacity="0.55"
                  />
                </g>

                {/* Wheel arches */}
                <g opacity="0.25">
                  <path d="M52 110 Q66 95 86 98 L86 175 Q66 178 52 160 Z" fill="#0b1220" />
                  <path d="M248 110 Q234 95 214 98 L214 175 Q234 178 248 160 Z" fill="#0b1220" />
                  <path d="M52 350 Q66 335 86 338 L86 415 Q66 418 52 400 Z" fill="#0b1220" />
                  <path d="M248 350 Q234 335 214 338 L214 415 Q234 418 248 400 Z" fill="#0b1220" />
                </g>

                {/* Cabin floor */}
                <path
                  d="M92 120
                     Q150 96 208 120
                     Q224 128 226 148
                     L226 406
                     Q224 426 208 434
                     Q150 458 92 434
                     Q76 426 74 406
                     L74 148
                     Q76 128 92 120 Z"
                  fill="url(#floor)"
                  opacity="0.9"
                />

                {/* Windshield */}
                <g>
                  <path
                    d="M92 64
                       Q150 34 208 64
                       L214 134
                       Q150 114 86 134 Z"
                    fill="url(#glass)"
                    stroke="#cbd5e1"
                    strokeOpacity="0.18"
                  />
                  <path
                    d="M102 70
                       Q150 46 198 70
                       L201 98
                       Q150 82 99 98 Z"
                    fill="url(#glassRef)"
                    opacity="0.8"
                  />
                </g>

                {/* Rear glass */}
                <g>
                  <path
                    d="M104 404
                       Q150 386 196 404
                       L196 468
                       Q150 486 104 468 Z"
                    fill="url(#glass)"
                    opacity="0.92"
                    stroke="#cbd5e1"
                    strokeOpacity="0.16"
                  />
                  <path
                    d="M114 412
                       Q150 398 186 412
                       L186 424
                       Q150 416 114 424 Z"
                    fill="url(#glassRef)"
                    opacity="0.55"
                  />
                </g>

                {/* Door seams + handles */}
                <g opacity="0.30" stroke="#0b1220" strokeWidth="2">
                  <path d="M82 170 L82 380" />
                  <path d="M218 170 L218 380" />
                  <path d="M110 160 L190 160" />
                  <path d="M110 392 L190 392" />
                </g>
                <g opacity="0.55" fill="#111827">
                  <rect x="72" y="250" width="12" height="28" rx="6" />
                  <rect x="216" y="250" width="12" height="28" rx="6" />
                </g>

                {/* Lights */}
                <g opacity="0.9">
                  <rect x="78" y="28" width="34" height="10" rx="5" fill="#e5e7eb" opacity="0.65" />
                  <rect x="188" y="28" width="34" height="10" rx="5" fill="#e5e7eb" opacity="0.65" />
                  <rect x="78" y="488" width="34" height="10" rx="5" fill="#fb7185" opacity="0.65" />
                  <rect x="188" y="488" width="34" height="10" rx="5" fill="#fb7185" opacity="0.65" />
                </g>

                {/* Dashboard + steering */}
                <g>
                  <rect x="92" y="132" width="116" height="16" rx="8" fill="#0b1220" opacity="0.35" />
                  <circle cx="192" cy="154" r="11" fill="none" stroke="#0b1220" strokeWidth="3" opacity="0.85" />
                  <circle cx="192" cy="154" r="3" fill="#0b1220" opacity="0.85" />
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
                      user={getAssignedUser(s.id)}
                      availableUsers={getAvailableUsersForSeat(s.id)}
                      onSelect={(userId) => handleSeatChange(s.id, userId)}
                      currentValue={seatAssignments[s.id]}
                      small={s.size === "sm"}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Legend + action */}
            <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-emerald-500/20 border-2 border-emerald-500" />
                  <span>Assigned</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-muted border-2 border-border" />
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-muted/50 border-2 border-border/60" />
                  <span>Driver (locked)</span>
                </div>
              </div>
              <Button className="gap-2" disabled={assignedCount === 0}>
                <Check className="w-4 h-4" />
                Confirm Reservation ({assignedCount} passengers)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function SeatButton({
  seatId,
  label,
  user,
  availableUsers,
  onSelect,
  currentValue,
  small = false,
}: {
  seatId: string
  label: string
  user: User | undefined
  availableUsers: User[]
  onSelect: (userId: string | null) => void
  currentValue: string | null
  small?: boolean
}) {
  const isAssigned = !!user
  const outer = small ? "w-[58px] h-[56px]" : "w-[66px] h-[64px]"
  const back = small ? "w-[44px] h-[14px]" : "w-[50px] h-[16px]"
  const head = small ? "w-[20px] h-[10px]" : "w-[22px] h-[12px]"
  const avatar = small ? "w-6 h-6 text-[10px]" : "w-7 h-7 text-[11px]"
  const text = small ? "text-[10px]" : "text-[11px]"

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
            isAssigned ? "border-emerald-500/70 ring-2 ring-emerald-500/15" : "border-border/70 hover:border-border",
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
                <div className={[avatar, "rounded-full bg-emerald-500 text-emerald-950 flex items-center justify-center font-extrabold shadow"].join(" ")}>
                  {user.avatar}
                </div>
                <span className={[text, "font-semibold text-foreground/90 max-w-[52px] truncate"].join(" ")}>
                  {user.name.split(" ")[0]}
                </span>
              </>
            ) : (
              <>
                <User className={[small ? "w-4 h-4" : "w-5 h-5", "text-muted-foreground"].join(" ")} />
                <span className={[text, "font-medium text-muted-foreground"].join(" ")}>
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
        {availableUsers.map((availableUser) => (
          <SelectItem key={availableUser.id} value={availableUser.id}>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                {availableUser.avatar}
              </div>
              <span>{availableUser.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function DriverSeat({ size = "lg" }: { size?: "lg" | "sm" }) {
  const outer = size === "sm" ? "w-[58px] h-[56px]" : "w-[66px] h-[64px]"
  const back = size === "sm" ? "w-[44px] h-[14px]" : "w-[50px] h-[16px]"
  const head = size === "sm" ? "w-[20px] h-[10px]" : "w-[22px] h-[12px]"
  const text = size === "sm" ? "text-[10px]" : "text-[11px]"

  return (
    <div className={["relative", outer, "rounded-2xl border border-border/60 bg-muted/40 shadow-xl opacity-90"].join(" ")}>
      <div className={["absolute left-1/2 -top-3 -translate-x-1/2 rounded-full border border-border/60 bg-muted/50 shadow-md", back].join(" ")} />
      <div className={["absolute left-1/2 -top-6 -translate-x-1/2 rounded-full border border-border/60 bg-muted/60 shadow-sm", head].join(" ")} />
      <div className="absolute inset-0 rounded-2xl pointer-events-none [background:radial-gradient(40px_24px_at_35%_25%,rgba(255,255,255,0.14),transparent_60%)]" />
      <div className="relative z-10 h-full w-full flex flex-col items-center justify-center gap-1 pt-2">
        <div className="w-7 h-7 rounded-full bg-muted-foreground/20 flex items-center justify-center">
          <Lock className="w-4 h-4 text-muted-foreground" />
        </div>
        <span className={[text, "font-semibold text-muted-foreground"].join(" ")}>Driver</span>
      </div>
    </div>
  )
}

