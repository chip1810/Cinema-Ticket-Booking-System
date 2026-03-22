// SeatService.js
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const { getIO } = require("../../../socket");
const { Seat } = require("../models/Seat");
const SeatHold = require("../models/SeatHold");
const Ticket = require("../../ticket/models/Ticket");
const Showtime = require("../../showtime/models/Showtime");
const { Order, OrderStatus } = require("../../order/models/Order");
const PricingRule = require("../models/PricingRule");
const Concession = require("../../concession/models/Concession");
const OrderItem = require("../../order_item/models/OrderItem");
const Voucher = require("../../voucher/models/Voucher");
const VoucherUsage = require("../../voucher/models/VoucherUsage");
const VoucherService = require("../../voucher/services/VoucherService");

const voucherService = new VoucherService();

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

        if (!pricingRule) throw new Error(`Pricing rule not found for seat ${seat.seatNumber}`);
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

      // Add concessions
      const concessionItems = Array.isArray(concessions) ? concessions : [];
      for (const item of concessionItems) {
        const concession = await Concession.findOne({ UUID: item.concessionUUID }).session(session);
        if (!concession) throw new Error("Concession not found");
        if (concession.stockQuantity < item.quantity) {
          throw new Error(`Concession ${concession.name} out of stock`);
        }

        const itemPrice = Number(concession.price);
        totalAmount += itemPrice * Number(item.quantity);

        await new OrderItem({
          order: order._id,
          concession: concession._id,
          quantity: item.quantity,
          price: itemPrice,
        }).save({ session });

        concession.stockQuantity -= Number(item.quantity);
        await concession.save({ session });
      }

      // Apply voucher if provided
      if (voucherUUID || voucherCode) {
        const applyResult = await voucherService.apply(
          { voucherUUID, code: voucherCode, totalAmount },
          userId
        );
        totalAmount = applyResult.finalAmount;

        let voucherRef = null;
        if (voucherUUID) {
          voucherRef = await Voucher.findOne({ UUID: voucherUUID }).session(session);
        } else if (voucherCode) {
          voucherRef = await Voucher.findOne({ code: voucherCode.trim().toUpperCase() }).session(session);
        }

        if (voucherRef) {
          order.voucher = voucherRef._id;
          await voucherService.increaseUsedCount(voucherRef.UUID, userId);
        }
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

  /** CHECKOUT PREVIEW */
  async checkoutPreview(showtimeUUID, seatUUIDs, concessions, userId, voucherUUID, voucherCode) {
    const showtime = await Showtime.findOne({ UUID: showtimeUUID });
    if (!showtime) throw new Error("Showtime not found");

    const seats = await Seat.find({ UUID: { $in: seatUUIDs } });
    if (seats.length !== seatUUIDs.length) throw new Error("Some seats not found");

    let seatsTotal = 0;
    const now = new Date();

    for (const seat of seats) {
      if (!seat.hall.equals(showtime.hall)) {
        throw new Error(`Seat ${seat.seatNumber} not in this hall`);
      }

      const existingTicket = await Ticket.findOne({ showtime: showtime._id, seat: seat._id });
      if (existingTicket) throw new Error(`Seat ${seat.seatNumber} already sold`);

      const existingHold = await SeatHold.findOne({
        showtime: showtime._id,
        seat: seat._id,
        expiresAt: { $gt: now },
      });
      if (existingHold && String(existingHold.user) !== String(userId)) {
        throw new Error(`Seat ${seat.seatNumber} is being held`);
      }

      const pricingRule = await PricingRule.findOne({
        showtime: showtime._id,
        seatType: seat.type,
      });
      if (!pricingRule) throw new Error(`Pricing rule not found for seat ${seat.seatNumber}`);

      seatsTotal += Number(pricingRule.price);
    }

    let concessionsTotal = 0;
    const concessionItems = Array.isArray(concessions) ? concessions : [];
    for (const item of concessionItems) {
      const concession = await Concession.findOne({ UUID: item.concessionUUID });
      if (!concession) throw new Error("Concession not found");
      if (concession.stockQuantity < item.quantity) {
        throw new Error(`Concession ${concession.name} out of stock`);
      }
      concessionsTotal += Number(concession.price) * Number(item.quantity);
    }

    const originalAmount = seatsTotal + concessionsTotal;
    let discountAmount = 0;
    let finalAmount = originalAmount;

    if (voucherUUID || voucherCode) {
      const voucherResult = await voucherService.apply(
        { voucherUUID, code: voucherCode, totalAmount: originalAmount },
        userId
      );
      discountAmount = voucherResult.discountAmount;
      finalAmount = voucherResult.finalAmount;
    }

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    const payload = {
      userId,
      showtimeUUID,
      seatUUIDs,
      concessions: concessionItems,
      voucherUUID,
      voucherCode,
      totalAmount: finalAmount,
      discountAmount,
      originalAmount,
      expiresAt: expiresAt.toISOString(),
    };

    const checkoutToken = jwt.sign(payload, process.env.CHECKOUT_TOKEN_SECRET, { expiresIn: "5m" });

    return {
      seatsTotal,
      concessionsTotal,
      originalAmount,
      discountAmount,
      finalAmount,
      expiresAt,
      checkoutToken,
    };
  }

  /** GET SEATS BY SHOWTIME */
  /** GET SEATS BY SHOWTIME (có pricing) */
  async getSeatsByShowtime(showtimeUUID) {
    const showtime = await Showtime.findOne({ UUID: showtimeUUID })
      .populate("movie hall");

    if (!showtime) throw new Error("Showtime not found");

    // 1️⃣ Lấy tất cả ghế
    const seats = await Seat.find({ hall: showtime.hall._id }).lean();
    const now = new Date();

    // 2️⃣ Lấy trạng thái từng ghế (sold / held / available)
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

    // 3️⃣ Lấy PricingRule theo showtime
    const pricingRules = await PricingRule.find({ showtime: showtime._id }).lean();

    // Chuyển thành object seatType => price
    const pricing = {};
    pricingRules.forEach(rule => {
      pricing[rule.seatType] = rule.price;
    });

    // 4️⃣ Trả về payload đầy đủ
    return {
      movie: showtime.movie,
      showtime: {
        UUID: showtime.UUID,
        startTime: showtime.startTime
      },
      hall: showtime.hall,
      seats: seatStatus,
      pricing // 🔥 giá mỗi loại ghế
    };
  }
}

module.exports = SeatService;
