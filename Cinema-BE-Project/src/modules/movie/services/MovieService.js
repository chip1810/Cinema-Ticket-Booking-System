const Movie = require("../models/Movie");
const Genre = require("../../genre/models/Genre");
const Seat = require("../../seat/models/Seat");
const Ticket = require("../../ticket/models/Ticket");
const SeatHold = require("../../seat/models/SeatHold");
const Showtime = require("../../showtime/models/Showtime");

class MovieService {

  // ================= FIND GENRES =================
  async findGenres(genreIds) {
    const genres = await Genre.find({
      _id: { $in: genreIds }
    });

    if (genres.length !== genreIds.length) {
      throw new Error("One or more genres not found");
    }

    return genres.map(g => g._id);
  }

  // ================= CREATE =================
  async createMovie(data) {
    const genres = await this.findGenres(data.genreIds);

    return await Movie.create({
      title: data.title,
      description: data.description,
      duration: data.duration,
      releaseDate: new Date(data.releaseDate),
      posterUrl: data.posterUrl,
      trailerUrl: data.trailerUrl,
      status: data.status,
      genres
    });
  }

  // ================= GET ALL =================
  async getAllMovies() {
    return await Movie.find()
      .populate("genres");
  }

  // ================= GET BY ID =================
  async getMovieById(id) {
    const movie = await Movie.findById(id)
      .populate("genres");

    if (!movie) throw new Error("Movie not found");

    return movie;
  }

  // ================= GET BY UUID =================
  async getMovieByUUID(uuid) {
    const movie = await Movie.findOne({ UUID: uuid })
      .populate("genres");

    if (!movie) throw new Error("Movie not found");

    // 🔥 lấy showtime riêng (Mongo không auto relation)
    const showtimes = await Showtime.find({ movie: movie._id })
      .populate("hall");

    const now = new Date();

    const resultShowtimes = await Promise.all(
      showtimes.map(async (s) => {

        // tổng ghế
        const totalSeats = await Seat.countDocuments({
          hall: s.hall._id
        });

        // ghế đã bán
        const soldSeats = await Ticket.countDocuments({
          showtime: s._id
        });

        // ghế đang giữ
        const holdingSeats = await SeatHold.countDocuments({
          showtime: s._id,
          expiresAt: { $gt: now }
        });

        const availableSeats =
          totalSeats - soldSeats - holdingSeats;

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
      ...movie.toObject(),
      showtimes: resultShowtimes
    };
  }

  // ================= UPDATE =================
  async updateMovie(id, data) {
    const updateData = { ...data };

    if (data.genreIds) {
      updateData.genres = await this.findGenres(data.genreIds);
    }

    if (data.releaseDate) {
      updateData.releaseDate = new Date(data.releaseDate);
    }

    const movie = await Movie.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!movie) throw new Error("Movie not found");

    return movie;
  }

  // ================= DELETE (SOFT) =================
  async deleteMovie(id) {
    const movie = await Movie.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!movie) throw new Error("Movie not found");

    return movie;
  }
}

module.exports = { MovieService };