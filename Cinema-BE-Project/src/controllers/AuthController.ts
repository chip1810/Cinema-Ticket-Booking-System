import { Request, Response } from "express";
import { AuthService } from "../services/AuthService";
import { RegisterDTO, LoginDTO, ResetPasswordDTO } from "../dtos/Auth.dto";
import { validate } from "class-validator";
import { plainToClass } from "class-transformer";

const authService = new AuthService();

const validateDTO = async (dto: object) => validate(dto);

export class AuthController {
    async register(req: Request, res: Response) {
        const dto = plainToClass(RegisterDTO, req.body);
        const errors = await validateDTO(dto);
        if (errors.length) return res.status(400).json({ errors });
        try {
            return res.status(201).json(await authService.register(dto));
        } catch (e: any) {
            return res.status(400).json({ message: e.message });
        }
    }

    async login(req: Request, res: Response) {
        const dto = plainToClass(LoginDTO, req.body);
        const errors = await validateDTO(dto);
        if (errors.length) return res.status(400).json({ errors });
        try {
            return res.json(await authService.login(dto));
        } catch (e: any) {
            return res.status(401).json({ message: e.message });
        }
    }

    async forgotPassword(req: Request, res: Response) {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: "Email is required" });
        try {
            return res.json(await authService.forgotPassword(email));
        } catch (e: any) {
            return res.status(400).json({ message: e.message });
        }
    }

    async resetPassword(req: Request, res: Response) {
        const dto = plainToClass(ResetPasswordDTO, req.body);
        const errors = await validateDTO(dto);
        if (errors.length) return res.status(400).json({ errors });
        try {
            return res.json(await authService.resetPassword(dto));
        } catch (e: any) {
            return res.status(400).json({ message: e.message });
        }
    }
}
