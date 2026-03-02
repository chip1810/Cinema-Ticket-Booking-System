import { AppDataSource } from "../../../data-source";
import { Movie } from "../models/Movie";
import { Genre } from "../../genre/models/Genre";
import { CreateMovieDTO } from "../dtos/CreateMovie.dto";
import { In } from "typeorm";

export class MovieService {
    private movieRepo = AppDataSource.getRepository(Movie);
    private genreRepo = AppDataSource.getRepository(Genre);

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

    async updateMovie(id: number, data: Partial<CreateMovieDTO>) {
        const movie = await this.getMovieById(id);
        if (data.genreIds) movie.genres = await this.findGenres(data.genreIds);
        Object.assign(movie, {
            ...(data.title && { title: data.title }),
            ...(data.description && { description: data.description }),
            ...(data.duration && { duration: data.duration }),
            ...(data.releaseDate && { releaseDate: new Date(data.releaseDate) }),
            ...(data.posterUrl && { posterUrl: data.posterUrl }),
            ...(data.status && { status: data.status }),
        });
        return this.movieRepo.save(movie);
    }

    async deleteMovie(id: number) {
        const movie = await this.getMovieById(id);
        return this.movieRepo.remove(movie);
    }
}
