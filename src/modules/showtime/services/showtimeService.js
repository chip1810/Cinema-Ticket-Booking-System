// showtime.service.js
const mongoose = require("mongoose");
const Showtime = require("../models/Showtime");
const Movie = require("../../movie/models/Movie");

const isObjectId = (value) => mongoose.Types.ObjectId.isValid(String(value));

const mapShowtime = (s) => ({
  _id: s._id,
  id: s._id,
  UUID: s.UUID,
  startTime: s.startTime,
  endTime: s.endTime,
  status: s.status,
  price: s.price || 0,
  movie: s.movie ? {
    _id: s.movie._id,
    UUID: s.movie.UUID || s.movie._id,
    title: s.movie.title,
    duration: s.movie.duration,
    posterUrl: s.movie.posterUrl,
  } : null,
  hall: s.hall ? {
    _id: s.hall._id,
    UUID: s.hall.UUID || s.hall._id,
    name: s.hall.name,
  } : null,
});

const showtimeService = {
  async getAllShowtimes(query = {}) {
    const { date } = query;
    let filter = { status: "Active" };
    
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      filter.startTime = { $gte: start, $lte: end };
    }

    const showtimes = await Showtime.find(filter)
      .populate("movie")
      .populate("hall")
      .sort({ startTime: 1 });

    return showtimes.map(mapShowtime);
  },

  async getShowtimesByMovieId(movieId) {
    let movie = null;
    if (isObjectId(movieId)) {
      movie = await Movie.findById(movieId);
    }
    if (!movie) {
      movie = await Movie.findOne({ UUID: movieId });
    }
    if (!movie) return [];

    const showtimes = await Showtime.find({
      movie: movie._id,
      status: "Active",
    })
      .populate("movie")
      .populate("hall")
      .sort({ startTime: 1 });

    return showtimes.map(mapShowtime);
  },

  async getNearestShowtimes() {
    const now = new Date();

    const showtimes = await Showtime.find({ 
        status: "Active",
        startTime: { $gt: now } 
      })
      .populate("movie")
      .populate("hall")
      .sort({ startTime: 1 })
      .limit(5);

    return showtimes.map(mapShowtime);
  },
};

module.exports = showtimeService;
