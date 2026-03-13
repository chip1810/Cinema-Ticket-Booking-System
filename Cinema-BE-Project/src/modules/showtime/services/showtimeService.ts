import { AppDataSource } from "../../../data-source";
import { Showtime } from "../models/Showtime";
import { ShowtimeStatus } from "../models/enums/showtime-status";
import { ShowtimeResponseDto } from "../dtos/showtime-response.dto";
import { MoreThan } from "typeorm";

const showtimeRepository = AppDataSource.getRepository(Showtime);

export const showtimeService = {
    async getAllShowtimes(): Promise<ShowtimeResponseDto[]> {
        const showtimes = await showtimeRepository.find({
            where: {
                status: ShowtimeStatus.ACTIVE,
            },
            relations: ["movie", "hall"],
            order: {
                startTime: "ASC",
            },
        });

        return showtimes.map((s) => ({
            UUID: s.UUID,
            startTime: s.startTime,
            endTime: s.endTime,
            status: s.status,
            movie: {
                UUID: s.movie.UUID,
                title: s.movie.title,
                duration: s.movie.duration,
                posterUrl: s.movie.posterUrl,
            },
            hall: {
                UUID: s.hall.UUID,
                name: s.hall.name,
            },
        }));
    },

    async getShowtimesByMovieId(movieId: number): Promise<ShowtimeResponseDto[]> {
        const showtimes = await showtimeRepository.find({
            where: {
                movie: { id: movieId },
                status: ShowtimeStatus.ACTIVE,
            },
            relations: ["movie", "hall"],
            order: {
                startTime: "ASC",
            },
        });

        return showtimes.map((s) => ({
            UUID: s.UUID,
            startTime: s.startTime,
            endTime: s.endTime,
            status: s.status,
            movie: {
                UUID: s.movie.UUID,
                title: s.movie.title,
                duration: s.movie.duration,
                posterUrl: s.movie.posterUrl,
            },
            hall: {
                id: s.hall.id,
                UUID: s.hall.UUID,
                name: s.hall.name,
            },
        }));
    },

    async getNearestShowtimes(): Promise<ShowtimeResponseDto[]> {
        const now = new Date();

        const showtimes = await showtimeRepository.find({
            where: {
                status: ShowtimeStatus.ACTIVE,
                startTime: MoreThan(now)
            },
            relations: ["movie", "hall"],
            order: {
                startTime: "ASC"
            },
            take: 5
        });

        return showtimes.map((s) => ({
            UUID: s.UUID,
            startTime: s.startTime,
            endTime: s.endTime,
            status: s.status,
            movie: {
                UUID: s.movie.UUID,
                title: s.movie.title,
                duration: s.movie.duration,
                posterUrl: s.movie.posterUrl,
            },
            hall: {
                UUID: s.hall.UUID,
                name: s.hall.name,
            },
        }));
    }


};
