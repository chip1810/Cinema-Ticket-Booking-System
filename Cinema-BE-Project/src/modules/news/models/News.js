const { Schema, model, Types } = require("mongoose");

const NewsType = {
  NEWS: "NEWS",
  PROMOTION: "PROMOTION",
  EVENT: "EVENT",
};

const NewsStatus = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
  ARCHIVED: "ARCHIVED",
};

const NewsSchema = new Schema({
  UUID: { type: String, unique: true, default: () => new Types.ObjectId().toString() },
  title: { type: String, required: true },
  content: { type: String, required: true },
  type: { type: String, enum: Object.values(NewsType), default: NewsType.NEWS },
  status: { type: String, enum: Object.values(NewsStatus), default: NewsStatus.DRAFT },
  thumbnailUrl: { type: String },
  publishedAt: { type: Date },
}, { timestamps: true });

module.exports = {
  News: model("News", NewsSchema),
  NewsType,
  NewsStatus,
};
