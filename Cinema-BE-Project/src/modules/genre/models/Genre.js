const { Schema, model, Types } = require("mongoose");

const GenreSchema = new Schema({
  UUID: { type: String, unique: true, default: () => new Types.ObjectId().toString() },
  name: { type: String, required: true, unique: true },
  description: { type: String },
  movies: [{ type: Types.ObjectId, ref: "Movie" }],
}, { timestamps: true });

module.exports = model("Genre", GenreSchema);
