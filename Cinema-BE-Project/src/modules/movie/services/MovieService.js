const mongoose = require("mongoose");
const Movie = require("../models/Movie");
const Genre = require("../../genre/models/Genre");
const { Seat } = require("../../seat/models/Seat");
const Ticket = require("../../ticket/models/Ticket");
const SeatHold = require("../../seat/models/SeatHold");
const Showtime = require("../../showtime/models/Showtime");

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(String(value));

class MovieService {
  async findGenres(genreIds) {
    const ids = Array.isArray(genreIds) ? genreIds : [];
    if (ids.length === 0) return [];

    const genres = await Genre.find({
      $or: [
        { UUID: { $in: ids } },
        { _id: { $in: ids.filter(isObjectId).map((id) => new mongoose.Types.ObjectId(id)) } },
      ],
    });

    if (genres.length !== ids.length) {
      throw new Error("One or more genres not found");
    }

    return genres;
  }

  async createMovie(data) {
    const genres = await this.findGenres(data.genreIds);
    const movie = new Movie({
      title: data.title,
      description: data.description,
      duration: data.duration,
      releaseDate: new Date(data.releaseDate),
      posterUrl: data.posterUrl,
      trailerUrl: data.trailerUrl,
      status: data.status,
      genres: genres.map((g) => g._id),
    });

    return movie.save();
  }

  async getAllMovies() {
    return Movie.find().populate("genres");
  }

  async getMovieById(id) {
    const movie = await Movie.findOne({
      $or: [
        { UUID: id },
        ...(isObjectId(id) ? [{ _id: id }] : []),
      ],
    }).populate("genres");

    if (!movie) throw new Error("Movie not found");
    return movie;
  }

  async getMovieByUUID(uuid) {
    const movie = await Movie.findOne({ UUID: uuid })
      .populate("genres");

    if (!movie) throw new Error("Movie not found");

    const now = new Date();
    const showtimes = await Showtime.find({ movie: movie._id })
      .populate("hall");

    const showtimeStats = await Promise.all(
      showtimes.map(async (s) => {
        const totalSeats = await Seat.countDocuments({ hall: s.hall._id });
        const soldSeats = await Ticket.countDocuments({ showtime: s._id });
        const holdingSeats = await SeatHold.countDocuments({
          showtime: s._id,
          expiresAt: { $gt: now },
        });

        const availableSeats = totalSeats - soldSeats - holdingSeats;

        return {
          UUID: s.UUID,
          startTime: s.startTime,
          endTime: s.endTime,
          hall: {
            name: s.hall?.name,
            capacity: s.hall?.capacity,
          },
          totalSeats,
          availableSeats,
        };
      })
    );

    return {
      ...movie.toObject(),
      showtimes: showtimeStats,
    };
  }

  async updateMovie(id, data) {
    const movie = await this.getMovieById(id);

    if (data.genreIds) {
      const genres = await this.findGenres(data.genreIds);
      movie.genres = genres.map((g) => g._id);
    }

    if (data.title) movie.title = data.title;
    if (data.description !== undefined) movie.description = data.description;
    if (data.duration !== undefined) movie.duration = Number(data.duration);
    if (data.releaseDate) movie.releaseDate = new Date(data.releaseDate);
    if (data.posterUrl !== undefined) movie.posterUrl = data.posterUrl;
    if (data.trailerUrl !== undefined) movie.trailerUrl = data.trailerUrl;
    if (data.status) movie.status = data.status;

    return movie.save();
  }

  async deleteMovie(id) {
    const movie = await this.getMovieById(id);
    movie.isActive = false;
    return movie.save();
  }
}

module.exports = MovieService;
