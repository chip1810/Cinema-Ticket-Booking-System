import { Request, Response } from "express";
import { AuthUser } from "../../../types/auth-user";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { SeatService } from "../services/SeatService";
import { ApiResponse } from "../../../utils/ApiResponse";
import { HoldSeatDTO } from "../dtos/HoldSeat.dto";
import { ConfirmBookingDTO } from "../dtos/ConfirmBooking.dto";

const seatService = new SeatService();

interface AuthRequest extends Request {
    user?: AuthUser;
}

export class SeatController {

    // 🎟 HOLD SEATS
    async holdSeats(req: AuthRequest, res: Response) {
        const dto = plainToInstance(HoldSeatDTO, req.body);
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
            const result = await seatService.holdSeats(
                dto.showtimeUUID,
                dto.seatUUIDs,
                req.user.id
            );

            return ApiResponse.success(res, result, "Seats held successfully");

        } catch (error: any) {
            return ApiResponse.error(res, error.message, 400);
        }
    }

    // ✅ CONFIRM BOOKING
    async confirmBooking(req: AuthRequest, res: Response) {
        const dto = plainToInstance(ConfirmBookingDTO, req.body);
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
            const result = await seatService.confirmBooking(
                dto.showtimeUUID,
                dto.seatUUIDs,
                req.user.id
            );

            return ApiResponse.success(res, result, "Booking confirmed");

        } catch (error: any) {
            return ApiResponse.error(res, error.message, 400);
        }
    }
}