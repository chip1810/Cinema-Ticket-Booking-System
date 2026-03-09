import { Request, Response } from "express";
import { AuthUser } from "../../../types/auth-user";
import { VoucherService } from "../services/VoucherService";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { CreateVoucherDTO } from "../dtos/CreateVoucherDto";
import { UpdateVoucherDTO } from "../dtos/UpdateVoucherDto";
import { ApplyVoucherDTO } from "../dtos/ApplyVoucherDto";
import { ApiResponse } from "../../../utils/ApiResponse";

const voucherService = new VoucherService();

interface AuthRequest extends Request {
    user?: AuthUser;
}

export class VoucherController {

    // ✅ CREATE
    async create(req: Request, res: Response) {
        try {
            const dto = plainToInstance(CreateVoucherDTO, req.body);
            const errors = await validate(dto);

            if (errors.length > 0) {
                const messages = errors
                    .map(err => Object.values(err.constraints || {}))
                    .flat();
                return ApiResponse.error(res, messages.join(", "), 400);
            }

            const result = await voucherService.create(dto);
            return ApiResponse.success(res, result, "Voucher created successfully");

        } catch (error: any) {
            return ApiResponse.error(res, error.message, 400);
        }
    }

    // ✅ GET ALL
    async findAll(req: Request, res: Response) {
        try {
            const result = await voucherService.findAll();
            return ApiResponse.success(res, result, "Vouchers fetched successfully");
        } catch (error: any) {
            return ApiResponse.error(res, error.message, 400);
        }
    }

    // ✅ GET BY UUID
    async findByUUID(req: Request<{ uuid: string }>, res: Response) {
        try {
            const result = await voucherService.findByUUID(req.params.uuid);
            return ApiResponse.success(res, result, "Voucher fetched successfully");
        } catch (error: any) {
            return ApiResponse.error(res, error.message, 404);
        }
    }

    // ✅ UPDATE
    async update(req: Request<{ uuid: string }>, res: Response) {
        try {
            const dto = plainToInstance(UpdateVoucherDTO, req.body);
            const errors = await validate(dto);

            if (errors.length > 0) {
                const messages = errors
                    .map(err => Object.values(err.constraints || {}))
                    .flat();
                return ApiResponse.error(res, messages.join(", "), 400);
            }

            const result = await voucherService.update(req.params.uuid, dto);
            return ApiResponse.success(res, result, "Voucher updated successfully");

        } catch (error: any) {
            return ApiResponse.error(res, error.message, 400);
        }
    }

    // ✅ DELETE
    async delete(req: Request<{ uuid: string }>, res: Response) {
        try {
            await voucherService.delete(req.params.uuid);
            return ApiResponse.success(res, null, "Voucher deleted successfully");
        } catch (error: any) {
            return ApiResponse.error(res, error.message, 404);
        }
    }

    // 🎟 APPLY (Login required)
    async apply(req: AuthRequest, res: Response) {
        const dto = plainToInstance(ApplyVoucherDTO, req.body);
        const errors = await validate(dto);

        if (errors.length > 0) {
            const messages = errors
                .map(err => Object.values(err.constraints || {}))
                .flat();
            return ApiResponse.error(res, messages.join(", "), 400);
        }

        if (!req.user) {
            return ApiResponse.error(res, "Unauthorized", 401);
        }

        try {
            const result = await voucherService.apply(
                dto,
                req.user.id
            );

            return ApiResponse.success(res, result, "Voucher applied successfully");

        } catch (error: any) {
            return ApiResponse.error(res, error.message, 400);
        }
    }
}
