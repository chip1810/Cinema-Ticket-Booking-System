const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Banner = require("../models/Banner");
const ApiResponse = require("../../../utils/ApiResponse");

// Upload directory for banners
const UPLOADS_DIR = path.join(__dirname, "..", "..", "..", "uploads", "banners");
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
        cb(null, `banner_${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`);
    },
});

const uploadBanner = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (_req, file, cb) => {
        if (file.mimetype && file.mimetype.startsWith("image/")) return cb(null, true);
        cb(new Error("Only image files are allowed"));
    },
}).single("banner");

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
      const { title, linkUrl, position, startDate, endDate, imageUrl } = req.body || {};
      if (!title) return fail(res, { message: "title is required" });
      
      // Support both file upload and Base64 data URL
      let finalImageUrl = imageUrl;
      
      if (req.file) {
        // File upload from device
        finalImageUrl = `/uploads/banners/${req.file.filename}`;
      } else if (imageUrl && imageUrl.startsWith('data:image/')) {
        // Base64 data URL from frontend
        finalImageUrl = imageUrl;
      } else if (!finalImageUrl) {
        return fail(res, { message: "imageUrl is required (file upload or Base64 data)" });
      }
      
      const item = await Banner.create({ 
        title, 
        linkUrl, 
        position, 
        startDate, 
        endDate,
        imageUrl: finalImageUrl
      });
      return ok(res, item, "Banner created", 201);
    } catch (e) {
      return fail(res, e);
    }
  }

  async uploadBanner(req, res) {
    try {
      uploadBanner(req, res, (err) => {
        if (err) {
          const msg = err.code === "LIMIT_FILE_SIZE" 
            ? "Image max 10MB" 
            : err.message || "Upload failed";
          return ApiResponse.error(res, msg, 400);
        }
        
        if (req.file) {
          // File upload from device
          const bannerData = {
            filename: req.file.filename,
            originalName: req.file.originalname,
            size: req.file.size,
            path: `/uploads/banners/${req.file.filename}`
          };
          return ApiResponse.success(res, bannerData, "Banner image uploaded successfully");
        } else {
          return ApiResponse.error(res, { message: "No file uploaded" }, 400);
        }
      });
    } catch (e) {
      return ApiResponse.error(res, e.message, 500);
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
      await Banner.findByIdAndDelete(item._id);
      return ok(res, null, "Banner deleted successfully");
    } catch (e) {
      return fail(res, e, 404);
    }
  }
}

module.exports = BannerController;
