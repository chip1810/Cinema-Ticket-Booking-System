import { Schema, model, Types } from "mongoose";

const GenreSchema = new Schema({
  UUID: { type: String, unique: true, default: () => new Types.ObjectId().toString() },
  name: { type: String, required: true, unique: true },
  description: { type: String },
  movies: [{ type: Types.ObjectId, ref: "Movie" }] // ManyToMany reference
}, { timestamps: true });

export const Genre = model("Genre", GenreSchema);