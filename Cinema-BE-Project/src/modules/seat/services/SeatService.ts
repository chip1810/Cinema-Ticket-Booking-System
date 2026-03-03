import { AppDataSource } from "../../../data-source";
import { Seat } from "../models/Seat";
import { Showtime } from "../../showtime/models/Showtime";
import { SeatHold } from "../models/SeatHold";
import { Ticket } from "../../ticket/models/Ticket";
import { getIO } from "../../../socket";

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
    userId: number
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

      const now = new Date();
      const confirmedSeats: string[] = [];

      for (const seatUUID of seatUUIDs) {
        const seat = await queryRunner.manager.findOneOrFail(Seat, {
          where: { UUID: seatUUID },
          lock: { mode: "pessimistic_write" },
        });

        // 🔒 Lock hold row
        const hold = await queryRunner.manager
          .createQueryBuilder(SeatHold, "hold")
          .setLock("pessimistic_write")
          .where("hold.showtimeId = :showtimeId", {
            showtimeId: showtime.id,
          })
          .andWhere("hold.seatId = :seatId", {
            seatId: seat.id,
          })
          .getOne();

        if (!hold) {
          throw new Error(`Seat ${seat.seatNumber} not held`);
        }

        if (hold.expiresAt < now) {
          throw new Error(`Seat ${seat.seatNumber} hold expired`);
        }

        if (hold.user?.id !== userId) {
          throw new Error(`Seat ${seat.seatNumber} held by another user`);
        }

        // 🎟 Create ticket
        const ticket = queryRunner.manager.create(Ticket, {
          showtime,
          seat,
          user: { id: userId },
          price: 100000,
        });

        await queryRunner.manager.save(ticket);

        // 🗑 Remove hold
        await queryRunner.manager.remove(hold);

        confirmedSeats.push(seatUUID);
      }

      await queryRunner.commitTransaction();

      // 🔥 Emit realtime
      const io = getIO();
      io.to(showtimeUUID).emit("seat-sold", {
        seatUUIDs: confirmedSeats,
      });

      return {
        message: "Booking confirmed",
        seats: confirmedSeats,
      };

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}