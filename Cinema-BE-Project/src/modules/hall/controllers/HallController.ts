import { Request, Response } from "express";
import { AppDataSource } from "../../../data-source";
import { Hall } from "../models/Hall";
import { Seat } from "../../seat/models/Seat";
import { ApiResponse } from "../../../utils/ApiResponse";

const hallRepo = AppDataSource.getRepository(Hall);
const seatRepo = AppDataSource.getRepository(Seat);
const ok = (res: Response, data: any, msg: string, code = 200) => ApiResponse.success(res, data, msg, code);
const fail = (res: Response, e: any, code = 400) => ApiResponse.error(res, e.message ?? e, code);

export class HallController {

    // POST /api/manager/halls
    async create(req: Request, res: Response) {
        try {
            const { name, type, capacity } = req.body;
            const hall = hallRepo.create({ name, type, capacity });
            await hallRepo.save(hall);
            return ok(res, hall, "Hall created", 201);
        } catch (e) { return fail(res, e); }
    }

    // GET /api/manager/halls
    async getAll(req: Request, res: Response) {
        try {
            const halls = await hallRepo.find();
            return ok(res, halls, "Halls fetched");
        } catch (e) { return fail(res, e, 500); }
    }

    // PUT /api/manager/halls/:id/layout
    async saveLayout(req: Request, res: Response) {
        const hallId = Number(req.params.id);
        const { seats } = req.body; // Expects an array of { seatNumber, type, row, col }

        if (!Array.isArray(seats)) {
            return fail(res, "Invalid seat layout data", 400);
        }

        const queryRunner = AppDataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            // Xóa layout cũ
            await queryRunner.manager.delete(Seat, { hall: { id: hallId } });

            // Tạo layout mới
            const seatEntities = seats.map(s => seatRepo.create({ ...s, hall: { id: hallId } }));
            await queryRunner.manager.save(seatEntities);

            await queryRunner.commitTransaction();
            return ok(res, { seatsCreated: seatEntities.length }, "Seat layout updated successfully");
        } catch (e) {
            await queryRunner.rollbackTransaction();
            return fail(res, e, 500);
        } finally {
            await queryRunner.release();
        }
    }
}