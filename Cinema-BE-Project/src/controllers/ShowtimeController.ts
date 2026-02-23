import { Request, Response } from "express";
import { ShowtimeService } from "../services/ShowtimeService";
import { CreateShowtimeDTO } from "../dtos/CreateShowtime.dto";
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";

const showtimeService = new ShowtimeService();

export class ShowtimeController {
    async create(req: Request, res: Response) {
        const dto = plainToClass(CreateShowtimeDTO, req.body);
        const errors = await validate(dto);
        if (errors.length) return res.status(400).json({ errors });
        try {
            return res.status(201).json(await showtimeService.createShowtime(dto));
        } catch (e: any) {
            return res.status(400).json({ message: e.message });
        }
    }

    async getAll(req: Request, res: Response) {
        try {
            return res.json(await showtimeService.getAllShowtimes());
        } catch (e: any) {
            return res.status(500).json({ message: e.message });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            await showtimeService.deleteShowtime(String(req.params.id));
            return res.status(204).send();
        } catch (e: any) {
            return res.status(404).json({ message: e.message });
        }
    }
}
