import { Request, Response } from "express";
import { AppDataSource } from "../mongo";
import { PricingRule } from "../modules/pricing_rule/models/PricingRule";
import { Showtime } from "../modules/showtime/models/Showtime";
import { SeatType } from "../modules/seat/models/enums/SeatType";
import { ApiResponse } from "../utils/ApiResponse";

const repo = AppDataSource.getRepository(PricingRule);
const ok = (res: Response, data: any, msg: string, code = 200) => ApiResponse.success(res, data, msg, code);
const fail = (res: Response, e: any, code = 400) => ApiResponse.error(res, e.message ?? e, code);

export class PricingManagerController {

    // GET /api/manager/pricing/:showtimeId
    async getByShowtime(req: Request, res: Response) {
        try {
            const rules = await repo.find({ where: { showtimeId: Number(req.params.showtimeId) } });
            return ok(res, rules, "Pricing rules fetched");
        } catch (e) { return fail(res, e, 500); }
    }

    // POST /api/manager/pricing
    // Body: { showtimeId, rules: [{ seatType: "NORMAL"|"VIP"|"COUPLE", price: number }] }
    async setRules(req: Request, res: Response) {
        try {
            const { showtimeId, rules } = req.body;
            if (!showtimeId || !Array.isArray(rules) || !rules.length)
                return fail(res, { message: "showtimeId and rules[] are required" });

            if (!await AppDataSource.getRepository(Showtime).findOneBy({ id: showtimeId }))
                return fail(res, { message: "Showtime not found" }, 404);

            // Upsert: xóa cũ → lưu mới
            await repo.delete({ showtimeId });
            const saved = await repo.save(
                rules.map((r: { seatType: SeatType; price: number }) =>
                    repo.create({ showtimeId, seatType: r.seatType, price: r.price })
                )
            );
            return ok(res, saved, "Pricing rules updated", 201);
        } catch (e) { return fail(res, e); }
    }

    // DELETE /api/manager/pricing/:showtimeId
    async deleteByShowtime(req: Request, res: Response) {
        try {
            await repo.delete({ showtimeId: Number(req.params.showtimeId) });
            return ok(res, null, "Pricing rules deleted");
        } catch (e) { return fail(res, e, 500); }
    }
}
