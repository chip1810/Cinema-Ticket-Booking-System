import { Request, Response } from "express";
import { ConcessionService } from "../services/ConcessionService";
import { CreateConcessionDTO } from "../dtos/CreateConcession.dto";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { ApiResponse } from "../../../utils/ApiResponse";

const concessionService = new ConcessionService();

export class ConcessionController {
    async getAll(req: Request, res: Response) {
        try {
            const result = await concessionService.getAll();
            return ApiResponse.success(res, result, "Concessions fetched");
        } catch (e: any) {
            return ApiResponse.error(res, e.message ?? e, 500);
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const id = Number(req.params.id);
            if (isNaN(id)) return ApiResponse.error(res, "Invalid id", 400);
            const result = await concessionService.getById(id);
            return ApiResponse.success(res, result, "Concession fetched");
        } catch (e: any) {
            return ApiResponse.error(res, e.message ?? e, 404);
        }
    }

    async create(req: Request, res: Response) {
        const dto = plainToInstance(CreateConcessionDTO, req.body);
        const errors = await validate(dto);
        if (errors.length > 0) {
            const messages = errors.map(e => Object.values(e.constraints || {})).flat();
            return ApiResponse.error(res, messages.join(", "), 400);
        }
        try {
            const result = await concessionService.create(dto);
            return ApiResponse.success(res, result, "Concession created", 201);
        } catch (e: any) {
            return ApiResponse.error(res, e.message ?? e, 500);
        }
    }

    async update(req: Request, res: Response) {
        try {
            const id = Number(req.params.id);
            if (isNaN(id)) return ApiResponse.error(res, "Invalid id", 400);
            const result = await concessionService.update(id, req.body);
            return ApiResponse.success(res, result, "Concession updated");
        } catch (e: any) {
            return ApiResponse.error(res, e.message ?? e, 404);
        }
    }

    async updateStock(req: Request, res: Response) {
        const id = Number(req.params.id);
        const qty = Number(req.body.quantity);
        if (isNaN(id)) return ApiResponse.error(res, "Invalid id", 400);
        if (isNaN(qty)) return ApiResponse.error(res, "quantity must be a number", 400);
        try {
            await concessionService.updateStock(id, qty);
            return ApiResponse.success(res, null, "Stock updated");
        } catch (e: any) {
            return ApiResponse.error(res, e.message ?? e, 404);
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const id = Number(req.params.id);
            if (isNaN(id)) return ApiResponse.error(res, "Invalid id", 400);
            await concessionService.delete(id);
            return ApiResponse.success(res, null, "Concession deleted");
        } catch (e: any) {
            return ApiResponse.error(res, e.message ?? e, 404);
        }
    }
}