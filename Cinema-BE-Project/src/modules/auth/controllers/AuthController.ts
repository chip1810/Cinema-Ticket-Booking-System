import { Request, Response } from "express";
import { AuthService } from "../services/AuthService";
import { RegisterDTO, LoginDTO, ResetPasswordDTO } from "../dtos/Auth.dto";
import { validate } from "class-validator";
import { plainToClass } from "class-transformer";
import { ApiResponse } from "../../../utils/ApiResponse";

const authService = new AuthService();

const validateDTO = async (dto: object) => validate(dto);

export class AuthController {

    async register(req: Request, res: Response) {
        const dto = plainToClass(RegisterDTO, req.body);
        const errors = await validateDTO(dto);

        if (errors.length)
            return ApiResponse.error(res, "Validation failed", 400);

        try {
            const result = await authService.register(dto);
            return ApiResponse.success(res, result, "Register successfully", 201);
        } catch (e: any) {
            return ApiResponse.error(res, e.message, 400);
        }
    }

    async login(req: Request, res: Response) {
        const dto = plainToClass(LoginDTO, req.body);
        const errors = await validateDTO(dto);

        if (errors.length)
            return ApiResponse.error(res, "Validation failed", 400);

        try {
            const result = await authService.login(dto);
            return ApiResponse.success(res, result, "Login successfully");
        } catch (e: any) {
            return ApiResponse.error(res, e.message, 401);
        }
    }

    async forgotPassword(req: Request, res: Response) {
        const { email } = req.body;

        if (!email)
            return ApiResponse.error(res, "Email is required", 400);

        try {
            const result = await authService.forgotPassword(email);
            return ApiResponse.success(res, result, "OTP sent to email");
        } catch (e: any) {
            return ApiResponse.error(res, e.message, 400);
        }
    }

    async resetPassword(req: Request, res: Response) {
        const dto = plainToClass(ResetPasswordDTO, req.body);
        const errors = await validateDTO(dto);

        if (errors.length)
            return ApiResponse.error(res, "Validation failed", 400);

        try {
            const result = await authService.resetPassword(dto);
            return ApiResponse.success(res, result, "Password reset successfully");
        } catch (e: any) {
            return ApiResponse.error(res, e.message, 400);
        }
    }
}