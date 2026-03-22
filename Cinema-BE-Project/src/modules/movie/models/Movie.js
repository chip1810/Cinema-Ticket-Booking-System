// movie.model.js
const { Schema, model, Types } = require("mongoose");
const MovieStatus = require("./enums/MovieStatus"); // import object JS

const MovieSchema = new Schema({
  UUID: { type: String, unique: true, default: () => new Types.ObjectId().toString() },
  title: { type: String, required: true },
  description: { type: String },
  duration: { type: Number, required: true },
  releaseDate: { type: Date, required: true },
  posterUrl: { type: String },
  bannerUrl: { type: String },
  trailerUrl: { type: String },
  rating: { type: Number },
  status: { type: String, enum: Object.values(MovieStatus), default: MovieStatus.COMING_SOON },
  isActive: { type: Boolean, default: true },
  genres: [{ type: Types.ObjectId, ref: "Genre" }], // ManyToMany reference
  showtimes: [{ type: Types.ObjectId, ref: "Showtime" }] // OneToMany reference
}, { timestamps: true });

module.exports = model("Movie", MovieSchema);