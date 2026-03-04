import { Request, Response } from "express";
import { ShowtimeService } from "../services/ShowtimeService";
import { CreateShowtimeDTO } from "../dtos/CreateShowtime.dto";
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import { ApiResponse } from "../utils/ApiResponse";

const showtimeService = new ShowtimeService();

export class ShowtimeController {

    async create(req: Request, res: Response) {
        const dto = plainToClass(CreateShowtimeDTO, req.body);
        const errors = await validate(dto);
        if (errors.length) return ApiResponse.error(res, "Validation failed", 400);
        try {
            const showtime = await showtimeService.createShowtime(dto);
            return ApiResponse.success(res, showtime, "Showtime created successfully", 201);
        } catch (e: any) {
            return ApiResponse.error(res, e.message, 400);
        }
    }

    async getAll(req: Request, res: Response) {
        try {
            return ApiResponse.success(res, await showtimeService.getAllShowtimes(), "Showtimes fetched successfully");
        } catch (e: any) {
            return ApiResponse.error(res, e.message, 500);
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const id = Number(req.params.id);
            if (isNaN(id)) return ApiResponse.error(res, "Invalid id", 400);
            const showtime = await showtimeService.getShowtimeById(id);
            return ApiResponse.success(res, showtime, "Showtime fetched successfully");
        } catch (e: any) {
            return ApiResponse.error(res, e.message, 404);
        }
    }

    async update(req: Request, res: Response) {
        try {
            const id = Number(req.params.id);
            if (isNaN(id)) return ApiResponse.error(res, "Invalid id", 400);
            const showtime = await showtimeService.updateShowtime(id, req.body);
            return ApiResponse.success(res, showtime, "Showtime updated successfully");
        } catch (e: any) {
            return ApiResponse.error(res, e.message, 400);
        }
    }

    async delete(req: Request, res: Response) {
        try {
            await showtimeService.deleteShowtime(Number(req.params.id));
            return ApiResponse.success(res, null, "Showtime cancelled successfully");
        } catch (e: any) {
            return ApiResponse.error(res, e.message, 404);
        }
    }
}
