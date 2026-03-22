const PricingService = require("../services/PricingService");
const Showtime = require("../modules/showtime/models/Showtime");

const pricingService = new PricingService();

class PricingController {

  async calculate(req, res) {
    try {
      const { showtimeId, seats, discountCode } = req.body;

      // validate
      if (!showtimeId || !Array.isArray(seats) || seats.length === 0) {
        return res.status(400).json({
          message: "showtimeId and seats[] are required"
        });
      }

      // 🔥 Mongo: dùng findById + populate
      const showtime = await Showtime.findById(showtimeId)
        .populate("movie");

      if (!showtime) {
        return res.status(404).json({
          message: "Showtime not found"
        });
      }

      // tính giá từng ghế
      const priceBreakdown = seats.map(seat => ({
        seat: `${seat.row}${seat.number}`,
        price: pricingService.calculatePrice(
          "2D", // bạn có thể lấy từ showtime.movie.format nếu có
          showtime.startTime,
          seat.type,
          discountCode
        )
      }));

      // tổng tiền
      const totalPrice = priceBreakdown.reduce(
        (sum, s) => sum + s.price,
        0
      );

      return res.json({
        totalPrice,
        priceBreakdown
      });

    } catch (e) {
      return res.status(500).json({
        message: e.message || "Internal Server Error"
      });
    }
  }
}

module.exports = { PricingController };