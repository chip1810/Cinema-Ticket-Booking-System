import { Request, Response } from "express";
import { AppDataSource } from "../mongo";
import { News, NewsStatus } from "../modules/news/models/News";
import { ApiResponse } from "../utils/ApiResponse";

const repo = AppDataSource.getRepository(News);
const ok = (res: Response, data: any, msg: string, code = 200) => ApiResponse.success(res, data, msg, code);
const fail = (res: Response, e: any, code = 400) => ApiResponse.error(res, e.message ?? e, code);

export class NewsController {

    // GET /api/news?type=PROMOTION&status=PUBLISHED
    async getAll(req: Request, res: Response) {
        try {
            const where: any = {};
            if (req.query.type) where.type = req.query.type;
            if (req.query.status) where.status = req.query.status;
            return ok(res, await repo.find({ where, order: { createdAt: "DESC" } }), "News fetched");
        } catch (e) { return fail(res, e, 500); }
    }

    // GET /api/news/:id
    async getById(req: Request, res: Response) {
        try {
            const item = await repo.findOneBy({ id: Number(req.params.id) });
            if (!item) return fail(res, { message: "News not found" }, 404);
            return ok(res, item, "News fetched");
        } catch (e) { return fail(res, e, 500); }
    }

    // POST /api/manager/news
    async create(req: Request, res: Response) {
        try {
            const { title, content, type, thumbnailUrl } = req.body;
            if (!title || !content) return fail(res, { message: "title and content are required" });
            return ok(res, await repo.save(repo.create({ title, content, type, thumbnailUrl })), "News created", 201);
        } catch (e) { return fail(res, e); }
    }

    // PUT /api/manager/news/:id
    async update(req: Request, res: Response) {
        try {
            const item = await repo.findOneBy({ id: Number(req.params.id) });
            if (!item) return fail(res, { message: "News not found" }, 404);
            return ok(res, await repo.save(Object.assign(item, req.body)), "News updated");
        } catch (e) { return fail(res, e); }
    }

    // PATCH /api/manager/news/:id/publish
    // DRAFT → PUBLISHED (set publishedAt)
    // PUBLISHED/ARCHIVED → ARCHIVED (clear publishedAt)
    async togglePublish(req: Request, res: Response) {
        try {
            const item = await repo.findOneBy({ id: Number(req.params.id) });
            if (!item) return fail(res, { message: "News not found" }, 404);
            if (item.status === NewsStatus.PUBLISHED) {
                item.status = NewsStatus.ARCHIVED;
                item.publishedAt = undefined;
            } else {
                item.status = NewsStatus.PUBLISHED;
                item.publishedAt = new Date();
            }
            return ok(res, await repo.save(item), `News ${item.status.toLowerCase()}`);
        } catch (e) { return fail(res, e); }
    }

    // DELETE /api/manager/news/:id
    async delete(req: Request, res: Response) {
        try {
            const item = await repo.findOneBy({ id: Number(req.params.id) });
            if (!item) return fail(res, { message: "News not found" }, 404);
            await repo.remove(item);
            return ok(res, null, "News deleted");
        } catch (e) { return fail(res, e); }
    }
}
