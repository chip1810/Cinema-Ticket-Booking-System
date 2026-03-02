import { AppDataSource } from "../data-source";
import { Showtime } from "../modules/showtime/models/Showtime";
import { Movie } from "../modules/movie/models/Movie";
import { Hall } from "../modules/hall/models/Hall";
import { CreateShowtimeDTO } from "../dtos/CreateShowtime.dto";

// Cleaning buffer between showtimes (in ms)
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

        // --- OVERLAP CHECK (CRITICAL LOGIC) ---
        // A conflict exists when:
        //   newStart < existingEnd + buffer  AND  newEnd + buffer > existingStart
        // Translated: newStart < existingEndWithBuffer  AND  newEndWithBuffer > existingStart

        const newEndWithBuffer = endTime.getTime() + CLEANING_BUFFER_MS;

        const existing = await this.showtimeRepo.find({
            where: { hall: { id: hall.id } },
            relations: ["hall"],
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
        // --- END OVERLAP CHECK ---

        const showtime = this.showtimeRepo.create({ movie, hall, startTime, endTime });
        return this.showtimeRepo.save(showtime);
    }

    async getAllShowtimes() {
        return this.showtimeRepo.find({ relations: ["movie", "hall"] });
    }

    async deleteShowtime(id: string) {
        const showtime = await this.showtimeRepo.findOneBy({ id });
        if (!showtime) throw new Error("Showtime not found");
        return this.showtimeRepo.remove(showtime);
    }
}
