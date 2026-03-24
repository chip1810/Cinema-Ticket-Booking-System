import { Request, Response } from "express";
import { AppDataSource } from "../../../data-source";
import { Review, ReviewStatus } from "../models/Review";
import { ApiResponse } from "../../../utils/ApiResponse";

export class ReviewController {
    private reviewRepo = AppDataSource.getRepository(Review);

    // GET /api/reviews
    async getAll(req: Request, res: Response) {
        try {
            const { status } = req.query;
            const where: any = {};
            if (status) where.status = status;

            const reviews = await this.reviewRepo.find({
                where,
                relations: ["user", "movie"],
                order: { createdAt: "DESC" },
            });

            // Format for FE expectations
            const formatted = reviews.map(r => ({
                id: r.id,
                userName: r.user?.fullName || r.user?.email || "Anonymous",
                movieTitle: r.movie?.title || "Unknown Movie",
                rating: r.rating,
                comment: r.comment,
                status: r.status,
                date: r.createdAt.toISOString(),
            }));

            return ApiResponse.success(res, formatted, "Reviews fetched successfully");
        } catch (e: any) {
            return ApiResponse.error(res, e.message, 500);
        }
    }

    // PATCH /api/reviews/:id/moderate
    async moderate(req: Request, res: Response) {
        try {
            const id = Number(req.params.id);
            const { action } = req.body; // Expecting "APPROVED" or "HIDDEN"

            const review = await this.reviewRepo.findOneBy({ id });
            if (!review) return ApiResponse.error(res, "Review not found", 404);

            if (action === "APPROVED") review.status = ReviewStatus.APPROVED;
            else if (action === "HIDDEN") review.status = ReviewStatus.HIDDEN;
            else return ApiResponse.error(res, "Invalid action", 400);

            await this.reviewRepo.save(review);
            return ApiResponse.success(res, review, `Review ${action.toLowerCase()} successfully`);
        } catch (e: any) {
            return ApiResponse.error(res, e.message, 500);
        }
    }

    // DELETE /api/reviews/:id
    async delete(req: Request, res: Response) {
        try {
            const id = Number(req.params.id);
            const review = await this.reviewRepo.findOneBy({ id });
            if (!review) return ApiResponse.error(res, "Review not found", 404);

            await this.reviewRepo.remove(review);
            return ApiResponse.success(res, null, "Review deleted successfully");
        } catch (e: any) {
            return ApiResponse.error(res, e.message, 500);
        }
    }
}
