import { Request, Response } from "express";
import { AppDataSource } from "../../../data-source";
import { Concession } from "../models/Concession"; // Giả định model đã tồn tại
import { ApiResponse } from "../../../utils/ApiResponse";

const repo = AppDataSource.getRepository(Concession);
const ok = (res: Response, data: any, msg: string, code = 200) => ApiResponse.success(res, data, msg, code);
const fail = (res: Response, e: any, code = 400) => ApiResponse.error(res, e.message ?? e, code);

const findItem = async (id: number) => {
    const item = await repo.findOneBy({ id });
    if (!item) throw new Error("Concession not found");
    return item;
};

export class ConcessionController {

    // GET /api/concessions
    async getAll(req: Request, res: Response) {
        try {
            return ok(res, await repo.find({ order: { name: "ASC" } }), "Concessions fetched");
        } catch (e) { return fail(res, e, 500); }
    }

    // POST /api/manager/concessions
    async create(req: Request, res: Response) {
        try {
            // body: { name, price, imageUrl, stockQuantity }
            const item = repo.create(req.body);
            return ok(res, await repo.save(item), "Concession created", 201);
        } catch (e) { return fail(res, e); }
    }

    // GET /api/concessions/:id
    async getById(req: Request, res: Response) {
        try {
            const item = await findItem(Number(req.params.id));
            return ok(res, item, "Concession fetched");
        } catch (e) { return fail(res, e, 404); }
    }

    // PUT /api/manager/concessions/:id
    async update(req: Request, res: Response) {
        try {
            const item = await findItem(Number(req.params.id));
            // Cập nhật stock, giá, ...
            return ok(res, await repo.save(Object.assign(item, req.body)), "Concession updated");
        } catch (e) { return fail(res, e, 404); }
    }

    // PATCH /api/manager/concessions/:id/stock
    async updateStock(req: Request, res: Response) {
        try {
            const item = await findItem(Number(req.params.id));
            const { stockQuantity } = req.body;
            if (typeof stockQuantity !== 'number' || stockQuantity < 0) {
                throw new Error("Invalid stock quantity");
            }
            item.stockQuantity = stockQuantity;
            return ok(res, await repo.save(item), "Stock updated");
        } catch (e) { return fail(res, e, 400); }
    }

    // DELETE /api/manager/concessions/:id
    async delete(req: Request, res: Response) {
        try {
            const item = await findItem(Number(req.params.id));
            await repo.remove(item);
            return ok(res, null, "Concession deleted");
        } catch (e) { return fail(res, e, 404); }
    }
}