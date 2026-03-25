const mongoose = require("mongoose");
const PricingService = require("../../../services/PricingService");
const Showtime = require("../../showtime/models/Showtime");

const pricingService = new PricingService();
const isObjectId = (value) => mongoose.Types.ObjectId.isValid(String(value));

class PricingController {
  async calculate(req, res) {
    const { showtimeId, seats, discountCode } = req.body || {};

    if (!showtimeId || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({ message: "showtimeId and seats[] are required" });
    }

    const showtime = await Showtime.findOne({
      $or: [
        { UUID: showtimeId },
        ...(isObjectId(showtimeId) ? [{ _id: showtimeId }] : []),
      ],
    });

    if (!showtime) return res.status(404).json({ message: "Showtime not found" });

    const priceBreakdown = seats.map((seat) => ({
      seat: `${seat.row}${seat.number}`,
      price: pricingService.calculatePrice("2D", showtime.startTime, seat.type, discountCode),
    }));

    const totalPrice = priceBreakdown.reduce((sum, s) => sum + s.price, 0);

    return res.json({ totalPrice, priceBreakdown });
  }
}

module.exports = PricingController;
