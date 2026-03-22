const Banner = require("../modules/banner/models/Banner");
const { ApiResponse } = require("../utils/ApiResponse");

// helper
const ok = (res, data, msg, code = 200) =>
  ApiResponse.success(res, data, msg, code);

const fail = (res, e, code = 400) =>
  ApiResponse.error(res, e.message || e, code);

// tìm banner theo _id (Mongo)
const findBanner = async (id) => {
  const item = await Banner.findById(id);
  if (!item) throw new Error("Banner not found");
  return item;
};

class BannerController {

  // GET /api/banners
  async getAll(req, res) {
    try {
      const showAll = req.query.all === "true";

      const filter = showAll ? {} : { isActive: true };

      const banners = await Banner.find(filter)
        .sort({ position: 1 }); // ASC

      return ok(res, banners, "Banners fetched");

    } catch (e) {
      return fail(res, e, 500);
    }
  }

  // POST /api/manager/banners
  async create(req, res) {
    try {
      const { title, imageUrl, linkUrl, position, startDate, endDate } = req.body;

      if (!title || !imageUrl) {
        return fail(res, { message: "title and imageUrl are required" });
      }

      const banner = await Banner.create({
        title,
        imageUrl,
        linkUrl,
        position,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        isActive: true
      });

      return ok(res, banner, "Banner created", 201);

    } catch (e) {
      return fail(res, e);
    }
  }

  // PUT /api/manager/banners/:id
  async update(req, res) {
    try {
      const { id } = req.params;

      const updated = await Banner.findByIdAndUpdate(
        id,
        {
          ...req.body,
          startDate: req.body.startDate
            ? new Date(req.body.startDate)
            : undefined,
          endDate: req.body.endDate
            ? new Date(req.body.endDate)
            : undefined,
        },
        { new: true }
      );

      if (!updated) throw new Error("Banner not found");

      return ok(res, updated, "Banner updated");

    } catch (e) {
      return fail(res, e, 404);
    }
  }

  // PATCH /api/manager/banners/:id/toggle
  async toggle(req, res) {
    try {
      const item = await findBanner(req.params.id);

      item.isActive = !item.isActive;
      await item.save();

      return ok(
        res,
        item,
        `Banner ${item.isActive ? "activated" : "deactivated"}`
      );

    } catch (e) {
      return fail(res, e, 404);
    }
  }

  // DELETE /api/manager/banners/:id
  async delete(req, res) {
    try {
      const deleted = await Banner.findByIdAndDelete(req.params.id);

      if (!deleted) throw new Error("Banner not found");

      return ok(res, null, "Banner deleted");

    } catch (e) {
      return fail(res, e, 404);
    }
  }
}

module.exports = { BannerController };