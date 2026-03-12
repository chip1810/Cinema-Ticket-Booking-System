import { Request, Response } from "express";
import { ApiResponse } from "../../../utils/ApiResponse";
import { StaffManagementService } from "../services/StaffManagementService";

const service = new StaffManagementService();

export class StaffManagementController {

    async createStaff(req: Request, res: Response) {
        try {
            const { email, phoneNumber } = req.body;

            // Email phải có định dạng hợp lệ và kết thúc bằng @gmail.com
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!email || typeof email !== "string" || !emailPattern.test(email) || !email.endsWith("@gmail.com")) {
                return ApiResponse.error(res, "Email must be a valid gmail address (@gmail.com)", 400);
            }

            // Số điện thoại Việt Nam đơn giản: bắt đầu bằng 0, đủ 10 chữ số
            const phonePattern = /^0\d{9}$/;
            if (phoneNumber && (typeof phoneNumber !== "string" || !phonePattern.test(phoneNumber))) {
                return ApiResponse.error(res, "Phone number must be 10 digits and start with 0", 400);
            }

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