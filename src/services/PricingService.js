const BASE_PRICES = { "2D": 80000, "3D": 120000 };
const WEEKEND_SURCHARGE = 20000;
const SEAT_SURCHARGES = { Standard: 0, VIP: 30000, Couple: 60000 };
const DISCOUNT_CODES = { CINEMA50: 0.5, MEMBER10: 0.9 };

class PricingService {
  calculatePrice(format, date, seatType, discountCode) {
    let price = BASE_PRICES[format] || BASE_PRICES["2D"];

    const day = date.getDay();
    if (day === 0 || day === 6) price += WEEKEND_SURCHARGE;

    price += SEAT_SURCHARGES[seatType] || 0;

    const multiplier = discountCode ? (DISCOUNT_CODES[discountCode] ?? 1) : 1;
    price *= multiplier;

    return Math.round(price);
  }
}

module.exports = PricingService;
