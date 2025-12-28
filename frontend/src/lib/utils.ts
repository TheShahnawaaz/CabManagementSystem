import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
