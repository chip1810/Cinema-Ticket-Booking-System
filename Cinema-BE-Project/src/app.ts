import "reflect-metadata";
import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import * as dotenv from "dotenv";
import { AppDataSource } from "./data-source";

// Controllers
import { AuthController } from "./modules/auth/controllers/AuthController";
import { MovieController } from "./modules/movie/controllers/MovieController";
import { ShowtimeController } from "./controllers/ShowtimeController";
import { ConcessionController } from "./controllers/ConcessionController";
import { PricingController } from "./controllers/PricingController";
import { HallManagerController } from "./controllers/HallManagerController";
import { PricingManagerController } from "./controllers/PricingManagerController";
import { NewsController } from "./controllers/NewsController";
import { BannerController } from "./controllers/BannerController";
import { DashboardController } from "./controllers/DashboardController";
import staffRouter from "./modules/staff/routes/StaffRouter";
import seatRouter from "./modules/seat/routes/SeatRoute"
import showtimeRoutes from "./modules/showtime/routes/showtimeRoutes";
import voucherRoutes from "./modules/voucher/routes/voucherRoutes";

import adminRoutes from "./modules/admin/routes/admin.routes";

// Seed entities
import { Hall } from "./modules/hall/models/Hall";
import { Genre } from "./modules/genre/models/Genre";
// Routes


dotenv.config();

export const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use("/api/showtimes", showtimeRoutes);
app.use("/api/admin", adminRoutes);

// --- Controller instances ---
const auth = new AuthController();
const movie = new MovieController();
const showtime = new ShowtimeController();
const concession = new ConcessionController();
const pricing = new PricingController();
const hallManager = new HallManagerController();
const pricingManager = new PricingManagerController();
const news = new NewsController();
const banner = new BannerController();
const dashboard = new DashboardController();

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

// --- Manager Showtime Routes (Create / Update / Cancel) ---
app.get("/api/showtimes/:id", (req, res) => showtime.getById(req, res));
app.post("/api/showtimes", (req, res) => showtime.create(req, res));
app.put("/api/showtimes/:id", (req, res) => showtime.update(req, res));
app.delete("/api/showtimes/:id", (req, res) => showtime.delete(req, res));


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
app.use("/api/seat", seatRouter)
app.use("/api/vouchers", voucherRoutes);


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

// --- Seed Route (Dev only) ---
app.post("/api/seed", async (req: Request, res: Response) => {
    try {
        const hallRepo = AppDataSource.getRepository(Hall);
        const genreRepo = AppDataSource.getRepository(Genre);

        if (await hallRepo.count() === 0) {
            await hallRepo.save([
                { name: "Cinema 1", capacity: 100, type: "Standard" },
                { name: "Cinema 2", capacity: 80, type: "Standard" },
                { name: "IMAX Hall", capacity: 200, type: "IMAX" },
            ]);
        }
        if (await genreRepo.count() === 0) {
            await genreRepo.save([
                { name: "Action" },
                { name: "Drama" },
                { name: "Comedy" },
                { name: "Horror" },
                { name: "Sci-Fi" },
            ]);
        }
        return res.json({ message: "Seed data created successfully" });
    } catch (e: any) {
        return res.status(500).json({ error: e.message });
    }
});

// --- Health Check ---
app.get("/", (_req, res) => res.json({ status: "ok", message: "Cinema API running" }));

// --- Start Server ---

