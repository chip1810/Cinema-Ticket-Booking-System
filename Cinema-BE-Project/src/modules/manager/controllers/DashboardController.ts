import { Request, Response } from "express";
import { AppDataSource } from "../../../data-source";
import { Order, OrderStatus } from "../../order/models/Order";
import { Ticket } from "../../ticket/models/Ticket";
import { ApiResponse } from "../../../utils/ApiResponse";

const ok = (res: Response, data: any, msg: string) => ApiResponse.success(res, data, msg);
const fail = (res: Response, e: any) => ApiResponse.error(res, e.message ?? e, 500);

export class DashboardController {

    // GET /api/manager/dashboard/summary
    async getSummary(req: Request, res: Response) {
        try {
            const db = AppDataSource.manager;

            // Tổng doanh thu (chỉ từ các đơn hàng đã thanh toán)
            const revenueResult = await db.createQueryBuilder(Order, "o")
                .select("SUM(o.totalAmount)", "total")
                .where("o.status = :status", { status: OrderStatus.PAID })
                .getRawOne();
            const totalRevenue = Number(revenueResult?.total) || 0;

            // Tổng số đơn (tính cả PENDING để Manager biết?)
            const { totalOrders } = await db.createQueryBuilder(Order, "o")
                .select("COUNT(o.id)", "totalOrders")
                .getRawOne();

            // Tổng số vé đã bán
            const { totalTickets } = await db.createQueryBuilder(Ticket, "t")
                .select("COUNT(t.id)", "totalTickets")
                .getRawOne();

            // Lấy 5 giao dịch gần nhất
            const transactions = await db.getRepository(Order).find({
                relations: ["user", "items", "tickets", "tickets.showtime", "tickets.showtime.movie"],
                order: { createdAt: "DESC" },
                take: 5
            });

            // Format stats cho FE map trực tiếp
            const stats = [
                { title: 'Total Revenue', value: totalRevenue, change: 12.5, icon: 'DollarSign', color: 'blue', isCurrency: true },
                { title: 'Tickets Sold', value: Number(totalTickets) || 0, change: 8.2, icon: 'Ticket', color: 'red' },
                { title: 'Total Orders', value: Number(totalOrders) || 0, change: 4.1, icon: 'TrendingUp', color: 'green' },
                { title: 'Active Users', value: 0, change: 0, icon: 'Users', color: 'purple' }, // Placeholder
            ];

            // Chart data: 7 ngày gần nhất (tạm thời Hardcode 0s nếu ko có data)
            const revenueChart = [0, 0, 0, 0, 0, 0, 0];

            return ok(res, {
                stats,
                revenueChart,
                transactions: transactions.map(t => ({
                    id: t.id,
                    name: t.user?.fullName || 'Guest',
                    item: t.tickets?.[0]?.showtime?.movie?.title || 'Concessions',
                    amount: Number(t.totalAmount),
                    status: t.status === OrderStatus.PAID ? 'Success' : 'Pending'
                }))
            }, "Dashboard summary fetched");
        } catch (e: any) { return fail(res, e); }
    }

    // GET /api/manager/dashboard/movies
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
                .orderBy("\"totalRevenue\"", "DESC")
                .getRawMany();

            const formatted = stats.map(s => ({
                id: s.movieId,
                name: s.movieTitle,
                sales: Number(s.totalTickets),
                progress: 100, // logic tính % max sau
                revenue: Number(s.totalRevenue)
            }));

            return ok(res, { popularMovies: formatted }, "Movie statistics fetched");
        } catch (e: any) { return fail(res, e); }
    }

}
