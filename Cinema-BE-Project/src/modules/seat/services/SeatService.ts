import { DataSource } from "typeorm";
import { AppDataSource } from "../../../data-source";
import { Seat } from "../models/Seat";
import { Showtime } from "../../showtime/models/Showtime";
import { SeatHold } from "../../seat/models/SeatHold";
import { Ticket } from "../../ticket/models/Ticket";

export class SeatService {
  async holdSeats(
    showtimeUUID: string,
    seatUUIDs: string[],
    userId?: number
  ) {
    const queryRunner = AppDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const showtime = await queryRunner.manager.findOneOrFail(Showtime, {
        where: { UUID: showtimeUUID },
      });

      const seats = await queryRunner.manager.find(Seat, {
        where: seatUUIDs.map((uuid) => ({ UUID: uuid })),
        lock: { mode: "pessimistic_write" },
      });

      if (seats.length !== seatUUIDs.length) {
        throw new Error("Some seats not found");
      }

      const now = new Date();

      for (const seat of seats) {
        // 1️⃣ Check đã bán chưa
        const existingTicket = await queryRunner.manager.findOne(Ticket, {
          where: {
            showtime: { id: showtime.id },
            seat: { id: seat.id },
          },
        });

        if (existingTicket) {
          throw new Error(`Seat ${seat.seatNumber} already sold`);
        }

        // 2️⃣ Check đang hold chưa
        const existingHold = await queryRunner.manager
          .createQueryBuilder(SeatHold, "hold")
          .where("hold.showtimeId = :showtimeId", {
            showtimeId: showtime.id,
          })
          .andWhere("hold.seatId = :seatId", { seatId: seat.id })
          .andWhere("hold.expiresAt > :now", { now })
          .getOne();

        if (existingHold) {
          throw new Error(`Seat ${seat.seatNumber} is being held`);
        }

        // 3️⃣ Insert hold
        const hold = queryRunner.manager.create(SeatHold, {
          showtime,
          seat,
          user: userId ? { id: userId } : undefined,
          expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        });

        await queryRunner.manager.save(hold);
      }

      await queryRunner.commitTransaction();

      return {
        message: "Seats held successfully",
        expiresIn: 300,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
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