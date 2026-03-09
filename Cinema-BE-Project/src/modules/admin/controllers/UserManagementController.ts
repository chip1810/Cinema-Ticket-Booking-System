import { Request, Response } from "express";
import { ApiResponse } from "../../../utils/ApiResponse";
import { UserManagementService } from "../services/UserManagementService";

const service = new UserManagementService();

export class UserManagementController {

    async getAllCustomers(req: Request, res: Response) {
        try {
            const users = await service.getAllCustomers();

            return ApiResponse.success(res, users, "Customers retrieved", 200);

        } catch {
            return ApiResponse.error(res, "Internal Server Error", 500);
        }
    }

    async blockUser(req: Request, res: Response) {
        try {
            const id = req.params.id;

            if (!id || Array.isArray(id)) {
                return ApiResponse.error(res, "Invalid ID", 400);
            }

            const user = await service.blockUser(id);

            return ApiResponse.success(res, user, "User blocked successfully", 200);

        } catch (error: any) {

            if (error.message === "User not found") {
                return ApiResponse.error(res, error.message, 404);
            }

            return ApiResponse.error(res, "Internal Server Error", 500);
        }
    }
}