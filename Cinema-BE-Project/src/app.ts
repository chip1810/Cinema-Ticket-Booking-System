import "reflect-metadata";
import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import * as dotenv from "dotenv";
import { AppDataSource } from "./data-source";

// Controllers
import { AuthController } from "./modules/auth/controllers/AuthController";
import { MovieController } from "./modules/movie/controllers/MovieController";
import { showtimeController } from "./modules/showtime/controllers/showtimeController";
import { PricingController } from "./modules/pricing_rule/controllers/PricingController";
import { HallManagerController } from "./modules/hall/controllers/HallManagerController";
import { PricingManagerController } from "./modules/pricing_rule/controllers/PricingManagerController";
import { NewsController } from "./modules/news/controllers/NewsController";
import { BannerController } from "./modules/banner/controllers/BannerController";
import { DashboardController } from "./modules/manager/controllers/DashboardController";
import { ReviewController } from "./modules/review/controllers/ReviewController";
import { GenreController } from "./modules/genre/controllers/GenreController";
import { ConcessionController } from "./modules/concession/controllers/ConcessionController";

import staffRouter from "./modules/staff/routes/StaffRouter";
import seatRouter from "./modules/seat/routes/SeatRoute"

// Seed entities
import { Hall } from "./modules/hall/models/Hall";
import { Genre } from "./modules/genre/models/Genre";
// Routes
import showtimeRoutes from "./modules/showtime/routes/showtimeRoutes";

dotenv.config();

export const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cors());
app.use(helmet());
app.use("/api/showtimes", showtimeRoutes);


// --- Controller instances ---
const auth = new AuthController();
const movie = new MovieController();
// const showtime = new ShowtimeController(); // Removed as showtimeController is an object
const concession = new ConcessionController();
const pricing = new PricingController();
const hallManager = new HallManagerController();
const pricingManager = new PricingManagerController();
const news = new NewsController();
const banner = new BannerController();
const dashboard = new DashboardController();
const genre = new GenreController();
const review = new ReviewController();

// --- Auth Routes ---
app.post("/api/auth/register", (req, res) => auth.register(req, res));
app.post("/api/auth/login", (req, res) => auth.login(req, res));
app.post("/api/auth/forgot-password", (req, res) => auth.forgotPassword(req, res));
app.post("/api/auth/reset-password", (req, res) => auth.resetPassword(req, res));

// --- Movie Routes ---
app.get("/api/movies", (req, res) => movie.getAll(req, res));
app.get("/api/movies/:id", (req, res) => movie.getById(req, res));
app.post("/api/movies", (req, res) => movie.create(req, res));
app.put("/api/movies/:id", (req, res) => movie.update(req, res));
app.delete("/api/movies/:id", (req, res) => movie.delete(req, res));

// --- Genre Routes ---
app.get("/api/genres", (req, res) => genre.getAll(req, res));
app.post("/api/genres", (req, res) => genre.create(req, res));
app.delete("/api/genres/:id", (req, res) => genre.delete(req, res));

// --- Manager Showtime Routes (Using showtimeController object) ---
app.get("/api/manager/showtimes", (req, res) => showtimeController.getAll(req, res));
app.get("/api/manager/showtimes/movie/:movieId", (req, res) => showtimeController.getByMovieId(req, res));
app.get("/api/manager/showtimes/nearest", (req, res) => showtimeController.getNearest(req, res));


// --- Concession Routes ---
app.get("/api/concessions", (req, res) => concession.getAll(req, res));
app.get("/api/concessions/:id", (req, res) => concession.getById(req, res));
app.post("/api/concessions", (req, res) => concession.create(req, res));
app.put("/api/concessions/:id", (req, res) => concession.update(req, res));
app.patch("/api/concessions/:id/stock", (req, res) => concession.updateStock(req, res));
app.delete("/api/concessions/:id", (req, res) => concession.delete(req, res));


// --- Pricing Route ---
app.post("/api/pricing/calculate", (req, res) => pricing.calculate(req, res));

// --- News Routes ---
app.get("/api/news", (req, res) => news.getAll(req, res));
app.get("/api/news/:id", (req, res) => news.getById(req, res));
app.post("/api/manager/news", (req, res) => news.create(req, res));
app.put("/api/manager/news/:id", (req, res) => news.update(req, res));
app.patch("/api/manager/news/:id/publish", (req, res) => news.togglePublish(req, res));
app.delete("/api/manager/news/:id", (req, res) => news.delete(req, res));

// --- Banner Routes ---
app.get("/api/banners", (req, res) => banner.getAll(req, res));            // public
app.post("/api/manager/banners", (req, res) => banner.create(req, res));
app.put("/api/manager/banners/:id", (req, res) => banner.update(req, res));
app.patch("/api/manager/banners/:id/toggle", (req, res) => banner.toggle(req, res));
app.delete("/api/manager/banners/:id", (req, res) => banner.delete(req, res));

// --- Manager Dashboard Routes ---
app.get("/api/manager/dashboard/summary", (req, res) => dashboard.getSummary(req, res));
app.get("/api/manager/dashboard/movies", (req, res) => dashboard.getMovieStats(req, res));

//Staff Routes
app.use("/api/staff", staffRouter);
app.use("/api/seat", seatRouter);

// --- Manager Hall & Seat Layout Routes ---
app.get("/api/manager/halls", (req, res) => hallManager.getAllHalls(req, res));
app.get("/api/manager/halls/:id", (req, res) => hallManager.getHallById(req, res));
app.post("/api/manager/halls", (req, res) => hallManager.createHall(req, res));
app.put("/api/manager/halls/:id", (req, res) => hallManager.updateHall(req, res));
app.delete("/api/manager/halls/:id", (req, res) => hallManager.deleteHall(req, res));
app.post("/api/manager/halls/:id/layout", (req, res) => hallManager.setSeatLayout(req, res));
app.get("/api/manager/halls/:id/layout", (req, res) => hallManager.getSeatLayout(req, res));

// --- Manager Pricing Rules ---
app.get("/api/manager/pricing/:showtimeId", (req, res) => pricingManager.getByShowtime(req, res));
app.post("/api/manager/pricing", (req, res) => pricingManager.setRules(req, res));
app.delete("/api/manager/pricing/:showtimeId", (req, res) => pricingManager.deleteByShowtime(req, res));

// --- Review Moderation Routes ---
app.get("/api/reviews", (req, res) => review.getAll(req, res));
app.patch("/api/reviews/:id/moderate", (req, res) => review.moderate(req, res));
app.delete("/api/reviews/:id", (req, res) => review.delete(req, res));

// --- Health Check ---
app.get("/", (_req, res) => res.json({ status: "ok", message: "Cinema API running" }));

