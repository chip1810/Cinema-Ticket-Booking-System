// app.js
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const { connectMongo } = require("./mongo");

// Routes
const staffRouter = require("./modules/staff/routes/StaffRouter");
const seatRouter = require("./modules/seat/routes/SeatRoute");
const adminRoutes = require("./modules/admin/routes/admin.routes");
const showtimeRoutes = require("./modules/showtime/routes/showtimeRoutes");
const voucherRoutes = require("./modules/voucher/routes/voucherRoutes");
const concessionRoutes = require("./modules/concession/routes/concessionRoutes");
const orderRoutes = require("./modules/order/routes/orderRoutes");

// Controllers
const AuthController = require("./modules/auth/controllers/AuthController");
const MovieController = require("./modules/movie/controllers/MovieController");
const ShowtimeController = require("./controllers/ShowtimeController");
const PricingController = require("./controllers/PricingController");
const HallManagerController = require("./controllers/HallManagerController");
const PricingManagerController = require("./controllers/PricingManagerController");
const NewsController = require("./controllers/NewsController");
const BannerController = require("./controllers/BannerController");
const DashboardController = require("./controllers/DashboardController");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());

// Routes
app.use("/api/showtimes", showtimeRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/concessions", concessionRoutes);
app.use("/api/staff", staffRouter);
app.use("/api/seat", seatRouter);
app.use("/api/vouchers", voucherRoutes);

// Controllers instance
const auth = new AuthController();
const movie = new MovieController();
const showtime = new ShowtimeController();
const pricing = new PricingController();
const hallManager = new HallManagerController();
const pricingManager = new PricingManagerController();
const news = new NewsController();
const banner = new BannerController();
const dashboard = new DashboardController();

// --- Auth ---
app.post("/api/auth/register", (req, res) => auth.register(req, res));
app.post("/api/auth/login", (req, res) => auth.login(req, res));
app.post("/api/auth/forgot-password", (req, res) => auth.forgotPassword(req, res));
app.post("/api/auth/reset-password", (req, res) => auth.resetPassword(req, res));

// --- Movie ---
app.get("/api/movies", (req, res) => movie.getAll(req, res));
app.get("/api/movies/:id", (req, res) => movie.getById(req, res));
app.post("/api/movies", (req, res) => movie.create(req, res));
app.put("/api/movies/:id", (req, res) => movie.update(req, res));
app.delete("/api/movies/:id", (req, res) => movie.delete(req, res));
app.get("/api/movies/uuid/:uuid", (req, res) => movie.getByUUID(req, res));

// --- Showtime ---
app.get("/api/showtimes/:id", (req, res) => showtime.getById(req, res));
app.post("/api/showtimes", (req, res) => showtime.create(req, res));
app.put("/api/showtimes/:id", (req, res) => showtime.update(req, res));
app.delete("/api/showtimes/:id", (req, res) => showtime.delete(req, res));

// --- Pricing ---
app.post("/api/pricing/calculate", (req, res) => pricing.calculate(req, res));

// --- News ---
app.get("/api/news", (req, res) => news.getAll(req, res));
app.get("/api/news/:id", (req, res) => news.getById(req, res));
app.post("/api/manager/news", (req, res) => news.create(req, res));
app.put("/api/manager/news/:id", (req, res) => news.update(req, res));
app.patch("/api/manager/news/:id/publish", (req, res) => news.togglePublish(req, res));
app.delete("/api/manager/news/:id", (req, res) => news.delete(req, res));

// --- Banner ---
app.get("/api/banners", (req, res) => banner.getAll(req, res));
app.post("/api/manager/banners", (req, res) => banner.create(req, res));
app.put("/api/manager/banners/:id", (req, res) => banner.update(req, res));
app.patch("/api/manager/banners/:id/toggle", (req, res) => banner.toggle(req, res));
app.delete("/api/manager/banners/:id", (req, res) => banner.delete(req, res));

// --- Dashboard ---
app.get("/api/manager/dashboard/summary", (req, res) => dashboard.getSummary(req, res));
app.get("/api/manager/dashboard/movies", (req, res) => dashboard.getMovieStats(req, res));

// --- Hall ---
app.get("/api/manager/halls", (req, res) => hallManager.getAllHalls(req, res));
app.get("/api/manager/halls/:id", (req, res) => hallManager.getHallById(req, res));
app.post("/api/manager/halls", (req, res) => hallManager.createHall(req, res));
app.put("/api/manager/halls/:id", (req, res) => hallManager.updateHall(req, res));
app.delete("/api/manager/halls/:id", (req, res) => hallManager.deleteHall(req, res));

// --- Pricing rules ---
app.get("/api/manager/pricing/:showtimeId", (req, res) => pricingManager.getByShowtime(req, res));
app.post("/api/manager/pricing", (req, res) => pricingManager.setRules(req, res));
app.delete("/api/manager/pricing/:showtimeId", (req, res) => pricingManager.deleteByShowtime(req, res));

// --- Health check ---
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Cinema API running" });
});

module.exports = app;