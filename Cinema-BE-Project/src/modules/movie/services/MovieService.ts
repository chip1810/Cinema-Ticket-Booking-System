import { AppDataSource } from "../../../mongo";
import { Movie } from "../models/Movie";
import { Genre } from "../../genre/models/Genre";
import { Seat } from "../../seat/models/Seat";
import { CreateMovieDTO } from "../dtos/CreateMovie.dto";
import { In, MoreThan } from "typeorm";
import { Ticket } from "../../ticket/models/Ticket";
import { SeatHold } from "../../seat/models/SeatHold";


export class MovieService {
    private movieRepo = AppDataSource.getRepository(Movie);
    private genreRepo = AppDataSource.getRepository(Genre);
    private seatRepo = AppDataSource.getRepository(Seat);
    private ticketRepo = AppDataSource.getRepository(Ticket);
    private seatHoldRepo = AppDataSource.getRepository(SeatHold)

    private async findGenres(genreIds: number[]) {
        const genres = await this.genreRepo.findBy({ id: In(genreIds) });
        if (genres.length !== genreIds.length) throw new Error("One or more genres not found");
        return genres;
    }

    async createMovie(data: CreateMovieDTO) {
        const genres = await this.findGenres(data.genreIds);
        const movie = this.movieRepo.create({
            title: data.title,
            description: data.description,
            duration: data.duration,
            releaseDate: new Date(data.releaseDate),
            posterUrl: data.posterUrl,
            trailerUrl: data.trailerUrl,
            status: data.status as any,
            genres,
        });
        return this.movieRepo.save(movie);
    }

    async getAllMovies() {
        return this.movieRepo.find({ relations: ["genres"] });
    }

    async getMovieById(id: number) {
        const movie = await this.movieRepo.findOne({ where: { id }, relations: ["genres"] });
        if (!movie) throw new Error("Movie not found");
        return movie;
    }

    async getMovieByUUID(uuid: string) {
        const movie = await this.movieRepo.findOne({
            where: { UUID: uuid },
            relations: [
                "genres",
                "showtimes",
                "showtimes.hall"
            ]
        });

        if (!movie) throw new Error("Movie not found");

        const now = new Date();

        const showtimes = await Promise.all(
            movie.showtimes.map(async (s) => {

                const totalSeats = await this.seatRepo.count({
                    where: { hallId: s.hallId }
                });

                const soldSeats = await this.ticketRepo.count({
                    where: { showtimeId: s.id }
                });

                const holdingSeats = await this.seatHoldRepo.count({
                    where: {
                        showtimeId: s.id,
                        expiresAt: MoreThan(now)
                    }
                });

                const availableSeats = totalSeats - soldSeats - holdingSeats;

                return {
                    UUID: s.UUID,
                    startTime: s.startTime,
                    endTime: s.endTime,
                    hall: {
                        name: s.hall.name,
                        capacity: s.hall.capacity
                    },
                    totalSeats,
                    availableSeats
                };
            })
        );

        return {
            ...movie,
            showtimes
        };
    }
    async updateMovie(id: number, data: Partial<CreateMovieDTO>) {
        const movie = await this.getMovieById(id);
        if (data.genreIds) movie.genres = await this.findGenres(data.genreIds);
        Object.assign(movie, {
            ...(data.title && { title: data.title }),
            ...(data.description && { description: data.description }),
            ...(data.duration && { duration: data.duration }),
            ...(data.releaseDate && { releaseDate: new Date(data.releaseDate) }),
            ...(data.posterUrl && { posterUrl: data.posterUrl }),
            ...(data.trailerUrl && { trailerUrl: data.trailerUrl }),
            ...(data.status && { status: data.status }),
        });
        return this.movieRepo.save(movie);
    }

    async deleteMovie(id: number) {
        const movie = await this.getMovieById(id);
        movie.isActive = false;
        return this.movieRepo.save(movie);
    }
}
