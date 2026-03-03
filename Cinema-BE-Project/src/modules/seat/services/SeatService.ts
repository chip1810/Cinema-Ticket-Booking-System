import { AppDataSource } from "../../../data-source";
import { Seat } from "../models/Seat";
import { Showtime } from "../../showtime/models/Showtime";
import { SeatHold } from "../../seat/models/SeatHold";
import { Ticket } from "../../ticket/models/Ticket";
import { getIO } from "../../../socket";
import { Order } from "../../order/models/Order";
import { PricingRule } from "../../pricing_rule/models/PricingRule";
import { OrderStatus } from "../../order/models/Order";
import { Concession } from "../../concession/models/Concession";
import { OrderItem } from "../../order_item/models/OrderItem";
import { Voucher } from "../../voucher/models/Voucher";
import { VoucherUsage } from "../../voucher/models/VoucherUsage";

export class SeatService {
  /**
   * HOLD SEATS (giữ ghế 5 phút)
   */
  async holdSeats(
    showtimeUUID: string,
    seatUUIDs: string[],
    userId: number
  ) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    let result;

    try {
      const showtime = await queryRunner.manager.findOneOrFail(Showtime, {
        where: { UUID: showtimeUUID },
        lock: { mode: "pessimistic_write" },
      });

      const seats = await queryRunner.manager.find(Seat, {
        where: seatUUIDs.map((uuid) => ({ UUID: uuid })),
        lock: { mode: "pessimistic_write" },
      });

      if (seats.length !== seatUUIDs.length) {
        throw new Error("Some seats not found");
      }

      const now = new Date();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);


      for (const seat of seats) {
        if (seat.hallId !== showtime.hallId) {
          throw new Error(`Seat ${seat.seatNumber} not in this hall`);
        }

        const existingTicket = await queryRunner.manager.findOne(Ticket, {
          where: {
            showtimeId: showtime.id,
            seatId: seat.id,
          },
          lock: { mode: "pessimistic_write" },
        });

        if (existingTicket) {
          throw new Error(`Seat ${seat.seatNumber} already sold`);
        }

        const existingHold = await queryRunner.manager.findOne(SeatHold, {
          where: {
            showtimeId: showtime.id,
            seatId: seat.id,
          },
          lock: { mode: "pessimistic_write" },
        });

        if (existingHold && existingHold.expiresAt > now) {
          throw new Error(`Seat ${seat.seatNumber} is being held`);
        }

        if (existingHold && existingHold.expiresAt <= now) {
          await queryRunner.manager.remove(existingHold);
        }

        const hold = queryRunner.manager.create(SeatHold, {
          showtimeId: showtime.id,
          seatId: seat.id,
          user: { id: userId },
          expiresAt,
        });

        await queryRunner.manager.save(hold);
      }

      await queryRunner.commitTransaction();

