import { Request, Response } from "express";
import { MovieService } from "../services/MovieService";
import { CreateMovieDTO } from "../dtos/CreateMovie.dto";
import { validate } from "class-validator";
import { plainToClass } from "class-transformer";

const movieService = new MovieService();

export class MovieController {
    async create(req: Request, res: Response) {
        const dto = plainToClass(CreateMovieDTO, req.body);
        const errors = await validate(dto);
        if (errors.length) return res.status(400).json({ errors });
        try {
            return res.status(201).json(await movieService.createMovie(dto));
        } catch (e: any) {
            return res.status(400).json({ message: e.message });
        }
    }

    async getAll(req: Request, res: Response) {
        try {
            return res.json(await movieService.getAllMovies());
        } catch (e: any) {
            return res.status(500).json({ message: e.message });
        }
    }

    async getById(req: Request, res: Response) {
        try {
            return res.json(await movieService.getMovieById(String(req.params.id)));
        } catch (e: any) {
            return res.status(404).json({ message: e.message });
        }
    }

    async update(req: Request, res: Response) {
        try {
            return res.json(await movieService.updateMovie(String(req.params.id), req.body));
        } catch (e: any) {
            return res.status(404).json({ message: e.message });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            await movieService.deleteMovie(String(req.params.id));
            return res.status(204).send();
        } catch (e: any) {
            return res.status(404).json({ message: e.message });
        }
    }
}
