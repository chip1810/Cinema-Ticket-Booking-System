import { Request, Response } from "express";
import { hallManagerService } from "../services/HallManagerService";
import { ApiResponse } from "../utils/ApiResponse";

const ok = (res: Response, data: any, msg: string, code = 200) => ApiResponse.success(res, data, msg, code);
const fail = (res: Response, e: any, code = 400) => ApiResponse.error(res, e.message, code);

export class HallManagerController {
    async getAllHalls(req: Request, res: Response) {
        try { return ok(res, await hallManagerService.getAllHalls(), "Halls fetched"); }
        catch (e) { return fail(res, e, 500); }
    }

    async getHallById(req: Request, res: Response) {
        try { return ok(res, await hallManagerService.getHallById(Number(req.params.id)), "Hall fetched"); }
        catch (e) { return fail(res, e, 404); }
    }

    async createHall(req: Request, res: Response) {
        try {
            const { name, type, capacity } = req.body;
            if (!name || !type || !capacity) return fail(res, { message: "name, type, capacity required" });
            return ok(res, await hallManagerService.createHall({ name, type, capacity }), "Hall created", 201);
        } catch (e) { return fail(res, e); }
    }

    async updateHall(req: Request, res: Response) {
        try { return ok(res, await hallManagerService.updateHall(Number(req.params.id), req.body), "Hall updated"); }
        catch (e) { return fail(res, e); }
    }

    async deleteHall(req: Request, res: Response) {
        try { await hallManagerService.deleteHall(Number(req.params.id)); return ok(res, null, "Hall deleted"); }
        catch (e) { return fail(res, e, 404); }
    }

    // POST /api/manager/halls/:id/layout  — Body: { seats: [{row, col, type}] }
    async setSeatLayout(req: Request, res: Response) {
        try {
            const result = await hallManagerService.setSeatLayout(Number(req.params.id), req.body.seats);
            return ok(res, result, "Seat layout saved", 201);
        } catch (e) { return fail(res, e); }
    }

    // GET /api/manager/halls/:id/layout
    async getSeatLayout(req: Request, res: Response) {
        try { return ok(res, await hallManagerService.getSeatLayout(Number(req.params.id)), "Seat layout fetched"); }
        catch (e) { return fail(res, e, 404); }
    }
}
