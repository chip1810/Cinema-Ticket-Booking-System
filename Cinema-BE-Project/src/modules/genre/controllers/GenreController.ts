import { Request, Response } from "express";
import { AppDataSource } from "../../../data-source";
import { Genre } from "../models/Genre";
import { ApiResponse } from "../../../utils/ApiResponse";

const repo = AppDataSource.getRepository(Genre);
const ok = (res: Response, data: any, msg: string, code = 200) => ApiResponse.success(res, data, msg, code);
const fail = (res: Response, e: any, code = 400) => ApiResponse.error(res, e.message ?? e, code);

const findGenre = async (id: number) => {
    const item = await repo.findOneBy({ id });
    if (!item) throw new Error("Genre not found");
    return item;
};

export class GenreController {
    // DELETE /api/genres/:id
    async delete(req: Request, res: Response) {
        try {
            const item = await findGenre(Number(req.params.id));
            await repo.remove(item);
            return ok(res, null, "Genre deleted");
        } catch (e) { return fail(res, e, 404); }
    }

    // GET /api/genres
    // GET /api/manager/genres
    async getAll(req: Request, res: Response) {
        try {
            return ok(res, await repo.find({ order: { name: "ASC" } }), "Genres fetched");
        } catch (e) { return fail(res, e, 500); }
    }

    // POST /api/manager/genres
    async create(req: Request, res: Response) {
        try {
            const { name, description } = req.body;
            if (!name) return fail(res, { message: "name is required" });
            return ok(res, await repo.save(repo.create({ name, description })), "Genre created", 201);
        } catch (e) { return fail(res, e); }
    }

    // PUT /api/manager/genres/:id
    async update(req: Request, res: Response) {
        try {
            const item = await findGenre(Number(req.params.id));
            return ok(res, await repo.save(Object.assign(item, req.body)), "Genre updated");
        } catch (e) { return fail(res, e, 404); }
    }
}