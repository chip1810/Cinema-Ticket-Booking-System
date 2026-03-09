import { Request, Response } from "express";
import { ApiResponse } from "../../../utils/ApiResponse";
import { StaffManagementService } from "../services/StaffManagementService";

const service = new StaffManagementService();

export class StaffManagementController {

    async createStaff(req: Request, res: Response) {
        try {
            const staff = await service.createStaff(req.body);

            return ApiResponse.success(res, staff, "Staff created successfully", 201);

        } catch (error: any) {

            if (error.message === "Email already exists") {
                return ApiResponse.error(res, error.message, 400);
            }

            return ApiResponse.error(res, "Internal Server Error", 500);
        }
    }

    async getAllStaff(req: Request, res: Response) {
        try {
            const staff = await service.getAllStaff();

            return ApiResponse.success(res, staff, "Staff retrieved successfully", 200);

        } catch {
            return ApiResponse.error(res, "Internal Server Error", 500);
        }
    }
}