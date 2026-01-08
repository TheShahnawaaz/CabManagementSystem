/**
 * Payment API Service
 *
 * Handles all payment-related API calls for Razorpay integration.
 */

import { apiClient } from "@/lib/api";
import type { Hall } from "@/types/booking.types";

// ====================================
// TYPES
// ====================================

export interface CheckoutData {
  paymentId: string;
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  businessName: string;
  businessLogo?: string;
  description: string;
  prefill: {
    name: string;
    email: string;
    contact?: string;
  };
  themeColor?: string;
  notes?: Record<string, string>;
}

export interface InitiatePaymentResponse {
  success: boolean;
  message?: string;
  data?: CheckoutData;
  error?: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  message?: string;
  data?: {
    booking_id: string;
  };
  error?: string;
}

export interface PaymentKeyResponse {
  success: boolean;
  data?: {
    key_id: string;
  };
  error?: string;
}

// ====================================
// RAZORPAY TYPES
// ====================================

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image?: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name: string;
    email: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color: string;
  };
  modal?: {
    ondismiss?: () => void;
    escape?: boolean;
    backdropclose?: boolean;
  };
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayError {
  code: string;
  description: string;
  source: string;
  step: string;
  reason: string;
  metadata: {
    order_id: string;
    payment_id: string;
  };
}

// Razorpay SDK type
export interface RazorpayInstance {
  open: () => void;
  on: (
    event: string,
    handler: (response: { error: RazorpayError }) => void
  ) => void;
  close: () => void;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

// ====================================
// PAYMENT API
// ====================================

export const paymentApi = {
  /**
   * Get Razorpay key ID (safe to expose)
   */
  async getPaymentKey(): Promise<PaymentKeyResponse> {
    return apiClient.get("/payments/key");
  },

  /**
   * Initiate a payment order
   * Creates a Razorpay order and returns checkout data
   */
  async initiatePayment(
    tripId: string,
    hall: Hall
  ): Promise<InitiatePaymentResponse> {
    return apiClient.post("/payments/initiate", {
      trip_id: tripId,
      hall,
    });
  },

  /**
   * Verify payment after Razorpay checkout completes
   * This verifies the signature and creates the booking
   */
  async verifyPayment(
    paymentId: string,
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
  ): Promise<VerifyPaymentResponse> {
    return apiClient.post("/payments/verify", {
      payment_id: paymentId,
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
    });
  },
};

// ====================================
// RAZORPAY SDK HELPERS
// ====================================

/**
 * Load Razorpay SDK script dynamically
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    // Check if already loaded
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Open Razorpay checkout
 */
export function openRazorpayCheckout(
  checkoutData: CheckoutData,
  onSuccess: (response: RazorpayResponse) => void,
  onError: (error: RazorpayError) => void,
  onDismiss?: () => void
): RazorpayInstance | null {
  if (!window.Razorpay) {
    console.error("Razorpay SDK not loaded");
    return null;
  }

  const options: RazorpayOptions = {
    key: checkoutData.keyId,
    amount: checkoutData.amount,
    currency: checkoutData.currency,
    name: checkoutData.businessName,
    description: checkoutData.description,
    image: checkoutData.businessLogo,
    order_id: checkoutData.orderId,
    handler: onSuccess,
    prefill: checkoutData.prefill,
    notes: checkoutData.notes,
    theme: {
      color: checkoutData.themeColor || "#3B82F6",
    },
    modal: {
      ondismiss: onDismiss,
      escape: true,
      backdropclose: false,
    },
  };

  const razorpay = new window.Razorpay(options);

  razorpay.on("payment.failed", (response) => {
    onError(response.error);
  });

  razorpay.open();
  return razorpay;
}
