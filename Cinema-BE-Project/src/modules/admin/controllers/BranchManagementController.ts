import { Request, Response } from "express";
import { ApiResponse } from "../../../utils/ApiResponse";
import { CinemaBranchService } from "../../branch/services/CinemaBranchService";

const service = new CinemaBranchService();

export class BranchManagementController {

    async createBranch(req: Request, res: Response) {
        try {
            const { name, address, hotline } = req.body;

            if (!name || !address || !hotline) {
                return ApiResponse.error(res, "name, address, hotline are required", 400);
            }

            const branch = await service.create({ name, address, hotline });
            return ApiResponse.success(res, branch, "Branch created successfully", 201);

        } catch (error: any) {
            if (error.message === "Branch name already exists") {
                return ApiResponse.error(res, error.message, 400);
            }
            return ApiResponse.error(res, "Internal Server Error", 500);
        }
    }

    async getAllBranches(_req: Request, res: Response) {
        try {
            const branches = await service.findAll();
            return ApiResponse.success(res, branches, "Branches retrieved successfully", 200);
        } catch {
            return ApiResponse.error(res, "Internal Server Error", 500);
        }
    }

    async updateBranch(req: Request, res: Response) {
        try {
            const id = Number(req.params.id);

            if (!id) {
                return ApiResponse.error(res, "Invalid ID", 400);
            }

            const branch = await service.update(id, req.body);
            return ApiResponse.success(res, branch, "Branch updated successfully", 200);

        } catch (error: any) {
            if (error.message === "Branch not found") {
                return ApiResponse.error(res, error.message, 404);
            }
            return ApiResponse.error(res, "Internal Server Error", 500);
        }
    }
}

