const Genre = require("../models/Genre");
const ApiResponse = require("../../../utils/ApiResponse");

const ok = (res, data, msg, code = 200) => ApiResponse.success(res, data, msg, code);
const fail = (res, e, code = 400) => ApiResponse.error(res, e.message ?? e, code);

class GenreController {
  async getAll(_req, res) {
    try {
      const genres = await Genre.find().sort({ name: 1 });
      return ok(res, genres, "Genres fetched successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Internal Server Error";
      return fail(res, message, 500);
    }
  }

  async create(req, res) {
    try {
      const { name } = req.body || {};
      
      if (!name || name.trim() === '') {
        return fail(res, { message: "Genre name is required" }, 400);
      }

      // Check for duplicate
      const existingGenre = await Genre.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') }
      });
      
      if (existingGenre) {
        return fail(res, { message: "Genre already exists" }, 400);
      }

      const genre = new Genre({ name: name.trim() });
      await genre.save();
      
      return ok(res, genre, "Genre created successfully", 201);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Internal Server Error";
      return fail(res, message, 500);
    }
  }

  async delete(req, res) {
    try {
      const genreId = req.params.id;
      
      if (!genreId) {
        return fail(res, { message: "Genre ID is required" }, 400);
      }

      const genre = await Genre.findById(genreId);
      if (!genre) {
        return fail(res, { message: "Genre not found" }, 404);
      }

      await Genre.findByIdAndDelete(genreId);
      return ok(res, null, "Genre deleted successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Internal Server Error";
      return fail(res, message, 500);
    }
  }
}

module.exports = GenreController;
