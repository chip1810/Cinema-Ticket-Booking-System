import { AppDataSource } from "../data-source";
import { Showtime } from "../modules/showtime/models/Showtime";
import { Movie } from "../modules/movie/models/Movie";
import { Hall } from "../modules/hall/models/Hall";
import { ShowtimeStatus } from "../modules/showtime/models/enums/showtime-status";
import { CreateShowtimeDTO } from "../dtos/CreateShowtime.dto";

// Buffer dọn dẹp giữa 2 suất chiếu (15 phút)
const CLEANING_BUFFER_MS = 15 * 60 * 1000;

export class ShowtimeService {
    private showtimeRepo = AppDataSource.getRepository(Showtime);
    private movieRepo = AppDataSource.getRepository(Movie);
    private hallRepo = AppDataSource.getRepository(Hall);

    async createShowtime(data: CreateShowtimeDTO) {
        const movie = await this.movieRepo.findOneBy({ id: data.movieId as any });
        if (!movie) throw new Error("Movie not found");

        const hall = await this.hallRepo.findOneBy({ id: data.hallId });
        if (!hall) throw new Error("Hall not found");

        const startTime = new Date(data.startTime);
        const endTime = new Date(startTime.getTime() + movie.duration * 60 * 1000);
        const newEndWithBuffer = endTime.getTime() + CLEANING_BUFFER_MS;

        // ── Kiểm tra xung đột thời gian (trùng phòng + trùng giờ) ──
        const existing = await this.showtimeRepo.find({
            where: { hall: { id: hall.id } },
        });

        const conflict = existing.find((s) => {
            const existingStart = s.startTime.getTime();
            const existingEndWithBuffer = s.endTime.getTime() + CLEANING_BUFFER_MS;
            return startTime.getTime() < existingEndWithBuffer && newEndWithBuffer > existingStart;
        });

        if (conflict) {
            throw new Error(
                `Scheduling conflict in Hall "${hall.name}". ` +
                `Existing showtime: ${conflict.startTime.toISOString()} → ${conflict.endTime.toISOString()} (+15min cleaning).`
            );
        }

        const showtime = this.showtimeRepo.create({ movie, hall, startTime, endTime });
        return this.showtimeRepo.save(showtime);
    }

    async getAllShowtimes() {
        return this.showtimeRepo.find({
            relations: ["movie", "hall"],
            order: { startTime: "ASC" },
        });
    }

    async getShowtimeById(id: number) {
        const showtime = await this.showtimeRepo.findOne({
            where: { id },
            relations: ["movie", "hall"],
        });
        if (!showtime) throw new Error("Showtime not found");
        return showtime;
    }

    async updateShowtime(id: number, data: { startTime?: string; status?: ShowtimeStatus }) {
        const showtime = await this.showtimeRepo.findOne({
            where: { id },
            relations: ["movie", "hall"],
        });
        if (!showtime) throw new Error("Showtime not found");

        // Nếu thay đổi thời gian → kiểm tra conflict lại (bỏ qua chính nó)
        if (data.startTime) {
            const newStart = new Date(data.startTime);
            const newEnd = new Date(newStart.getTime() + showtime.movie.duration * 60 * 1000);
            const newEndWithBuffer = newEnd.getTime() + CLEANING_BUFFER_MS;

            const existing = await this.showtimeRepo.find({
                where: { hall: { id: showtime.hall.id } },
            });

            const conflict = existing.find((s) => {
                if (s.id === id) return false;
                const existingStart = s.startTime.getTime();
                const existingEndWithBuffer = s.endTime.getTime() + CLEANING_BUFFER_MS;
                return newStart.getTime() < existingEndWithBuffer && newEndWithBuffer > existingStart;
            });

            if (conflict) {
                throw new Error(
                    `Scheduling conflict in Hall "${showtime.hall.name}". ` +
                    `Conflicting showtime: ${conflict.startTime.toISOString()} → ${conflict.endTime.toISOString()}.`
                );
            }

            showtime.startTime = newStart;
            showtime.endTime = newEnd;
        }

        if (data.status) showtime.status = data.status;

        return this.showtimeRepo.save(showtime);
    }

    async deleteShowtime(id: number) {
        const showtime = await this.showtimeRepo.findOneBy({ id });
        if (!showtime) throw new Error("Showtime not found");
        // Soft delete: đổi status thành CANCELLED thay vì xóa vật lý
        showtime.status = ShowtimeStatus.CANCELLED;
        return this.showtimeRepo.save(showtime);
    }
}
