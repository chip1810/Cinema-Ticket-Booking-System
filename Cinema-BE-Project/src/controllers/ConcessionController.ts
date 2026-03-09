import { Request, Response } from "express";
import { ConcessionService } from "../services/ConcessionService";
import { CreateConcessionDTO } from "../dtos/CreateConcession.dto";
import { validate } from "class-validator";
import { plainToClass } from "class-transformer";
import { ApiResponse } from "../utils/ApiResponse";

const svc = new ConcessionService();
const ok = (res: Response, data: any, msg: string, code = 200) => ApiResponse.success(res, data, msg, code);
const fail = (res: Response, e: any, code = 400) => ApiResponse.error(res, e.message ?? e, code);

export class ConcessionController {

    async getAll(req: Request, res: Response) {
        try { return ok(res, await svc.getAll(), "Concessions fetched"); }
        catch (e) { return fail(res, e, 500); }
    }

    async getById(req: Request, res: Response) {
        try { return ok(res, await svc.getById(Number(req.params.id)), "Concession fetched"); }
        catch (e) { return fail(res, e, 404); }
    }

    async create(req: Request, res: Response) {
        const dto = plainToClass(CreateConcessionDTO, req.body);
        const errors = await validate(dto);
        if (errors.length) return fail(res, { message: "Validation failed" });
        try { return ok(res, await svc.create(dto), "Concession created", 201); }
        catch (e) { return fail(res, e, 500); }
    }

    async update(req: Request, res: Response) {
        try { return ok(res, await svc.update(Number(req.params.id), req.body), "Concession updated"); }
        catch (e) { return fail(res, e, 404); }
    }

    // PATCH /api/concessions/:id/stock  — { quantity: number }
    async updateStock(req: Request, res: Response) {
        const qty = Number(req.body.quantity);
        if (isNaN(qty)) return fail(res, { message: "quantity must be a number" });
        try { return ok(res, await svc.updateStock(Number(req.params.id), qty), "Stock updated"); }
        catch (e) { return fail(res, e, 404); }
    }

    async delete(req: Request, res: Response) {
        try { await svc.delete(Number(req.params.id)); return ok(res, null, "Concession deleted"); }
        catch (e) { return fail(res, e, 404); }
    }
}
