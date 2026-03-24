const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

// Passport must be required BEFORE googleAuth config runs
const passport = require("passport");
require("./modules/auth/config/passport");

const { connectMongo } = require("./mongo");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const ApiResponse = require("./utils/ApiResponse");

// ── Disk storage cho avatar ────────────────────────────────────────────────
const UPLOADS_DIR = path.join(__dirname, "..", "uploads", "avatars");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    cb(null, `avatar_${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`);
  },
});
const uploadAvatarMulter = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith("image/")) return cb(null, true);
    cb(new Error("Chỉ chấp nhận file ảnh"));
  },
}).single("avatar");

// Controllers
const AuthController = require("./modules/auth/controllers/AuthController");
const GoogleAuthController = require("./modules/auth/controllers/GoogleAuthController");
const ProfileController = require("./modules/auth/controllers/ProfileController");
const MovieController = require("./modules/movie/controllers/MovieController");
const ShowtimeController = require("./modules/showtime/controllers/ShowtimeController");
const PricingController = require("./modules/pricing_rule/controllers/PricingController");
const HallManagerController = require("./modules/hall/controllers/HallManagerController");
const PricingManagerController = require("./modules/pricing_rule/controllers/PricingManagerController");
const NewsController = require("./modules/news/controllers/NewsController");
const BannerController = require("./modules/banner/controllers/BannerController");
const DashboardController = require("./modules/manager/controllers/DashboardController");
const GenreController = require("./modules/genre/controllers/GenreController");
const ReviewController = require("./modules/review/controllers/ReviewController");
const staffRouter = require("./modules/staff/routes/StaffRouter");
const seatRouter = require("./modules/seat/routes/SeatRoute");
const adminRoutes = require("./modules/admin/routes/admin.routes");
const showtimeRoutes = require("./modules/showtime/routes/showtimeRoutes");
const voucherRoutes = require("./modules/voucher/routes/voucherRoutes");
const concessionRoutes = require("./modules/concession/routes/concessionRoutes");
const orderRoutes = require("./modules/order/routes/orderRoutes");
const paymentRoutes = require("./modules/payment/routes/paymentRoutes");
const reviewRoutes = require("./modules/review/routes/reviewRoutes");
const genreRoutes = require("./modules/genre/routes/genreRoutes");

// Seed entities
const Hall = require("./modules/hall/models/Hall");
const Genre = require("./modules/genre/models/Genre");

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(cors());
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(passport.initialize());
// session: false in passport strategies, so no passport.session() needed

