const mongoose = require("mongoose");
const Banner = require("../modules/banner/models/Banner");
const ApiResponse = require("../utils/ApiResponse");

const ok = (res, data, msg, code = 200) => ApiResponse.success(res, data, msg, code);
const fail = (res, e, code = 400) => ApiResponse.error(res, e.message ?? e, code);
const isObjectId = (value) => mongoose.Types.ObjectId.isValid(String(value));

const findBanner = async (id) => {
  const item = await Banner.findOne({
    $or: [
      { UUID: id },
      ...(isObjectId(id) ? [{ _id: id }] : []),
    ],
  });
  if (!item) throw new Error("Banner not found");
  return item;
};

class BannerController {
  async getAll(req, res) {
    try {
      const showAll = req.query.all === "true";
      const filter = showAll ? {} : { isActive: true };
      return ok(res, await Banner.find(filter).sort({ position: 1 }), "Banners fetched");
    } catch (e) {
      return fail(res, e, 500);
    }
  }

  async create(req, res) {
    try {
      const { title, imageUrl, linkUrl, position, startDate, endDate } = req.body || {};
      if (!title || !imageUrl) return fail(res, { message: "title and imageUrl are required" });
      const item = await Banner.create({ title, imageUrl, linkUrl, position, startDate, endDate });
      return ok(res, item, "Banner created", 201);
    } catch (e) {
      return fail(res, e);
    }
  }

  async update(req, res) {
    try {
      const item = await findBanner(req.params.id);
      Object.assign(item, req.body || {});
      await item.save();
      return ok(res, item, "Banner updated");
    } catch (e) {
      return fail(res, e, 404);
    }
  }

  async toggle(req, res) {
    try {
      const item = await findBanner(req.params.id);
      item.isActive = !item.isActive;
      await item.save();
      return ok(res, item, `Banner ${item.isActive ? "activated" : "deactivated"}`);
    } catch (e) {
      return fail(res, e, 404);
    }
  }

  async delete(req, res) {
    try {
      const item = await findBanner(req.params.id);
      await Banner.deleteOne({ _id: item._id });
      return ok(res, null, "Banner deleted");
    } catch (e) {
      return fail(res, e, 404);
    }
  }
}

module.exports = BannerController;
