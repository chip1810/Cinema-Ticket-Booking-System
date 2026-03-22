import { Request, Response } from "express";
import { AppDataSource } from "../mongo";
import { Banner } from "../modules/banner/models/Banner";
import { ApiResponse } from "../utils/ApiResponse";

const repo = AppDataSource.getRepository(Banner);
const ok = (res: Response, data: any, msg: string, code = 200) => ApiResponse.success(res, data, msg, code);
const fail = (res: Response, e: any, code = 400) => ApiResponse.error(res, e.message ?? e, code);

const findBanner = async (id: number) => {
    const item = await repo.findOneBy({ id });
    if (!item) throw new Error("Banner not found");
    return item;
};

export class BannerController {

    // GET /api/banners — chỉ trả active banners, sort theo position
    async getAll(req: Request, res: Response) {
        try {
            const showAll = req.query.all === "true"; // manager xem hết
            const where = showAll ? {} : { isActive: true };
            return ok(res, await repo.find({ where, order: { position: "ASC" } }), "Banners fetched");
        } catch (e) { return fail(res, e, 500); }
    }

    // POST /api/manager/banners
    async create(req: Request, res: Response) {
        try {
            const { title, imageUrl, linkUrl, position, startDate, endDate } = req.body;
            if (!title || !imageUrl) return fail(res, { message: "title and imageUrl are required" });
            return ok(res, await repo.save(repo.create({ title, imageUrl, linkUrl, position, startDate, endDate })), "Banner created", 201);
        } catch (e) { return fail(res, e); }
    }

    // PUT /api/manager/banners/:id
    async update(req: Request, res: Response) {
        try {
            const item = await findBanner(Number(req.params.id));
            return ok(res, await repo.save(Object.assign(item, req.body)), "Banner updated");
        } catch (e) { return fail(res, e, 404); }
    }

    // PATCH /api/manager/banners/:id/toggle — bật/tắt banner
    async toggle(req: Request, res: Response) {
        try {
            const item = await findBanner(Number(req.params.id));
            item.isActive = !item.isActive;
            return ok(res, await repo.save(item), `Banner ${item.isActive ? "activated" : "deactivated"}`);
        } catch (e) { return fail(res, e, 404); }
    }

    // DELETE /api/manager/banners/:id
    async delete(req: Request, res: Response) {
        try {
            await repo.remove(await findBanner(Number(req.params.id)));
            return ok(res, null, "Banner deleted");
        } catch (e) { return fail(res, e, 404); }
    }
}
