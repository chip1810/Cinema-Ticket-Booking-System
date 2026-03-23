const mongoose = require("mongoose");
const Showtime = require("../modules/showtime/models/Showtime");
const Movie = require("../modules/movie/models/Movie");
const Hall = require("../modules/hall/models/Hall");
const ShowtimeStatus = require("../modules/showtime/models/enums/showtime-status");

const CLEANING_BUFFER_MS = 15 * 60 * 1000;
const isObjectId = (value) => mongoose.Types.ObjectId.isValid(String(value));

const findByIdOrUUID = async (Model, id) => {
  return Model.findOne({
    $or: [
      { UUID: id },
      ...(isObjectId(id) ? [{ _id: id }] : []),
    ],
  });
};

class ShowtimeService {
  async createShowtime(data) {
    const movie = await findByIdOrUUID(Movie, data.movieId);
    if (!movie) throw new Error("Movie not found");

    const hall = await findByIdOrUUID(Hall, data.hallId);
    if (!hall) throw new Error("Hall not found");

    const startTime = new Date(data.startTime);
    if (Number.isNaN(startTime.getTime())) {
      throw new Error("Invalid startTime");
    }

    const endTime = new Date(startTime.getTime() + movie.duration * 60 * 1000);
    const newEndWithBuffer = endTime.getTime() + CLEANING_BUFFER_MS;

    const existing = await Showtime.find({ hall: hall._id });
    const conflict = existing.find((s) => {
      const existingStart = s.startTime.getTime();
      const existingEndWithBuffer = s.endTime.getTime() + CLEANING_BUFFER_MS;
      return startTime.getTime() < existingEndWithBuffer && newEndWithBuffer > existingStart;
    });

    if (conflict) {
      throw new Error(
        `Scheduling conflict in Hall "${hall.name}". Existing showtime: ${conflict.startTime.toISOString()} -> ${conflict.endTime.toISOString()} (+15min cleaning).`
      );
    }

    const showtime = new Showtime({
      movie: movie._id,
      hall: hall._id,
      startTime,
      endTime,
      status: ShowtimeStatus.ACTIVE,
    });

    return showtime.save();
  }

  async getAllShowtimes() {
    return Showtime.find()
      .populate("movie")
      .populate("hall")
      .sort({ startTime: 1 });
  }

  async getShowtimeById(id) {
    const showtime = await Showtime.findOne({
      $or: [
        { UUID: id },
        ...(isObjectId(id) ? [{ _id: id }] : []),
      ],
    })
      .populate("movie")
      .populate("hall");

    if (!showtime) throw new Error("Showtime not found");
    return showtime;
  }

  async updateShowtime(id, data) {
    const showtime = await this.getShowtimeById(id);

    if (data.startTime) {
      const newStart = new Date(data.startTime);
      if (Number.isNaN(newStart.getTime())) {
        throw new Error("Invalid startTime");
      }

      const newEnd = new Date(newStart.getTime() + showtime.movie.duration * 60 * 1000);
      const newEndWithBuffer = newEnd.getTime() + CLEANING_BUFFER_MS;

      const existing = await Showtime.find({ hall: showtime.hall._id });
      const conflict = existing.find((s) => {
        if (String(s._id) === String(showtime._id)) return false;
        const existingStart = s.startTime.getTime();
        const existingEndWithBuffer = s.endTime.getTime() + CLEANING_BUFFER_MS;
        return newStart.getTime() < existingEndWithBuffer && newEndWithBuffer > existingStart;
      });

      if (conflict) {
        throw new Error(
          `Scheduling conflict in Hall "${showtime.hall.name}". Conflicting showtime: ${conflict.startTime.toISOString()} -> ${conflict.endTime.toISOString()}.`
        );
      }

      showtime.startTime = newStart;
      showtime.endTime = newEnd;
    }

    if (data.status) showtime.status = data.status;

    return showtime.save();
  }

  async deleteShowtime(id) {
    const showtime = await this.getShowtimeById(id);
    showtime.status = ShowtimeStatus.CANCELLED;
    return showtime.save();
  }
}

module.exports = ShowtimeService;
