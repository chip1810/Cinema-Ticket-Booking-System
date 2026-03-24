const MovieService = require("../services/MovieService");
const ApiResponse = require("../../../utils/ApiResponse");

const movieService = new MovieService();

const isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;

class MovieController {
  async create(req, res) {
    try {
      const {
        title,
        description,
        duration,
        releaseDate,
        posterUrl,
        trailerUrl,
        status,
        genreIds,
      } = req.body || {};

      const durationNum = Number(duration);
      if (!isNonEmptyString(title) || !Number.isFinite(durationNum) || durationNum <= 0) {
        return ApiResponse.error(res, "title and duration are required", 400);
      }

      if (!releaseDate) {
        return ApiResponse.error(res, "releaseDate is required", 400);
      }

      if (!status) {
        return ApiResponse.error(res, "status is required", 400);
      }

      if (!Array.isArray(genreIds) || genreIds.length === 0) {
        return ApiResponse.error(res, "genreIds must be a non-empty array", 400);
      }

      const movie = await movieService.createMovie({
        title,
        description,
        duration: durationNum,
        releaseDate,
        posterUrl,
        trailerUrl,
        status,
        genreIds,
      });

      return ApiResponse.success(res, movie, "Movie created successfully", 201);
    } catch (e) {
      return ApiResponse.error(res, e.message, 400);
    }
  }

  async getAll(_req, res) {
    try {
      const movies = await movieService.getAllMovies();
      return ApiResponse.success(res, movies, "Movies fetched successfully");
    } catch (e) {
      return ApiResponse.error(res, e.message, 500);
    }
  }

  async getById(req, res) {
    try {
      const movie = await movieService.getMovieById(req.params.id);
      return ApiResponse.success(res, movie, "Movie fetched successfully");
    } catch (e) {
      return ApiResponse.error(res, e.message, 404);
    }
  }

  async getByUUID(req, res) {
    try {
      const movie = await movieService.getMovieByUUID(req.params.uuid);
      return ApiResponse.success(res, movie, "Movie fetched successfully");
    } catch (e) {
      return ApiResponse.error(res, e.message, 404);
    }
  }

  async update(req, res) {
    try {
      const movie = await movieService.updateMovie(req.params.id, req.body || {});
      return ApiResponse.success(res, movie, "Movie updated successfully");
    } catch (e) {
      return ApiResponse.error(res, e.message, 404);
    }
  }

  async delete(req, res) {
    try {
      await movieService.deleteMovie(req.params.id);
      return ApiResponse.success(res, null, "Movie deleted successfully", 200);
    } catch (e) {
      return ApiResponse.error(res, e.message, 404);
    }
  }

  async updateTrailer(req, res) {
    try {
      const { trailerUrl } = req.body;
      if (trailerUrl == null) {
        return ApiResponse.error(res, "trailerUrl is required", 400);
      }
      const movie = await movieService.updateTrailer(req.params.id, trailerUrl);
      return ApiResponse.success(res, movie, "Trailer updated");
    } catch (e) {
      return ApiResponse.error(res, e.message, 404);
    }
  }

  async search(req, res) {
    try {
      const { q, limit } = req.query;
      if (!q || q.trim().length === 0) {
        return ApiResponse.error(res, "Search query is required", 400);
      }
      const limitNum = limit != null && limit !== "" ? Number(limit) : 10;
      const movies = await movieService.searchMovies(q.trim(), limitNum);
      return ApiResponse.success(res, movies, "Movies found");
    } catch (e) {
      return ApiResponse.error(res, e.message, 500);
    }
  }
}

module.exports = MovieController;
