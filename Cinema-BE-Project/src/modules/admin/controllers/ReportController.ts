import { Request, Response } from "express";
import { AppDataSource } from "../../../data-source";
import { Order } from "../../order/models/Order";
import { Ticket } from "../../ticket/models/Ticket";
import { User } from "../../auth/models/User";
import { ApiResponse } from "../../../utils/ApiResponse";

export class ReportController {

    // Báo cáo doanh thu theo phim
    async movieRevenue(_req: Request, res: Response) {
        try {
            const db = AppDataSource.manager;

            const stats = await db.createQueryBuilder(Ticket, "t")
                .innerJoin("t.showtime", "s")
                .innerJoin("s.movie", "m")
                .select("m.id", "movieId")
                .addSelect("m.title", "movieTitle")
                .addSelect("COUNT(t.id)", "totalTickets")
                .addSelect("SUM(t.price)", "totalRevenue")
                .groupBy("m.id")
                .addGroupBy("m.title")
                .orderBy("\"totalRevenue\"", "DESC")
                .getRawMany();

            const formatted = stats.map((s: any) => ({
                movieId: s.movieId,
                title: s.movieTitle,
                tickets: Number(s.totalTickets),
                revenue: Number(s.totalRevenue)
            }));

            return ApiResponse.success(res, formatted, "Movie revenue report fetched", 200);

        } catch (error: any) {
            return ApiResponse.error(res, error.message ?? "Internal Server Error", 500);
        }
    }

    // Báo cáo doanh thu theo rạp (branch)
    async cinemaRevenue(_req: Request, res: Response) {
        try {
            const db = AppDataSource.manager;

            const stats = await db.createQueryBuilder(Ticket, "t")
                .innerJoin("t.showtime", "s")
                .innerJoin("s.hall", "h")
                .leftJoin("h.branch", "b")
                .select("COALESCE(b.id, 0)", "branchId")
                .addSelect("COALESCE(b.name, 'Unknown')", "branchName")
                .addSelect("COUNT(t.id)", "totalTickets")
                .addSelect("SUM(t.price)", "totalRevenue")
                .groupBy("b.id")
                .addGroupBy("b.name")
                .orderBy("\"totalRevenue\"", "DESC")
                .getRawMany();

            const formatted = stats.map((s: any) => ({
                branchId: Number(s.branchId),
                branchName: s.branchName,
                tickets: Number(s.totalTickets),
                revenue: Number(s.totalRevenue)
            }));

            return ApiResponse.success(res, formatted, "Cinema revenue report fetched", 200);

        } catch (error: any) {
            return ApiResponse.error(res, error.message ?? "Internal Server Error", 500);
        }
    }

    // Top khách hàng thân thiết
    async topCustomers(req: Request, res: Response) {
        try {
            const limit = Number(req.query.limit) || 10;

            const db = AppDataSource.manager;

            const stats = await db.createQueryBuilder(Order, "o")
                .innerJoin("o.user", "u")
                .select("u.id", "userId")
                .addSelect("u.fullName", "fullName")
                .addSelect("u.email", "email")
                .addSelect("u.phoneNumber", "phoneNumber")
                .addSelect("SUM(o.totalAmount)", "totalSpent")
                .addSelect("COUNT(o.id)", "totalOrders")
                .groupBy("u.id")
                .addGroupBy("u.fullName")
                .addGroupBy("u.email")
                .addGroupBy("u.phoneNumber")
                .orderBy("\"totalSpent\"", "DESC")
                .limit(limit)
                .getRawMany();

            const formatted = stats.map((s: any) => ({
                userId: s.userId,
                fullName: s.fullName,
                email: s.email,
                phoneNumber: s.phoneNumber,
                totalSpent: Number(s.totalSpent),
                totalOrders: Number(s.totalOrders)
            }));

            return ApiResponse.success(res, formatted, "Top customers fetched", 200);

        } catch (error: any) {
            return ApiResponse.error(res, error.message ?? "Internal Server Error", 500);
        }
    }
}

