// showtime.service.js
const Showtime = require("../models/Showtime");

const showtimeService = {
  async getAllShowtimes() {
    const showtimes = await Showtime.find({ status: "Active" }) // hoặc require ShowtimeStatus.ACTIVE
      .populate("movie")
      .populate("hall")
      .sort({ startTime: 1 });

    return showtimes.map((s) => ({
      UUID: s.UUID,
      startTime: s.startTime,
      endTime: s.endTime,
      status: s.status,
      movie: {
        UUID: s.movie.UUID,
        title: s.movie.title,
        duration: s.movie.duration,
        posterUrl: s.movie.posterUrl,
      },
      hall: {
        UUID: s.hall.UUID,
        name: s.hall.name,
      },
    }));
  },

  async getShowtimesByMovieId(movieId) {
    const showtimes = await Showtime.find({ 
        "movie": movieId, 
        status: "Active" 
      })
      .populate("movie")
      .populate("hall")
      .sort({ startTime: 1 });

    return showtimes.map((s) => ({
      UUID: s.UUID,
      startTime: s.startTime,
      endTime: s.endTime,
      status: s.status,
      movie: {
        UUID: s.movie.UUID,
        title: s.movie.title,
        duration: s.movie.duration,
        posterUrl: s.movie.posterUrl,
      },
      hall: {
        UUID: s.hall.UUID,
        name: s.hall.name,
      },
    }));
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

    return showtimes.map((s) => ({
      UUID: s.UUID,
      startTime: s.startTime,
      endTime: s.endTime,
      status: s.status,
      movie: {
        UUID: s.movie.UUID,
        title: s.movie.title,
        duration: s.movie.duration,
        posterUrl: s.movie.posterUrl,
      },
      hall: {
        UUID: s.hall.UUID,
        name: s.hall.name,
      },
    }));
  },
};

module.exports = showtimeService;