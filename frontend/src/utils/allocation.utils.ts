/**
 * Allocation Utilities
 *
 * Helper functions for working with cab allocations and seat assignments.
 * These utilities handle the conversion between backend position numbers (1-7)
 * and frontend seat IDs (F1, M1-M3, B1-B3) used in the vehicle viewer component.
 */

import type { AssignedStudent, SeatPosition } from "@/types/allocation.types";

/**
 * Maps position numbers (1-7) to seat IDs
 */
export const POSITION_TO_SEAT_ID: Record<number, SeatPosition> = {
  1: "F1", // Front seat (passenger side)
  2: "M1", // Middle row, left
  3: "M2", // Middle row, center
  4: "M3", // Middle row, right
  5: "B1", // Back row, left
  6: "B2", // Back row, center
  7: "B3", // Back row, right
};

/**
 * Maps seat IDs to position numbers
 */
export const SEAT_ID_TO_POSITION: Record<SeatPosition, number> = {
  F1: 1,
  M1: 2,
  M2: 3,
  M3: 4,
  B1: 5,
  B2: 6,
  B3: 7,
};

/**
 * Converts an array of assigned students to a seat map for VehicleSeatViewer
 * @param students - Array of students with seat_position property
 * @returns Object mapping seat IDs to student objects
 */
export function mapStudentsToSeats(
  students: AssignedStudent[]
): Partial<Record<SeatPosition, AssignedStudent>> {
  return students.reduce(
    (acc, student) => {
      const position =
        typeof student.seat_position === "number"
          ? student.seat_position
          : parseInt(student.seat_position?.toString() || "0", 10);

      const seatId = POSITION_TO_SEAT_ID[position];
      if (seatId) {
        acc[seatId] = student;
      }
      return acc;
    },
    {} as Partial<Record<SeatPosition, AssignedStudent>>
  );
}

/**
 * Gets the seat ID for a given position number
 * @param position - Position number (1-7)
 * @returns Seat ID or undefined if invalid position
 */
export function getSeatIdFromPosition(
  position: number | string
): SeatPosition | undefined {
  const pos = typeof position === "number" ? position : parseInt(position, 10);
  return POSITION_TO_SEAT_ID[pos];
}

/**
 * Gets the position number for a given seat ID
 * @param seatId - Seat ID (F1, M1, M2, M3, B1, B2, B3)
 * @returns Position number (1-7)
 */
export function getPositionFromSeatId(seatId: SeatPosition): number {
  return SEAT_ID_TO_POSITION[seatId];
}
