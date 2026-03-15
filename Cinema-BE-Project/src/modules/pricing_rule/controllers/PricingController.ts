import { Request, Response } from "express";
import { PricingService } from "../services/PricingService";
import { AppDataSource } from "../../../data-source";
import { Showtime } from "../../showtime/models/Showtime";

const pricingService = new PricingService();

export class PricingController {
    async calculate(req: Request, res: Response) {
        const { showtimeId, seats, discountCode } = req.body;

        if (!showtimeId || !Array.isArray(seats) || seats.length === 0) {
            return res.status(400).json({ message: "showtimeId and seats[] are required" });
        }

        const showtime = await AppDataSource.getRepository(Showtime).findOne({
            where: { id: showtimeId },
            relations: ["movie"],
        });
        if (!showtime) return res.status(404).json({ message: "Showtime not found" });

        const priceBreakdown = seats.map((seat: { type: "Standard" | "VIP" | "Couple"; row: string; number: number }) => ({
            seat: `${seat.row}${seat.number}`,
            price: pricingService.calculatePrice("2D", showtime.startTime, seat.type, discountCode),
        }));

        const totalPrice = priceBreakdown.reduce((sum, s) => sum + s.price, 0);

        return res.json({ totalPrice, priceBreakdown });
    }
}
