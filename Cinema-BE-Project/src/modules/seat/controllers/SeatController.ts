import { Request, Response } from "express";
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import { SeatService } from "../services/SeatService";
import { HoldSeatDTO } from "../dtos/HoldSeat.dto";
import { ApiResponse } from "../../../utils/ApiResponse";

const seatService = new SeatService();

export class SeatController {
  async holdSeats(req: Request, res: Response) {
    const dto = plainToClass(HoldSeatDTO, req.body);
    const errors = await validate(dto);

    if (errors.length) {
      const messages = errors
        .map(err => Object.values(err.constraints || {}))
        .flat();

      return ApiResponse.error(res, messages.join(", "), 400);
    }

    try {
      const result = await seatService.holdSeats(
        dto.showtimeUUID,
        dto.seatUUIDs,
        req.user?.id
      );

      return ApiResponse.success(res, result, "Seats held successfully");
    } catch (error: any) {
      return ApiResponse.error(res, error.message);
    }
  }
}