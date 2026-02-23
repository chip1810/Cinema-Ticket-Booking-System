import { Request, Response } from "express";
import { ConcessionService } from "../services/ConcessionService";
import { CreateConcessionDTO } from "../dtos/CreateConcession.dto";
import { validate } from "class-validator";
import { plainToClass } from "class-transformer";

const concessionService = new ConcessionService();

export class ConcessionController {
    async create(req: Request, res: Response) {
        const dto = plainToClass(CreateConcessionDTO, req.body);
        const errors = await validate(dto);
        if (errors.length) return res.status(400).json({ errors });
        try {
            return res.status(201).json(await concessionService.create(dto));
        } catch (e: any) {
            return res.status(500).json({ message: e.message });
        }
    }

    async getAll(req: Request, res: Response) {
        try {
            return res.json(await concessionService.getAll());
        } catch (e: any) {
            return res.status(500).json({ message: e.message });
        }
    }

    async update(req: Request, res: Response) {
        try {
            return res.json(await concessionService.update(Number(req.params.id), req.body));
        } catch (e: any) {
            return res.status(404).json({ message: e.message });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            await concessionService.delete(Number(req.params.id));
            return res.status(204).send();
        } catch (e: any) {
            return res.status(404).json({ message: e.message });
        }
    }
}
