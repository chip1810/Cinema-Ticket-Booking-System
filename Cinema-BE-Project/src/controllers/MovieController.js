const { ApiResponse } = require("../utils/ApiResponse");
const { MovieService } = require("../services/MovieService");

const movieService = new MovieService();

class MovieController {

  // ➕ CREATE MOVIE
  async create(req, res) {
    try {
      const {
        title,
        description,
        duration,
        genre,
        releaseDate,
        posterUrl
      } = req.body;

      // validate đơn giản
      if (!title || !duration) {
        return ApiResponse.error(res, "title and duration are required", 400);
      }

      const movie = await movieService.createMovie({
        title,
        description,
        duration,
        genre,
        releaseDate: releaseDate ? new Date(releaseDate) : null,
        posterUrl
      });

      return ApiResponse.success(
        res,
        movie,
        "Movie created successfully",
        201
      );

    } catch (e) {
      return ApiResponse.error(res, e.message, 400);
    }
  }

  // 📋 GET ALL
  async getAll(req, res) {
    try {
      const movies = await movieService.getAllMovies();

      return ApiResponse.success(
        res,
        movies,
        "Movies fetched successfully"
      );

    } catch (e) {
      return ApiResponse.error(res, e.message, 500);
    }
  }

  // 🔍 GET BY ID (Mongo dùng _id)
  async getById(req, res) {
    try {
      const movie = await movieService.getMovieById(req.params.id);

      return ApiResponse.success(
        res,
        movie,
        "Movie fetched successfully"
      );

    } catch (e) {
      return ApiResponse.error(res, e.message, 404);
    }
  }

  // ✏️ UPDATE
  async update(req, res) {
    try {
      const movie = await movieService.updateMovie(
        req.params.id,
        {
          ...req.body,
          releaseDate: req.body.releaseDate
            ? new Date(req.body.releaseDate)
            : undefined
        }
      );

      return ApiResponse.success(
        res,
        movie,
        "Movie updated successfully"
      );

    } catch (e) {
      return ApiResponse.error(res, e.message, 404);
    }
  }

  // 🗑 DELETE
  async delete(req, res) {
    try {
      await movieService.deleteMovie(req.params.id);

      return ApiResponse.success(
        res,
        null,
        "Movie deleted successfully",
        200
      );

    } catch (e) {
      return ApiResponse.error(res, e.message, 404);
    }
  }
}

module.exports = { MovieController };