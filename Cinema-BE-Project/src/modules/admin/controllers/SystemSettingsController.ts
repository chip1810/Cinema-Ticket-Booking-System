import { Request, Response } from "express";
import { ApiResponse } from "../../../utils/ApiResponse";
import { AppDataSource } from "../../../data-source";
import { SystemSetting } from "../models/SystemSetting";

const settingRepo = AppDataSource.getRepository(SystemSetting);

export class SystemSettingsController {

    // Lấy toàn bộ cấu hình hệ thống (dạng key/value)
    async getAll(_req: Request, res: Response) {
        try {
            const settings = await settingRepo.find();
            const result = settings.reduce((acc: any, s) => {
                acc[s.key] = s.value;
                return acc;
            }, {});
            return ApiResponse.success(res, result, "System settings fetched", 200);
        } catch {
            return ApiResponse.error(res, "Internal Server Error", 500);
        }
    }

    // Cập nhật nhiều setting một lúc
    async upsert(req: Request, res: Response) {
        try {
            const payload = req.body as Record<string, string>;

            const keys = Object.keys(payload || {});
            if (!keys.length) {
                return ApiResponse.error(res, "Empty payload", 400);
            }

            const existing = await settingRepo.find({
                where: keys.map((k) => ({ key: k })),
            });

            const existingMap = new Map(existing.map((s) => [s.key, s]));

            const toSave = keys.map((key) => {
                const cur = existingMap.get(key) ?? settingRepo.create({ key });
                cur.value = String(payload[key]);
                return cur;
            });

            const saved = await settingRepo.save(toSave);

            const result = saved.reduce((acc: any, s) => {
                acc[s.key] = s.value;
                return acc;
            }, {});

            return ApiResponse.success(res, result, "System settings updated", 200);
        } catch {
            return ApiResponse.error(res, "Internal Server Error", 500);
        }
    }
}

