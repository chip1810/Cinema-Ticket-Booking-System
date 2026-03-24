const MovieService = require("../services/MovieService");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const ApiResponse = require("../../../utils/ApiResponse");

// Upload directory for movie posters
const UPLOADS_DIR = path.join(__dirname, "..", "..", "..", "uploads", "posters");
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
        cb(null, `poster_${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`);
    },
});

const uploadPoster = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (_req, file, cb) => {
        if (file.mimetype && file.mimetype.startsWith("image/")) return cb(null, true);
        cb(new Error("Only image files are allowed"));
    },
}).single("poster");

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

      // Support both file upload and Base64 data URL
      let finalPosterUrl = posterUrl;
      
      if (req.file) {
        // File upload from device
        finalPosterUrl = `/uploads/posters/${req.file.filename}`;
      } else if (posterUrl && posterUrl.startsWith('data:image/')) {
        // Base64 data URL from frontend (FileReader)
        finalPosterUrl = posterUrl;
      } else if (!finalPosterUrl) {
        return ApiResponse.error(res, { message: "posterUrl is required (file upload or Base64 data)" }, 400);
      }

      const movie = await movieService.createMovie({
        title,
        description,
        duration: durationNum,
        releaseDate,
        posterUrl: finalPosterUrl,
        trailerUrl,
        status,
        genreIds,
      });

      return ApiResponse.success(res, movie, "Movie created successfully", 201);
    } catch (e) {
      return ApiResponse.error(res, e.message, 400);
    }
  }

  async uploadPoster(req, res) {
    try {
      uploadPoster(req, res, (err) => {
        if (err) {
          const msg = err.code === "LIMIT_FILE_SIZE" 
            ? "Poster max 5MB" 
            : err.message || "Upload failed";
          return ApiResponse.error(res, msg, 400);
        }
        
        if (req.file) {
          // File upload from device
          const posterData = {
            filename: req.file.filename,
            originalName: req.file.originalname,
            size: req.file.size,
            path: `/uploads/posters/${req.file.filename}`
          };
          return ApiResponse.success(res, posterData, "Poster uploaded successfully");
        } else {
          return ApiResponse.error(res, { message: "No file uploaded" }, 400);
        }
      });
    } catch (e) {
      return ApiResponse.error(res, e.message, 500);
    }
  }

  async getAll(req, res) {
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
      const { uuid } = req.params;
      const movie = await movieService.getMovieByUUID(uuid);
      return ApiResponse.success(res, movie, "Movie details fetched successfully");
    } catch (e) {
      console.error("getByUUID Error:", e);
      return ApiResponse.error(res, e.message, 500);
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