app.use("/api/showtimes", showtimeRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/concessions", concessionRoutes);
app.use("/api/staff", staffRouter);
app.use("/api/seat", seatRouter);
app.use("/api/vouchers", voucherRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/genres", genreRoutes);

// ── Serve upload files (avatars, posters, banners) ───────────────────
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// Middlewares
const authenticate = require("./middlewares/authenticate");
const authorize = require("./middlewares/roleMiddlewares");
const { UserRole } = require("./modules/auth/models/User");

// Controllers instance
const auth = new AuthController();
const googleAuth = require("./modules/auth/controllers/GoogleAuthController");
const profile = new ProfileController();

const movie = new MovieController();
const showtime = new ShowtimeController();
const pricing = new PricingController();
const hallManager = new HallManagerController();
const pricingManager = new PricingManagerController();
const news = new NewsController();
const banner = new BannerController();
const dashboard = new DashboardController();
const genre = new GenreController();
const review = new ReviewController();

// --- Auth ---
app.post("/api/auth/register", (req, res) => auth.register(req, res));
app.post("/api/auth/verify-email", (req, res) => auth.verifyEmail(req, res));
app.post("/api/auth/resend-verify-email", (req, res) => auth.resendVerifyEmail(req, res));
app.post("/api/auth/login", (req, res) => auth.login(req, res));
app.post("/api/auth/forgot-password", (req, res) => auth.forgotPassword(req, res));
app.post("/api/auth/reset-password", (req, res) => auth.resetPassword(req, res));

// --- Profile (Authenticated) ---
app.get("/api/auth/me", require("./middlewares/authenticate"), (req, res) => profile.getProfile(req, res));
app.put("/api/auth/profile", require("./middlewares/authenticate"), (req, res) =>
  profile.updateProfile(req, res)
);
app.post("/api/auth/profile/avatar", require("./middlewares/authenticate"), (req, res) => {
  uploadAvatarMulter(req, res, (err) => {
    if (err) {
      const msg =
        err.code === "LIMIT_FILE_SIZE"
          ? "Ảnh tối đa 5MB"
          : err.message || "Upload thất bại";
      return ApiResponse.error(res, msg, 400);
    }
    profile.uploadAvatar(req, res);
  });
});
app.put("/api/auth/change-password", require("./middlewares/authenticate"), (req, res) => profile.changePassword(req, res));

// --- Google OAuth ---
app.get("/api/auth/google", (req, res, next) => googleAuth.initiate(req, res, next));
app.get("/api/auth/google/callback", (req, res, next) => googleAuth.callback(req, res, next));
app.get("/api/auth/google/verify", require("./middlewares/authenticate"), (req, res) => googleAuth.verifyToken(req, res));

// --- Movie ---
app.get("/api/movies", (req, res) => movie.getAll(req, res));
app.get("/api/movies/search", (req, res) => movie.search(req, res));
app.get("/api/movies/:id", (req, res) => movie.getById(req, res));
app.post("/api/manager/movies/upload", authenticate, authorize([UserRole.MANAGER, UserRole.ADMIN]), (req, res) => movie.uploadPoster(req, res));
app.post("/api/movies", authenticate, authorize([UserRole.MANAGER, UserRole.ADMIN]), (req, res) => movie.create(req, res));
app.put("/api/movies/:id", authenticate, authorize([UserRole.MANAGER, UserRole.ADMIN]), (req, res) => movie.update(req, res));
app.delete("/api/movies/:id", authenticate, authorize([UserRole.MANAGER, UserRole.ADMIN]), (req, res) => movie.delete(req, res));
app.get("/api/movies/uuid/:uuid", (req, res) => movie.getByUUID(req, res));
app.patch("/api/manager/movies/:id/trailer", authenticate, authorize([UserRole.MANAGER, UserRole.ADMIN]), (req, res) => movie.updateTrailer(req, res));

// --- Genre (Manager / Movie form) ---
app.get("/api/genres", async (_req, res) => {
  try {
    const list = await Genre.find().sort({ name: 1 });
    return ApiResponse.success(res, list, "Genres fetched successfully");
  } catch (e) {
    return ApiResponse.error(res, e.message, 500);
  }
});

app.post("/api/genres", authenticate, authorize([UserRole.MANAGER, UserRole.ADMIN]), async (req, res) => {
  try {
    const name = req.body?.name;
    const description = req.body?.description;
    if (!name || !String(name).trim()) {
      return ApiResponse.error(res, "name is required", 400);
    }
    const g = await Genre.create({
      name: String(name).trim(),
      description: description != null ? String(description) : undefined,
    });
    return ApiResponse.success(res, g, "Genre created", 201);
  } catch (e) {
    return ApiResponse.error(res, e.message, 400);
  }
});

app.delete("/api/genres/:id", authenticate, authorize([UserRole.MANAGER, UserRole.ADMIN]), async (req, res) => {
  try {
    const id = req.params.id;
    const or = [{ UUID: id }];
    if (mongoose.Types.ObjectId.isValid(id)) {
      or.push({ _id: id });
    }
    const deleted = await Genre.findOneAndDelete({ $or: or });
    if (!deleted) {
      return ApiResponse.error(res, "Genre not found", 404);
    }
    return ApiResponse.success(res, null, "Genre deleted");
  } catch (e) {
    return ApiResponse.error(res, e.message, 400);
  }
});

// --- Genre ---
app.get("/api/genres", (req, res) => genre.getAll(req, res));
app.post("/api/genres", (req, res) => genre.create(req, res));
app.delete("/api/genres/:id", (req, res) => genre.delete(req, res));

// --- Showtime ---
app.get("/api/showtimes/:id", (req, res) => showtime.getById(req, res));
app.post("/api/showtimes", authenticate, authorize([UserRole.MANAGER, UserRole.ADMIN]), (req, res) => showtime.create(req, res));
app.put("/api/showtimes/:id", authenticate, authorize([UserRole.MANAGER, UserRole.ADMIN]), (req, res) => showtime.update(req, res));
app.delete("/api/showtimes/:id", authenticate, authorize([UserRole.MANAGER, UserRole.ADMIN]), (req, res) => showtime.delete(req, res));

// --- Pricing ---
app.post("/api/pricing/calculate", (req, res) => pricing.calculate(req, res));

// --- News ---
app.get("/api/news", (req, res) => news.getAll(req, res));
app.get("/api/news/:id", (req, res) => news.getById(req, res));
app.post("/api/manager/news", authenticate, authorize([UserRole.MANAGER, UserRole.ADMIN]), (req, res) => news.create(req, res));
app.put("/api/manager/news/:id", authenticate, authorize([UserRole.MANAGER, UserRole.ADMIN]), (req, res) => news.update(req, res));
app.patch("/api/manager/news/:id/publish", authenticate, authorize([UserRole.MANAGER, UserRole.ADMIN]), (req, res) => news.togglePublish(req, res));
app.delete("/api/manager/news/:id", authenticate, authorize([UserRole.MANAGER, UserRole.ADMIN]), (req, res) => news.delete(req, res));

// --- Banner Routes ---
app.get("/api/banners", (req, res) => banner.getAll(req, res));
app.post("/api/manager/banners/upload", authenticate, authorize([UserRole.MANAGER, UserRole.ADMIN]), (req, res) => banner.uploadBanner(req, res));
app.post("/api/manager/banners", authenticate, authorize([UserRole.MANAGER, UserRole.ADMIN]), (req, res) => banner.create(req, res));
app.put("/api/manager/banners/:id", authenticate, authorize([UserRole.MANAGER, UserRole.ADMIN]), (req, res) => banner.update(req, res));
app.patch("/api/manager/banners/:id/toggle", authenticate, authorize([UserRole.MANAGER, UserRole.ADMIN]), (req, res) => banner.toggle(req, res));
app.delete("/api/manager/banners/:id", authenticate, authorize([UserRole.MANAGER, UserRole.ADMIN]), (req, res) => banner.delete(req, res));

// --- Dashboard ---
app.get("/api/manager/dashboard/summary", authenticate, authorize([UserRole.MANAGER, UserRole.ADMIN]), (req, res) => dashboard.getSummary(req, res));
app.get("/api/manager/dashboard/movies", authenticate, authorize([UserRole.MANAGER, UserRole.ADMIN]), (req, res) => dashboard.getMovieStats(req, res));
app.get("/api/manager/dashboard/export", authenticate, authorize([UserRole.MANAGER, UserRole.ADMIN]), (req, res) => dashboard.exportSummary(req, res));

// --- Hall ---
app.get("/api/manager/halls", (req, res) => hallManager.getAllHalls(req, res));
app.get("/api/manager/halls/:id", (req, res) => hallManager.getHallById(req, res));
app.post("/api/manager/halls", (req, res) => hallManager.createHall(req, res));
app.put("/api/manager/halls/:id", (req, res) => hallManager.updateHall(req, res));
app.delete("/api/manager/halls/:id", (req, res) => hallManager.deleteHall(req, res));
app.get("/api/manager/halls/:id/layout", authenticate, authorize([UserRole.MANAGER, UserRole.ADMIN]), (req, res) => hallManager.getSeatLayout(req, res));
app.post("/api/manager/halls/:id/layout", authenticate, authorize([UserRole.MANAGER, UserRole.ADMIN]), (req, res) => hallManager.setSeatLayout(req, res));

// --- Pricing rules ---
app.get("/api/manager/pricing/:showtimeId", authenticate, authorize([UserRole.MANAGER, UserRole.ADMIN]), (req, res) => pricingManager.getByShowtime(req, res));
app.post("/api/manager/pricing", authenticate, authorize([UserRole.MANAGER, UserRole.ADMIN]), (req, res) => pricingManager.setRules(req, res));
app.delete("/api/manager/pricing/:showtimeId", authenticate, authorize([UserRole.MANAGER, UserRole.ADMIN]), (req, res) => pricingManager.deleteByShowtime(req, res));

// --- Review Moderation ---
app.get("/api/reviews", (req, res) => review.getAll(req, res));
app.get("/api/movies/:movieId/reviews", (req, res) => review.getByMovie(req, res));
app.patch("/api/reviews/:id/moderate", (req, res) => review.moderate(req, res));
app.delete("/api/reviews/:id", (req, res) => review.delete(req, res));

// --- Seed Route (Dev only) ---
app.post("/api/seed", async (_req, res) => {
  try {
    const hallCount = await Hall.countDocuments();
    const genreCount = await Genre.countDocuments();

    if (hallCount === 0) {
      await Hall.insertMany([
        { name: "Cinema 1", capacity: 100, type: "Standard" },
        { name: "Cinema 2", capacity: 80, type: "Standard" },
        { name: "IMAX Hall", capacity: 200, type: "IMAX" },
      ]);
    }

    if (genreCount === 0) {
      await Genre.insertMany([
        { name: "Action" },
        { name: "Drama" },
        { name: "Comedy" },
        { name: "Horror" },
        { name: "Sci-Fi" },
      ]);
    }

    return res.json({ message: "Seed data created successfully" });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// --- Health Check ---
app.get("/", (_req, res) =>
  res.json({ status: "ok", message: "Cinema API running" })
);

module.exports = app;
