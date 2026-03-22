const News = require("../modules/news/models/News");
const { ApiResponse } = require("../utils/ApiResponse");

const ok = (res, data, msg, code = 200) =>
  ApiResponse.success(res, data, msg, code);

const fail = (res, e, code = 400) =>
  ApiResponse.error(res, e.message || e, code);

class NewsController {

  // GET /api/news?type=PROMOTION&status=PUBLISHED
  async getAll(req, res) {
    try {
      const filter = {};

      if (req.query.type) filter.type = req.query.type;
      if (req.query.status) filter.status = req.query.status;

      const news = await News.find(filter)
        .sort({ createdAt: -1 });

      return ok(res, news, "News fetched");

    } catch (e) {
      return fail(res, e, 500);
    }
  }

  // GET /api/news/:id
  async getById(req, res) {
    try {
      const item = await News.findById(req.params.id);

      if (!item) {
        return fail(res, { message: "News not found" }, 404);
      }

      return ok(res, item, "News fetched");

    } catch (e) {
      return fail(res, e, 500);
    }
  }

  // POST /api/manager/news
  async create(req, res) {
    try {
      const { title, content, type, thumbnailUrl } = req.body;

      if (!title || !content) {
        return fail(res, { message: "title and content are required" });
      }

      const news = await News.create({
        title,
        content,
        type,
        thumbnailUrl,
        status: "DRAFT"
      });

      return ok(res, news, "News created", 201);

    } catch (e) {
      return fail(res, e);
    }
  }

  // PUT /api/manager/news/:id
  async update(req, res) {
    try {
      const updated = await News.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );

      if (!updated) {
        return fail(res, { message: "News not found" }, 404);
      }

      return ok(res, updated, "News updated");

    } catch (e) {
      return fail(res, e);
    }
  }

  // PATCH /api/manager/news/:id/publish
  async togglePublish(req, res) {
    try {
      const item = await News.findById(req.params.id);

      if (!item) {
        return fail(res, { message: "News not found" }, 404);
      }

      if (item.status === "PUBLISHED") {
        item.status = "ARCHIVED";
        item.publishedAt = null;
      } else {
        item.status = "PUBLISHED";
        item.publishedAt = new Date();
      }

      await item.save();

      return ok(res, item, `News ${item.status.toLowerCase()}`);

    } catch (e) {
      return fail(res, e);
    }
  }

  // DELETE /api/manager/news/:id
  async delete(req, res) {
    try {
      const deleted = await News.findByIdAndDelete(req.params.id);

      if (!deleted) {
        return fail(res, { message: "News not found" }, 404);
      }

      return ok(res, null, "News deleted");

    } catch (e) {
      return fail(res, e);
    }
  }
}

module.exports = { NewsController };