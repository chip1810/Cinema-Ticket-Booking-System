// Ticket Pricing Logic
// Base price varies by format (2D/3D), with surcharges for weekends and special seats.
// Discount codes are applied as a final percentage reduction.

type MovieFormat = "2D" | "3D";
type SeatType = "Standard" | "VIP" | "Couple";

const BASE_PRICES: Record<MovieFormat, number> = { "2D": 80_000, "3D": 120_000 };
const WEEKEND_SURCHARGE = 20_000;
const SEAT_SURCHARGES: Record<SeatType, number> = { Standard: 0, VIP: 30_000, Couple: 60_000 };
const DISCOUNT_CODES: Record<string, number> = { CINEMA50: 0.5, MEMBER10: 0.9 };

export class PricingService {
    calculatePrice(format: MovieFormat, date: Date, seatType: SeatType, discountCode?: string): number {
        let price = BASE_PRICES[format];

        // Weekend surcharge (0 = Sunday, 6 = Saturday)
        const day = date.getDay();
        if (day === 0 || day === 6) price += WEEKEND_SURCHARGE;

        // Seat type surcharge
        price += SEAT_SURCHARGES[seatType];

        // Discount code
        const multiplier = discountCode ? (DISCOUNT_CODES[discountCode] ?? 1) : 1;
        price *= multiplier;

        return Math.round(price);
    }
}