      result = {
        seats: seats.map((s) => s.seatNumber),
        expiresAt,
        expiresIn: 300,
      };

    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      throw error;
    } finally {
      await queryRunner.release();
    }

    // 🔥 Emit sau khi transaction hoàn toàn xong
    getIO().to(showtimeUUID).emit("seat-held", {
      seatUUIDs,
      expiresAt: result.expiresAt,
    });

    return result;
  }
  /**
   * CONFIRM BOOKING (chuyển hold -> ticket)
   */
  async confirmBooking(
    showtimeUUID: string,
    seatUUIDs: string[],
    concessions: { concessionUUID: string; quantity: number }[],
    userId: number,
    voucherUUID?: string
  ) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 🔒 Lock showtime
      const showtime = await queryRunner.manager.findOneOrFail(Showtime, {
        where: { UUID: showtimeUUID },
        lock: { mode: "pessimistic_write" },
      });

      const confirmedSeats: string[] = [];
      let totalAmount = 0;

      // 🧾 Create Order
      const order = queryRunner.manager.create(Order, {
        user: { id: userId },
        status: OrderStatus.PENDING,
        totalAmount: 0,
      });

      await queryRunner.manager.save(order);

      // ===============================
      // 🎟 PROCESS SEATS
      // ===============================
      for (const seatUUID of seatUUIDs) {

        const seat = await queryRunner.manager.findOneOrFail(Seat, {
          where: { UUID: seatUUID },
          lock: { mode: "pessimistic_write" },
        });

        const hold = await queryRunner.manager
          .createQueryBuilder(SeatHold, "hold")
          .setLock("pessimistic_write")
          .where("hold.showtimeId = :showtimeId", {
            showtimeId: showtime.id,
          })
          .andWhere("hold.seatId = :seatId", {
            seatId: seat.id,
          })
          .andWhere("hold.expiresAt > NOW()")
          .getOne();

        if (!hold) {
          throw new Error(`Seat ${seat.seatNumber} not held or expired`);
        }

        if (hold.userId !== userId) {
          throw new Error(`Seat ${seat.seatNumber} held by another user`);
        }

        const existingTicket = await queryRunner.manager.findOne(Ticket, {
          where: {
            showtime: { id: showtime.id },
            seat: { id: seat.id },
          },
          lock: { mode: "pessimistic_write" },
        });

        if (existingTicket) {
          throw new Error(`Seat ${seat.seatNumber} already sold`);
        }

        const pricingRule = await queryRunner.manager.findOneOrFail(
          PricingRule,
          {
            where: {
              showtime: { id: showtime.id },
              seatType: seat.type,
            },
          }
        );

        const seatPrice = Number(pricingRule.price);

        const ticket = queryRunner.manager.create(Ticket, {
          showtime,
          seat,
          order,
          user: { id: userId },
          price: seatPrice,
        });

        await queryRunner.manager.save(ticket);

        totalAmount += seatPrice;

        await queryRunner.manager.remove(hold);

        confirmedSeats.push(seatUUID);
      }

      // ===============================
      // 🍿 PROCESS CONCESSIONS
      // ===============================
      const processedConcessions: any[] = [];

      if (concessions && concessions.length > 0) {
        for (const item of concessions) {

          const concession = await queryRunner.manager.findOneOrFail(
            Concession,
            {
              where: { UUID: item.concessionUUID },
              lock: { mode: "pessimistic_write" }, // 🔒 lock stock
            }
          );

          if (item.quantity <= 0) {
            throw new Error("Invalid concession quantity");
          }

          if (concession.stockQuantity < item.quantity) {
            throw new Error(`${concession.name} out of stock`);
          }

          const price = Number(concession.price);

          const orderItem = queryRunner.manager.create(OrderItem, {
            order,
            concession,
            quantity: item.quantity,
            price, // snapshot price
          });

          await queryRunner.manager.save(orderItem);

          // 📦 Reduce stock
          concession.stockQuantity -= item.quantity;
          await queryRunner.manager.save(concession);

          totalAmount += price * item.quantity;

          processedConcessions.push({
            concessionUUID: concession.UUID,
            name: concession.name,
            quantity: item.quantity,
            price,
          });
        }
      }

      const originalAmount = totalAmount;

      // ===============================
      //  voucher
      // ===============================
      let discountAmount = 0;

      if (voucherUUID) {
        const voucher = await queryRunner.manager.findOneOrFail(Voucher, {
          where: { UUID: voucherUUID },
          lock: { mode: "pessimistic_write" },
        });

        const now = new Date();

        if (!voucher.isActive)
          throw new Error("Voucher inactive");

        if (now < voucher.startDate || now > voucher.endDate)
          throw new Error("Voucher expired");

        if (
          voucher.usageLimit > 0 &&
          voucher.usedCount >= voucher.usageLimit
        )
          throw new Error("Voucher exhausted");

        if (
          voucher.minOrderValue &&
          totalAmount < Number(voucher.minOrderValue)
        )
          throw new Error("Order not eligible for voucher");

        // per user check
        const usageCount = await queryRunner.manager.count(VoucherUsage, {
          where: {
            voucherId: voucher.id,
            userId,
          },
        });


        if (
          voucher.perUserLimit &&
          usageCount >= voucher.perUserLimit
        ) {
          throw new Error("User exceeded voucher usage limit");
        }


        if (voucher.type === "PERCENTAGE") {
          discountAmount = (totalAmount * Number(voucher.value)) / 100;

          if (
            voucher.maxDiscountAmount &&
            discountAmount > Number(voucher.maxDiscountAmount)
          ) {
            discountAmount = Number(voucher.maxDiscountAmount);
          }
        } else {
          discountAmount = Number(voucher.value);
        }

        totalAmount = Math.max(originalAmount - discountAmount, 0);

        // 🔥 Increase used count
        voucher.usedCount += 1;
        await queryRunner.manager.save(voucher);

        // 🔥 Save usage record
        await queryRunner.manager.save(VoucherUsage, {
          voucherId: voucher.id,
          userId,
        });


        order.voucher = voucher; // nếu có relation
      }
      //Update total
      order.totalAmount = totalAmount;
      await queryRunner.manager.save(order);


      await queryRunner.commitTransaction();

      // 🔥 Realtime emit
      const io = getIO();
      io.to(showtimeUUID).emit("seat-sold", {
        seatUUIDs: confirmedSeats,
      });

      return {
        message: "Booking confirmed",
        orderUUID: order.UUID,
        originalAmount,
        discountAmount,
        finalAmount: totalAmount,
        seats: confirmedSeats,
        concessions: processedConcessions,
      };

    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
  async getSeatsByHallId(hallId: number) {
    const seatRepository = AppDataSource.getRepository(Seat);

    const seats = await seatRepository.find({
      where: { hall: { id: hallId } },
      order: { seatNumber: "ASC" },
    });

    return seats.map((s) => ({
      UUID: s.UUID,
      seatNumber: s.seatNumber,
      type: s.type,
    }));
  }


}