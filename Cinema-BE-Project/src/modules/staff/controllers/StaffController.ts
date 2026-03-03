import { Request, Response } from "express";
import { StaffService } from "../services/StaffService";
import { ApiResponse } from "../../../utils/ApiResponse";

const staffService = new StaffService();

export class StaffController {

    // 🔎 GET /api/staff/customers/:phoneNumber
    async lookupCustomer(req: Request, res: Response) {
        try {
            const phoneParam = req.params.phoneNumber;

            if (!phoneParam || Array.isArray(phoneParam)) {
                return ApiResponse.error(res, "Invalid phone number", 400);
            }

            const customer = await staffService.lookupCustomerByPhone(phoneParam);

            return ApiResponse.success(
                res,
                customer,
                "Customer retrieved successfully",
                200
            );

        } catch (error: any) {

            if (error.message === "Customer not found") {
                return ApiResponse.error(res, error.message, 404);
            }

            return ApiResponse.error(res, "Internal Server Error", 500);
        }
    }
}