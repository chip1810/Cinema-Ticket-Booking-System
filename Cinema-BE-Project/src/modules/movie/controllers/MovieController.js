// MovieController.js
const { MovieService } = require("../services/MovieService");
const { ApiResponse } = require("../../../utils/ApiResponse");

const movieService = new MovieService();

class MovieController {

    // POST /api/movies
    async create(req, res) {
        try {
            const dto = req.body;
            // Bạn có thể validate DTO bằng Joi hoặc class-validator + ts-node
            const movie = await movieService.createMovie(dto);
            return ApiResponse.success(res, movie, "Movie created successfully", 201);
        } catch (e) {
            return ApiResponse.error(res, e.message || e, 400);
        }
    }

    // GET /api/movies
    async getAll(req, res) {
        try {
            const movies = await movieService.getAllMovies();
            return ApiResponse.success(res, movies, "Movies fetched successfully");
        } catch (e) {
            return ApiResponse.error(res, e.message || e, 500);
        }
    }

    // GET /api/movies/:id
    async getById(req, res) {
        try {
            const id = req.params.id;
            const movie = await movieService.getMovieById(id);
            return ApiResponse.success(res, movie, "Movie fetched successfully");
        } catch (e) {
            return ApiResponse.error(res, e.message || e, 404);
        }
    }

    // GET /api/movies/uuid/:uuid
    async getByUUID(req, res) {
        try {
            const uuid = req.params.uuid;
            const movie = await movieService.getMovieByUUID(uuid);
            return ApiResponse.success(res, movie, "Movie fetched successfully");
        } catch (e) {
            return ApiResponse.error(res, e.message || e, 404);
        }
    }

    // PUT /api/movies/:id
    async update(req, res) {
        try {
            const id = req.params.id;
            const movie = await movieService.updateMovie(id, req.body);
            return ApiResponse.success(res, movie, "Movie updated successfully");
        } catch (e) {
            return ApiResponse.error(res, e.message || e, 404);
        }
    }

    // DELETE /api/movies/:id
    async delete(req, res) {
        try {
            const id = req.params.id;
            await movieService.deleteMovie(id);
            return ApiResponse.success(res, null, "Movie deleted successfully", 200);
        } catch (e) {
            return ApiResponse.error(res, e.message || e, 404);
        }
    }
}

module.exports = { MovieController };