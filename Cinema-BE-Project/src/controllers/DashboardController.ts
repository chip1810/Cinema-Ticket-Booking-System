import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Order } from "../modules/order/models/Order";
import { Ticket } from "../modules/ticket/models/Ticket";
import { ApiResponse } from "../utils/ApiResponse";

const ok = (res: Response, data: any, msg: string) => ApiResponse.success(res, data, msg);
const fail = (res: Response, e: any) => ApiResponse.error(res, e.message ?? e, 500);

export class DashboardController {

    // GET /api/manager/dashboard/summary
    // Tính tổng doanh thu, số vé, số đơn hàng
    async getSummary(req: Request, res: Response) {
        try {
            const db = AppDataSource.manager;

            // Tổng doanh thu (từ các đơn hàng)
            const { totalRevenue } = await db.createQueryBuilder(Order, "o")
                .select("SUM(o.totalAmount)", "totalRevenue")
                .getRawOne();

            // Tổng số đơn
            const { totalOrders } = await db.createQueryBuilder(Order, "o")
                .select("COUNT(o.id)", "totalOrders")
                .getRawOne();

            // Tổng số vé
            const { totalTickets } = await db.createQueryBuilder(Ticket, "t")
                .select("COUNT(t.id)", "totalTickets")
                .getRawOne();

            return ok(res, {
                revenue: Number(totalRevenue) || 0,
                orders: Number(totalOrders) || 0,
                tickets: Number(totalTickets) || 0
            }, "Dashboard summary fetched");
        } catch (e) { return fail(res, e); }
    }

    // GET /api/manager/dashboard/movies
    // Thống kê doanh thu và số vé theo TỪNG PHIM (bán chạy nhất lên đầu)
    async getMovieStats(req: Request, res: Response) {
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
                .orderBy("\"totalRevenue\"", "DESC") // PostgreSQL yêu cầu ngoặc kép cho alias có chữ viết hoa
                .getRawMany();

            const formatted = stats.map(s => ({
                movieId: s.movieId,
                title: s.movieTitle,
                tickets: Number(s.totalTickets),
                revenue: Number(s.totalRevenue)
            }));

            return ok(res, formatted, "Movie statistics fetched");
        } catch (e) { return fail(res, e); }
    }
}
