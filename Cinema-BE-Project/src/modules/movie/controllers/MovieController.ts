import { Request, Response } from "express";
import { MovieService } from "../services/MovieService";
import { CreateMovieDTO } from "../dtos/CreateMovie.dto";
import { validate } from "class-validator";
import { plainToClass } from "class-transformer";
import { ApiResponse } from "../../../utils/ApiResponse";

const movieService = new MovieService();

export class MovieController {

    async create(req: Request, res: Response) {
        try {
            const dto = plainToClass(CreateMovieDTO, req.body);
            const errors = await validate(dto);

            if (errors.length) {
                const errorMessages = errors.map(e => Object.values(e.constraints || {})).flat().join(", ");
                console.log("Validation errors:", JSON.stringify(errors, null, 2));
                return ApiResponse.error(res, `Validation failed: ${errorMessages}`, 400);
            }

            const movie = await movieService.createMovie(dto);

            return ApiResponse.success(res, movie, "Movie created successfully", 201);

        } catch (e: any) {
            return ApiResponse.error(res, e.message, 400);
        }
    }

    async getAll(req: Request, res: Response) {
        try {
            const movies = await movieService.getAllMovies();

            return ApiResponse.success(res, movies, "Movies fetched successfully");

        } catch (e: any) {
            return ApiResponse.error(res, e.message, 500);
        }
    }

    async getById(req: Request, res: Response) {
        try {
            const movie = await movieService.getMovieById(Number(req.params.id));

            return ApiResponse.success(res, movie, "Movie fetched successfully");

        } catch (e: any) {
            return ApiResponse.error(res, e.message, 404);
        }
    }

    async update(req: Request, res: Response) {
        try {
            const movie = await movieService.updateMovie(
                Number(req.params.id),
                req.body
            );

            return ApiResponse.success(res, movie, "Movie updated successfully");

        } catch (e: any) {
            return ApiResponse.error(res, e.message, 404);
        }
    }

    async delete(req: Request, res: Response) {
        try {
            await movieService.deleteMovie(Number(req.params.id));

            return ApiResponse.success(res, null, "Movie deleted successfully", 200);

        } catch (e: any) {
            return ApiResponse.error(res, e.message, 404);
        }
    }
}