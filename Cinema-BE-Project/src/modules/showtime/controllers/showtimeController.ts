import { Request, Response } from "express";
import { showtimeService } from "../services/showtimeService";
import { ApiResponse } from "../../../utils/ApiResponse";

export const showtimeController = {

    async getAll(req: Request, res: Response) {
        try {
            const showtimes = await showtimeService.getAllShowtimes();

            return ApiResponse.success(
                res,
                showtimes,
                "Showtimes fetched successfully"
            );
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Internal Server Error";

            return ApiResponse.error(res, message, 500);
        }
    },

    async getByMovieId(req: Request, res: Response) {
        try {
            const movieId = Number(req.params.movieId);

            if (isNaN(movieId)) {
                return ApiResponse.error(res, "Invalid movieId", 400);
            }

            const showtimes =
                await showtimeService.getShowtimesByMovieId(movieId);

            return ApiResponse.success(
                res,
                showtimes,
                "Showtimes fetched successfully"
            );
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Internal Server Error";

            return ApiResponse.error(res, message, 500);
        }
    },

    async getNearest(req: Request, res: Response) {
        try {
            const showtimes = await showtimeService.getNearestShowtimes();

            return ApiResponse.success(
                res,
                showtimes,
                "Nearest showtimes fetched successfully"
            );
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Internal Server Error";

            return ApiResponse.error(res, message, 500);
        }
    },
};
