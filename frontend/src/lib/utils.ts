import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Validates an Indian mobile phone number
 * Must be 10 digits starting with 6-9
 * @param phone - Phone number string (may include non-digit characters)
 * @returns true if valid, false otherwise
 * @example
 * isValidIndianPhone("9876543210") // true
 * isValidIndianPhone("1234567890") // false (starts with 1)
 * isValidIndianPhone("987654321")  // false (9 digits)
 */
export function isValidIndianPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, "");
  return /^[6-9]\d{9}$/.test(cleaned);
}

/**
 * Formats a 10-digit Indian phone number with +91 country code
 * @param phone - 10-digit phone number string (without country code)
 * @param fallback - Text to display if phone is not provided (default: "Not provided")
 * @returns Formatted phone number as "+91 XXXXX XXXXX" or fallback text
 * @example
 * formatPhoneNumber("9876543210") // "+91 98765 43210"
 * formatPhoneNumber(null) // "Not provided"
 * formatPhoneNumber(null, "N/A") // "N/A"
 */
export function formatPhoneNumber(
  phone?: string | null,
  fallback: string = "Not provided"
): string {
  if (!phone) return fallback;
  return `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`;
}
