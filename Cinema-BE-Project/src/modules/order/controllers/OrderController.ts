import { Request, Response } from "express";
import { AuthUser } from "../../../types/auth-user";
import { OrderService } from "../services/OrderService";
import { ApiResponse } from "../../../utils/ApiResponse";

const orderService = new OrderService();

interface AuthRequest extends Request {
    user?: AuthUser;
}

export class OrderController {
    async getBookingHistory(req: AuthRequest, res: Response) {
        if (!req.user) {
            return ApiResponse.error(res, "Unauthorized", 401);
        }

        try {
            const result = await orderService.getBookingHistory(req.user.id);
            return ApiResponse.success(res, result, "Booking history fetched successfully");
        } catch (error) {
            const message = error instanceof Error ? error.message : "Internal Server Error";
            return ApiResponse.error(res, message, 500);
        }
    }
}