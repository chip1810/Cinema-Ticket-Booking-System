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
import jwt from "jsonwebtoken";
import { CheckoutTokenPayload } from "../types/CheckoutTokenPayload";


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
  async confirmBooking(checkoutToken: string, requestingUserId: number) {
    // ===========================
    // 1. Verify & decode token
    // ===========================
    let payload: CheckoutTokenPayload;

    try {
      payload = jwt.verify(
        checkoutToken,
        process.env.CHECKOUT_TOKEN_SECRET as string
      ) as CheckoutTokenPayload;
    } catch (err) {
      throw new Error("Checkout token is invalid or has expired");
    }

    if (payload.userId !== requestingUserId) {
      throw new Error("Checkout token does not belong to this user");
    }

    if (new Date(payload.expiresAt) < new Date()) {
      throw new Error("Checkout session has expired, please hold seats again");
    }

    const { showtimeUUID, seatUUIDs, concessions, voucherUUID, voucherCode } = payload;
    const userId = requestingUserId;

    // ===========================
    // 2. Bắt đầu transaction
    // ===========================
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Lock showtime
      const showtime = await queryRunner.manager.findOneOrFail(Showtime, {
        where: { UUID: showtimeUUID },
        lock: { mode: "pessimistic_write" },
      });

      const confirmedSeats: string[] = [];
      let totalAmount = 0;

      // ===========================
      // 3. Tạo Order
      // ===========================
      const order = queryRunner.manager.create(Order, {
        user: { id: userId },
        status: OrderStatus.PENDING,
        totalAmount: 0,
      });

      await queryRunner.manager.save(order);

      // ===========================
      // 4. Xử lý từng ghế
      // ===========================
      for (const seatUUID of seatUUIDs) {
        const seat = await queryRunner.manager.findOneOrFail(Seat, {
          where: { UUID: seatUUID },
          lock: { mode: "pessimistic_write" },
        });

        // Kiểm tra hold còn hiệu lực và đúng user
        const hold = await queryRunner.manager
          .createQueryBuilder(SeatHold, "hold")
          .setLock("pessimistic_write")
          .where("hold.showtimeId = :showtimeId", { showtimeId: showtime.id })
          .andWhere("hold.seatId = :seatId", { seatId: seat.id })
          .andWhere("hold.expiresAt > NOW()")
          .getOne();

        if (!hold) {
          throw new Error(`Seat ${seat.seatNumber} is not held or hold has expired`);
        }

        if (hold.userId !== userId) {
          throw new Error(`Seat ${seat.seatNumber} is held by another user`);
        }

        // Kiểm tra ghế chưa bị bán
        const existingTicket = await queryRunner.manager.findOne(Ticket, {
          where: {
            showtime: { id: showtime.id },
            seat: { id: seat.id },
          },
          lock: { mode: "pessimistic_write" },
        });

        if (existingTicket) {
          throw new Error(`Seat ${seat.seatNumber} has already been sold`);
        }

        // Lấy giá từ PricingRule (không dùng giá trong token để đảm bảo toàn vẹn DB)
        const pricingRule = await queryRunner.manager.findOneOrFail(PricingRule, {
          where: {
            showtime: { id: showtime.id },
            seatType: seat.type,
          },
        });

        const seatPrice = Number(pricingRule.price);

        // Tạo Ticket
        const ticket = queryRunner.manager.create(Ticket, {
          showtime,
          seat,
          order,
          user: { id: userId },
          price: seatPrice,
        });

        await queryRunner.manager.save(ticket);

        totalAmount += seatPrice;

        // Xóa hold
        await queryRunner.manager.remove(hold);

        confirmedSeats.push(seatUUID);
      }

      // ===========================
      // 5. Xử lý concession
      // ===========================
      const processedConcessions: {
        concessionUUID: string;
        name: string;
        quantity: number;
        price: number;
      }[] = [];

      if (concessions && concessions.length > 0) {
        for (const item of concessions) {
          const concession = await queryRunner.manager.findOneOrFail(Concession, {
            where: { UUID: item.concessionUUID },
            lock: { mode: "pessimistic_write" },
          });

          if (item.quantity <= 0) {
            throw new Error("Invalid concession quantity");
          }

          if (concession.stockQuantity < item.quantity) {
            throw new Error(`${concession.name} is out of stock`);
          }

          const price = Number(concession.price);

          const orderItem = queryRunner.manager.create(OrderItem, {
            order,
            concession,
            quantity: item.quantity,
            price, // snapshot giá tại thời điểm đặt
          });

          await queryRunner.manager.save(orderItem);

          // Trừ stock
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

      // ===========================
      // 6. Áp dụng voucher
      // ===========================
      let discountAmount = 0;
      const voucherIdentifier = voucherUUID || (voucherCode && voucherCode.trim());

      if (voucherIdentifier) {
        let voucher: Voucher;

        if (voucherUUID) {
          voucher = await queryRunner.manager.findOneOrFail(Voucher, {
            where: { UUID: voucherUUID },
            lock: { mode: "pessimistic_write" },
          });
        } else {
          voucher = await queryRunner.manager.findOneOrFail(Voucher, {
            where: { code: voucherCode!.trim().toUpperCase() },
            lock: { mode: "pessimistic_write" },
          });
        }

        const now = new Date();

        if (!voucher.isActive)
          throw new Error("Voucher is inactive");

        if (now < voucher.startDate || now > voucher.endDate)
          throw new Error("Voucher has expired");

        if (voucher.usageLimit > 0 && voucher.usedCount >= voucher.usageLimit)
          throw new Error("Voucher usage limit has been reached");

        if (voucher.minOrderValue && totalAmount < Number(voucher.minOrderValue))
          throw new Error("Order value does not meet the minimum for this voucher");

        const usageCount = await queryRunner.manager.count(VoucherUsage, {
          where: { voucherId: voucher.id, userId },
        });

        if (voucher.perUserLimit && usageCount >= voucher.perUserLimit) {
          throw new Error("You have exceeded the usage limit for this voucher");
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

        // Tăng usedCount
        voucher.usedCount += 1;
        await queryRunner.manager.save(voucher);

        // Ghi VoucherUsage
        await queryRunner.manager.save(VoucherUsage, {
          voucherId: voucher.id,
          userId,
        });

        order.voucher = voucher;
      }

      // ===========================
      // 7. Cập nhật totalAmount & commit
      // ===========================
      order.totalAmount = totalAmount;
      await queryRunner.manager.save(order);

      await queryRunner.commitTransaction();

      // ===========================
      // 8. Emit WebSocket
      // ===========================
      getIO().to(showtimeUUID).emit("seat-sold", {
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


  /**
 * CHECKOUT PREVIEW – Tính tổng tiền, không tạo Order
 */
  async checkoutPreview(
    showtimeUUID: string,
    seatUUIDs: string[],
    concessions: { concessionUUID: string; quantity: number }[],
    userId: number,
    voucherUUID?: string,
    voucherCode?: string
  ) {
    const showtimeRepo = AppDataSource.getRepository(Showtime);
    const seatRepo = AppDataSource.getRepository(Seat);
    const holdRepo = AppDataSource.getRepository(SeatHold);
    const pricingRepo = AppDataSource.getRepository(PricingRule);
    const concessionRepo = AppDataSource.getRepository(Concession);
    const voucherRepo = AppDataSource.getRepository(Voucher);
    const usageRepo = AppDataSource.getRepository(VoucherUsage);
    // ===========================
    // 1. Validate Showtime
    // ===========================
    const showtime = await showtimeRepo.findOne({
      where: { UUID: showtimeUUID },
      relations: ["movie", "hall"],
    });
    if (!showtime) throw new Error("Showtime not found");
    // ===========================
    // 2. Validate & tính giá ghế
    // ===========================
    const seats = await seatRepo.find({
      where: seatUUIDs.map((uuid) => ({ UUID: uuid })),
    });
    if (seats.length !== seatUUIDs.length) {
      throw new Error("Some seats not found");
    }
    const seatDetails: { seatNumber: string; type: string; price: number }[] = [];
    let seatTotal = 0;
    let earliestExpiresAt: Date | null = null;
    for (const seat of seats) {
      if (seat.hallId !== showtime.hallId) {
        throw new Error(`Seat ${seat.seatNumber} not in this showtime's hall`);
      }
      const hold = await holdRepo
        .createQueryBuilder("hold")
        .where("hold.showtimeId = :showtimeId", { showtimeId: showtime.id })
        .andWhere("hold.seatId = :seatId", { seatId: seat.id })
        .andWhere("hold.userId = :userId", { userId })
        .andWhere("hold.expiresAt > NOW()")
        .getOne();
      if (!hold) {
        throw new Error(`Seat ${seat.seatNumber} not held or hold has expired`);
      }
      // Lấy expiresAt sớm nhất trong các holds (để token TTL khớp)
      if (!earliestExpiresAt || hold.expiresAt < earliestExpiresAt) {
        earliestExpiresAt = hold.expiresAt;
      }
      const pricingRule = await pricingRepo.findOne({
        where: {
          showtimeId: showtime.id,
          seatType: seat.type,
        },
      });
      if (!pricingRule) {
        throw new Error(`No pricing configured for seat type ${seat.type}`);
      }
      const price = Number(pricingRule.price);
      seatDetails.push({ seatNumber: seat.seatNumber, type: seat.type, price });
      seatTotal += price;
    }
    // ===========================
    // 3. Validate & tính concession
    // ===========================
    const concessionDetails: {
      concessionUUID: string;
      name: string;
      quantity: number;
      price: number;
      subtotal: number;
    }[] = [];
    let concessionTotal = 0;
    if (concessions && concessions.length > 0) {
      for (const item of concessions) {
        const concession = await concessionRepo.findOne({
          where: { UUID: item.concessionUUID },
        });
        if (!concession) {
          throw new Error(`Concession ${item.concessionUUID} not found`);
        }
        if (item.quantity <= 0) {
          throw new Error("Invalid concession quantity");
        }
        if (concession.stockQuantity < item.quantity) {
          throw new Error(`${concession.name} is out of stock`);
        }
        const price = Number(concession.price);
        const subtotal = price * item.quantity;
        concessionDetails.push({
          concessionUUID: concession.UUID,
          name: concession.name,
          quantity: item.quantity,
          price,
          subtotal,
        });
        concessionTotal += subtotal;
      }
    }
    // ===========================
    // 4. Tính voucher
    // ===========================
    let subtotal = seatTotal + concessionTotal;
    let discountAmount = 0;
    let appliedVoucherUUID: string | undefined;
    let appliedVoucherCode: string | undefined;
    const voucherIdentifier = voucherUUID || (voucherCode && voucherCode.trim());
    if (voucherIdentifier && subtotal > 0) {
      let voucher: Voucher | null = null;
      if (voucherUUID) {
        voucher = await voucherRepo.findOne({ where: { UUID: voucherUUID } });
        appliedVoucherUUID = voucherUUID;
      } else {
        voucher = await voucherRepo.findOne({
          where: { code: voucherCode!.trim().toUpperCase() },
        });
        appliedVoucherCode = voucherCode!.trim().toUpperCase();
      }
      if (!voucher) throw new Error("Voucher not found");
      const now = new Date();
      if (!voucher.isActive) throw new Error("Voucher is inactive");
      if (now < voucher.startDate || now > voucher.endDate) {
        throw new Error("Voucher has expired");
      }
      if (voucher.usageLimit > 0 && voucher.usedCount >= voucher.usageLimit) {
        throw new Error("Voucher usage limit reached");
      }
      const usageCount = await usageRepo.count({
        where: { voucherId: voucher.id, userId },
      });
      if (voucher.perUserLimit && usageCount >= voucher.perUserLimit) {
        throw new Error("You have exceeded the usage limit for this voucher");
      }
      if (voucher.minOrderValue && subtotal < Number(voucher.minOrderValue)) {
        throw new Error(
          `Minimum order value for this voucher is ${voucher.minOrderValue}`
        );
      }
      if (voucher.type === "PERCENTAGE") {
        discountAmount = (subtotal * Number(voucher.value)) / 100;
        if (
          voucher.maxDiscountAmount &&
          discountAmount > Number(voucher.maxDiscountAmount)
        ) {
          discountAmount = Number(voucher.maxDiscountAmount);
        }
      } else {
        discountAmount = Number(voucher.value);
      }
    }
    const totalAmount = Math.max(subtotal - discountAmount, 0);
    const expiresAt = earliestExpiresAt ?? new Date(Date.now() + 5 * 60 * 1000);
    // ===========================
    // 5. Ký Checkout Token (JWT)
    // ===========================
    const tokenPayload: CheckoutTokenPayload = {
      userId,
      showtimeUUID,
      seatUUIDs,
      concessions: concessions || [],
      voucherUUID: appliedVoucherUUID,
      voucherCode: appliedVoucherCode,
      originalAmount: subtotal,
      discountAmount,
      totalAmount,
      expiresAt: expiresAt.toISOString(),
    };
    // TTL token = thời gian còn lại của hold (không để token sống lâu hơn hold)
    const ttlSeconds = Math.max(
      Math.floor((expiresAt.getTime() - Date.now()) / 1000),
      60 // tối thiểu 60 giây
    );
    const checkoutToken = jwt.sign(
      tokenPayload,
      process.env.CHECKOUT_TOKEN_SECRET as string,
      { expiresIn: ttlSeconds }
    );
    // ===========================
    // 6. Trả response
    // ===========================
    return {
      showtime: {
        UUID: showtime.UUID,
        startTime: showtime.startTime,
        movie: showtime.movie
          ? { title: showtime.movie.title, duration: showtime.movie.duration }
          : null,
        hall: showtime.hall ? { name: showtime.hall.name } : null,
      },
      seats: seatDetails,
      concessions: concessionDetails,
      subtotal,
      discountAmount,
      totalAmount,
      expiresAt,
      checkoutToken,
    };
  }

  async getSeatsByShowtime(showtimeUUID: string) {
    const showtime = await AppDataSource.getRepository(Showtime).findOne({
      where: { UUID: showtimeUUID },
    });

    if (!showtime) {
      throw new Error("Showtime not found");
    }

    const now = new Date();

    const rows = await AppDataSource.getRepository(Seat)
      .createQueryBuilder("seat")

      // SOLD
      .leftJoin(
        Ticket,
        "ticket",
        "ticket.seatId = seat.id AND ticket.showtimeId = :showtimeId",
        { showtimeId: showtime.id }
      )

      // HELD
      .leftJoin(
        SeatHold,
        "hold",
        "hold.seatId = seat.id AND hold.showtimeId = :showtimeId AND hold.expiresAt > :now",
        { showtimeId: showtime.id, now }
      )

      .select([
        "seat.UUID as uuid",
        "seat.seatNumber as seatNumber",
        "seat.type as type",
        "ticket.id as sold",
        "hold.expiresAt as expiresAt",
      ])

      .where("seat.hallId = :hallId", { hallId: showtime.hallId })

      .orderBy("seat.seatNumber", "ASC")

      .getRawMany();

    const seats = rows.map((r) => {
      const sold = !!r.sold;
      const expiresAt = r.expiresat ?? r.expiresAt ?? null;

      let status: "available" | "held" | "sold" = "available";

      if (sold) status = "sold";
      else if (expiresAt) status = "held";

      return {
        UUID: r.uuid,
        seatNumber: r.seatnumber ?? r.seatNumber,
        type: r.type,
        status,
        expiresAt,
      };
    });

    return seats;
  }

}