// SeatService.js
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const { getIO } = require("../../../socket");
const { Seat } = require("../models/Seat");
const SeatHold = require("../models/SeatHold");
const Ticket = require("../../ticket/models/Ticket");
const Showtime = require("../../showtime/models/Showtime");
const { Order, OrderStatus } = require("../../order/models/Order");
const PricingRule = require("../../pricing_rule/models/PricingRule");
const Concession = require("../../concession/models/Concession");
const OrderItem = require("../../order_item/models/OrderItem");
const Voucher = require("../../voucher/models/Voucher");
const VoucherUsage = require("../../voucher/models/VoucherUsage");

class SeatService {

  /** HOLD SEATS */
  async holdSeats(showtimeUUID, seatUUIDs, userId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const showtime = await Showtime.findOne({ UUID: showtimeUUID }).session(session);
      if (!showtime) throw new Error("Showtime not found");

      const seats = await Seat.find({ UUID: { $in: seatUUIDs } }).session(session);
      if (seats.length !== seatUUIDs.length) throw new Error("Some seats not found");

      const now = new Date();
      const expiresAt = new Date(now.getTime() + 5 * 60 * 1000);

      for (const seat of seats) {
        if (!seat.hall.equals(showtime.hall)) {
          throw new Error(`Seat ${seat.seatNumber} not in this hall`);
        }

        const existingTicket = await Ticket.findOne({
          showtime: showtime._id,
          seat: seat._id
        }).session(session);

        if (existingTicket) {
          throw new Error(`Seat ${seat.seatNumber} already sold`);
        }

        const existingHold = await SeatHold.findOne({
          showtime: showtime._id,
          seat: seat._id,
          expiresAt: { $gt: now }
        }).session(session);

        if (existingHold) {
          throw new Error(`Seat ${seat.seatNumber} is being held`);
        }

        // cleanup expired
        await SeatHold.deleteMany({
          showtime: showtime._id,
          seat: seat._id,
          expiresAt: { $lte: now }
        }).session(session);

        const hold = new SeatHold({
          showtime: showtime._id,
          seat: seat._id,
          user: userId,
          expiresAt
        });

        await hold.save({ session });
      }

      await session.commitTransaction();

      getIO().to(showtimeUUID).emit("seat-status-updated", {
        seatUUIDs,
        status: "held",
        expiresAt
      });

      return {
        seats: seatUUIDs,
        expiresAt,
        expiresIn: 300
      };

    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }

  /** CONFIRM BOOKING */
  async confirmBooking(checkoutToken, userId) {
    let payload;

    try {
      payload = jwt.verify(checkoutToken, process.env.CHECKOUT_TOKEN_SECRET);
    } catch {
      throw new Error("Checkout token is invalid or expired");
    }

    if (payload.userId !== userId) {
      throw new Error("Token does not belong to this user");
    }

    if (new Date(payload.expiresAt) < new Date()) {
      throw new Error("Checkout session expired");
    }

    const {
      showtimeUUID,
      seatUUIDs,
      concessions,
      voucherUUID,
      voucherCode
    } = payload;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const showtime = await Showtime.findOne({ UUID: showtimeUUID }).session(session);
      if (!showtime) throw new Error("Showtime not found");

      const order = new Order({
        user: userId,
        status: OrderStatus.PENDING,
        totalAmount: 0
      });

      await order.save({ session });

      let totalAmount = 0;
      const confirmedSeats = [];

      for (const seatUUID of seatUUIDs) {
        const seat = await Seat.findOne({ UUID: seatUUID }).session(session);
        if (!seat) throw new Error(`Seat ${seatUUID} not found`);

        const hold = await SeatHold.findOne({
          showtime: showtime._id,
          seat: seat._id,
          user: userId,
          expiresAt: { $gt: new Date() }
        }).session(session);

        if (!hold) throw new Error(`Seat ${seat.seatNumber} not held or expired`);

        const pricingRule = await PricingRule.findOne({
          showtime: showtime._id,
          seatType: seat.type
        }).session(session);

        const price = Number(pricingRule.price);
        totalAmount += price;

        await new Ticket({
          showtime: showtime._id,
          seat: seat._id,
          order: order._id,
          user: userId,
          price
        }).save({ session });

        await SeatHold.deleteOne({ _id: hold._id }).session(session);
        confirmedSeats.push(seatUUID);
      }

      order.totalAmount = totalAmount;
      await order.save({ session });

      await session.commitTransaction();

      getIO().to(showtimeUUID).emit("seat-status-updated", {
        seatUUIDs: confirmedSeats,
        status: "sold"
      });

      return {
        message: "Booking confirmed",
        orderUUID: order.UUID,
        seats: confirmedSeats,
        totalAmount
      };

    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }

  /** GET SEATS BY SHOWTIME */
  async getSeatsByShowtime(showtimeUUID) {
    const showtime = await Showtime.findOne({ UUID: showtimeUUID })
      .populate("movie hall");

    if (!showtime) throw new Error("Showtime not found");

    const seats = await Seat.find({ hall: showtime.hall._id }).lean();
    const now = new Date();

    const seatStatus = await Promise.all(
      seats.map(async (seat) => {
        const sold = await Ticket.exists({
          showtime: showtime._id,
          seat: seat._id
        });

        const held = await SeatHold.findOne({
          showtime: showtime._id,
          seat: seat._id,
          expiresAt: { $gt: now }
        });

        let status = "available";
        if (sold) status = "sold";
        else if (held) status = "held";

        return {
          UUID: seat.UUID,
          seatNumber: seat.seatNumber,
          type: seat.type,
          status,
          expiresAt: held ? held.expiresAt : null
        };
      })
    );

    return {
      movie: showtime.movie,
      showtime: {
        UUID: showtime.UUID,
        startTime: showtime.startTime
      },
      hall: showtime.hall,
      seats: seatStatus
    };
  }
}

module.exports = SeatService;