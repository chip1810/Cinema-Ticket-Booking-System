
export interface CheckoutTokenPayload {
  userId: number;
  showtimeUUID: string;
  seatUUIDs: string[];
  concessions: { concessionUUID: string; quantity: number }[];
  voucherUUID?: string;
  voucherCode?: string;
  totalAmount: number;
  discountAmount: number;
  originalAmount: number;
  expiresAt: string; // ISO string
}