const mongoose = require("mongoose");
const { News, NewsStatus } = require("../modules/news/models/News");
const ApiResponse = require("../utils/ApiResponse");

const ok = (res, data, msg, code = 200) => ApiResponse.success(res, data, msg, code);
const fail = (res, e, code = 400) => ApiResponse.error(res, e.message ?? e, code);
const isObjectId = (value) => mongoose.Types.ObjectId.isValid(String(value));

const findNews = async (id) => {
  const news = await News.findOne({
    $or: [
      { UUID: id },
      ...(isObjectId(id) ? [{ _id: id }] : []),
    ],
  });
  if (!news) throw new Error("News not found");
  return news;
};

class NewsController {
  async getAll(req, res) {
    try {
      const showAll = req.query.all === "true";
      const filter = showAll ? {} : { status: NewsStatus.PUBLISHED };
      return ok(res, await News.find(filter).sort({ createdAt: -1 }), "News fetched");
    } catch (e) {
      return fail(res, e, 500);
    }
  }

  async getById(req, res) {
    try {
      const item = await findNews(req.params.id);
      return ok(res, item, "News fetched");
    } catch (e) {
      return fail(res, e, 404);
    }
  }

  async create(req, res) {
    try {
      const { title, content, type, status, thumbnailUrl } = req.body || {};
      if (!title || !content) return fail(res, { message: "title and content are required" });
      const item = await News.create({ title, content, type, status, thumbnailUrl });
      return ok(res, item, "News created", 201);
    } catch (e) {
      return fail(res, e);
    }
  }

  async update(req, res) {
    try {
      const item = await findNews(req.params.id);
      Object.assign(item, req.body || {});
      await item.save();
      return ok(res, item, "News updated");
    } catch (e) {
      return fail(res, e, 404);
    }
  }

  async togglePublish(req, res) {
    try {
      const item = await findNews(req.params.id);
      if (item.status === NewsStatus.PUBLISHED) {
        item.status = NewsStatus.DRAFT;
        item.publishedAt = null;
      } else {
        item.status = NewsStatus.PUBLISHED;
        item.publishedAt = new Date();
      }
      await item.save();
      return ok(res, item, "Publish status updated");
    } catch (e) {
      return fail(res, e, 404);
    }
  }

  async delete(req, res) {
    try {
      const item = await findNews(req.params.id);
      await News.deleteOne({ _id: item._id });
      return ok(res, null, "News deleted");
    } catch (e) {
      return fail(res, e, 404);
    }
  }
}

module.exports = NewsController;
